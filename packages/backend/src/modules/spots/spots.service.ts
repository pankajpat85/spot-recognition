import { prisma } from '../../config/database'
import { Prisma } from '@prisma/client'
import { sendEmail } from '../email/email.service'
import { spotRecognitionTemplate } from '../email/templates/spot-recognition'
import type { CreateSpotInput, Participant } from './spots.schema'
import fs from 'fs'
import path from 'path'

const SPOT_LIMIT_FREE = 10

const spotInclude = {
  winners: { include: { user: { select: { id: true, name: true, email: true, photoUrl: true } } } },
  senders: { include: { user: { select: { id: true, name: true, email: true, photoUrl: true } } } },
  badges: true,
  background: true,
  createdBy: { select: { id: true, name: true, email: true } },
}

export async function listSpots(orgId: string, query: { page: number; limit: number; search?: string; badgeValue?: string; from?: string; to?: string }) {
  const where = {
    orgId,
    deletedAt: null,
    ...(query.search && {
      winners: { some: { OR: [{ freeTextName: { contains: query.search, mode: 'insensitive' as const } }, { user: { name: { contains: query.search, mode: 'insensitive' as const } } }] } },
    }),
    ...(query.badgeValue && { badges: { some: { badgeValue: query.badgeValue } } }),
    ...(query.from && { startDate: { gte: new Date(query.from) } }),
    ...(query.to && { endDate: { lte: new Date(query.to) } }),
  }

  const [spots, total] = await Promise.all([
    prisma.spotRecognition.findMany({ where, include: spotInclude, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: 'desc' } }),
    prisma.spotRecognition.count({ where }),
  ])

  return { spots, total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) }
}

export async function createSpot(orgId: string, createdByUserId: string, input: CreateSpotInput) {
  const org = await prisma.org.findUnique({ where: { id: orgId } })
  if (!org) throw Object.assign(new Error('Org not found'), { code: 'NOT_FOUND' })

  if (org.plan === 'FREE') {
    const now = new Date()
    if (!org.planResetAt || org.planResetAt < now) {
      await prisma.org.update({ where: { id: orgId }, data: { spotsUsedThisMonth: 0, planResetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1) } })
    } else if (org.spotsUsedThisMonth >= SPOT_LIMIT_FREE) {
      throw Object.assign(new Error(`Free plan allows ${SPOT_LIMIT_FREE} spots per month`), { code: 'PLAN_GATE' })
    }
  }

  const spot = await prisma.$transaction(async tx => {
    const record = await tx.spotRecognition.create({
      data: {
        orgId, createdByUserId,
        description: input.description,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        backgroundId: input.backgroundId,
      },
    })

    for (const winner of input.winners) {
      await createParticipant(tx, orgId, record.id, winner, 'winner')
    }
    for (const sender of input.senders) {
      await createParticipant(tx, orgId, record.id, sender, 'sender')
    }
    for (const badge of input.badges) {
      await tx.spotBadge.create({ data: { spotId: record.id, badgeValue: badge } })
    }

    return record
  })

  if (org.plan === 'FREE') {
    await prisma.org.update({ where: { id: orgId }, data: { spotsUsedThisMonth: { increment: 1 } } })
  }

  return getSpot(orgId, spot.id)
}

async function createParticipant(tx: Prisma.TransactionClient, orgId: string, spotId: string, participant: Participant, role: 'winner' | 'sender') {
  if (participant.type === 'user') {
    if (role === 'winner') {
      await tx.spotWinner.create({ data: { spotId, userId: participant.userId } })
    } else {
      await tx.spotSender.create({ data: { spotId, userId: participant.userId } })
    }
  } else {
    let user = await tx.user.findFirst({ where: { orgId, email: participant.email.toLowerCase(), deletedAt: null } })
    if (!user) {
      user = await tx.user.create({ data: { orgId, name: participant.name, email: participant.email.toLowerCase() } })
    }
    if (role === 'winner') {
      await tx.spotWinner.create({ data: { spotId, userId: user.id, freeTextName: participant.name, freeTextEmail: participant.email } })
    } else {
      await tx.spotSender.create({ data: { spotId, userId: user.id, freeTextName: participant.name, freeTextEmail: participant.email } })
    }
  }
}

export async function getSpot(orgId: string, id: string) {
  const spot = await prisma.spotRecognition.findFirst({ where: { id, orgId, deletedAt: null }, include: spotInclude })
  if (!spot) throw Object.assign(new Error('Spot not found'), { code: 'NOT_FOUND' })
  return spot
}

export async function deleteSpot(orgId: string, id: string) {
  const spot = await prisma.spotRecognition.findFirst({ where: { id, orgId, deletedAt: null } })
  if (!spot) throw Object.assign(new Error('Spot not found'), { code: 'NOT_FOUND' })
  await prisma.spotRecognition.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function saveSpotImage(orgId: string, id: string, filePath: string) {
  const spot = await prisma.spotRecognition.findFirst({ where: { id, orgId, deletedAt: null } })
  if (!spot) throw Object.assign(new Error('Spot not found'), { code: 'NOT_FOUND' })
  await prisma.spotRecognition.update({ where: { id }, data: { imageUrl: filePath } })
}

export async function sendSpot(orgId: string, id: string) {
  const spot = await getSpot(orgId, id)
  if (!spot.imageUrl) throw Object.assign(new Error('Generate the image before sending'), { code: 'VALIDATION_ERROR' })

  const org = await prisma.org.findUnique({ where: { id: orgId } })
  if (!org) throw Object.assign(new Error('Org not found'), { code: 'NOT_FOUND' })

  const winnerEmails = spot.winners.map(w => w.user?.email ?? w.freeTextEmail).filter(Boolean) as string[]
  const winnerNames: string[] = spot.winners.map(w => w.user?.name ?? w.freeTextName ?? '')
  const senderName = spot.senders[0]?.user?.name ?? spot.senders[0]?.freeTextName ?? 'Someone'
  const senderEmail = spot.senders[0]?.user?.email ?? spot.senders[0]?.freeTextEmail

  if (!winnerEmails.length) throw Object.assign(new Error('No valid winner emails'), { code: 'VALIDATION_ERROR' })

  const imageBuffer = fs.readFileSync(path.join(process.cwd(), spot.imageUrl.replace('/uploads/', 'uploads/')))
  const cid = 'walloffame'

  const html = spotRecognitionTemplate({
    orgName: org.name,
    winners: winnerNames.map(name => ({ name })),
    senderName,
    description: spot.description,
    startDate: spot.startDate.toLocaleDateString('en-GB'),
    endDate: spot.endDate.toLocaleDateString('en-GB'),
    imageAttachmentCid: cid,
  })

  await sendEmail(
    {
      to: winnerEmails,
      cc: senderEmail ?? undefined,
      subject: `${org.name} — Spot Recognition Award 🏆`,
      html,
      attachments: [{ filename: 'wall-of-fame.png', content: imageBuffer, cid }],
    },
    org.smtpConfig as Parameters<typeof sendEmail>[1],
    org.fromEmail ?? undefined,
    org.fromName ?? undefined
  )

  await prisma.spotRecognition.update({ where: { id }, data: { sentAt: new Date() } })
}

export async function getStats(orgId: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalSpots, sentThisMonth, topWinners, recentSpots] = await Promise.all([
    prisma.spotRecognition.count({ where: { orgId, deletedAt: null, sentAt: { not: null } } }),
    prisma.spotRecognition.count({ where: { orgId, deletedAt: null, sentAt: { gte: monthStart } } }),
    prisma.spotWinner.groupBy({ by: ['userId'], where: { spot: { orgId, deletedAt: null, sentAt: { gte: monthStart } } }, _count: true, orderBy: { _count: { userId: 'desc' } }, take: 5 }),
    prisma.spotRecognition.findMany({ where: { orgId, deletedAt: null }, include: { winners: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  return { totalSpots, sentThisMonth, topWinners, recentSpots }
}
