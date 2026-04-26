import { prisma } from '../../config/database'
import { parseCsvUsers } from '../../utils/csvParser'
import type { CreateUserInput, UpdateUserInput } from './users.schema'

const safeSelect = {
  id: true, orgId: true, name: true, email: true, photoUrl: true,
  isAdmin: true, isAdSync: true, azureAdId: true, createdAt: true, updatedAt: true,
}

export async function listUsers(orgId: string, search?: string, limit = 20, page = 1) {
  const where = {
    orgId,
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: safeSelect, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
    prisma.user.count({ where }),
  ])

  return { users, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function createUser(orgId: string, input: CreateUserInput, photoUrl?: string) {
  const existing = await prisma.user.findFirst({ where: { orgId, email: input.email.toLowerCase(), deletedAt: null } })
  if (existing) throw Object.assign(new Error('User with this email already exists'), { code: 'CONFLICT' })

  return prisma.user.create({
    data: { orgId, name: input.name, email: input.email.toLowerCase(), photoUrl },
    select: safeSelect,
  })
}

export async function getUser(orgId: string, id: string) {
  const user = await prisma.user.findFirst({ where: { id, orgId, deletedAt: null }, select: safeSelect })
  if (!user) throw Object.assign(new Error('User not found'), { code: 'NOT_FOUND' })
  return user
}

export async function updateUser(orgId: string, id: string, input: UpdateUserInput, photoUrl?: string) {
  const user = await prisma.user.findFirst({ where: { id, orgId, deletedAt: null } })
  if (!user) throw Object.assign(new Error('User not found'), { code: 'NOT_FOUND' })

  if (input.email && input.email !== user.email) {
    const conflict = await prisma.user.findFirst({ where: { orgId, email: input.email.toLowerCase(), deletedAt: null, id: { not: id } } })
    if (conflict) throw Object.assign(new Error('Email already in use'), { code: 'CONFLICT' })
  }

  return prisma.user.update({
    where: { id },
    data: { ...input, ...(photoUrl && { photoUrl }) },
    select: safeSelect,
  })
}

export async function deleteUser(orgId: string, id: string) {
  const user = await prisma.user.findFirst({ where: { id, orgId, deletedAt: null } })
  if (!user) throw Object.assign(new Error('User not found'), { code: 'NOT_FOUND' })
  await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function importCsv(orgId: string, buffer: Buffer) {
  const rows = parseCsvUsers(buffer)
  let created = 0, updated = 0, skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      if (!row.name || !row.email) { skipped++; continue }
      const existing = await prisma.user.findFirst({ where: { orgId, email: row.email } })
      if (existing) {
        if (existing.deletedAt) { skipped++; continue }
        await prisma.user.update({ where: { id: existing.id }, data: { name: row.name, isAdSync: true } })
        updated++
      } else {
        await prisma.user.create({ data: { orgId, name: row.name, email: row.email, isAdSync: true } })
        created++
      }
    } catch {
      errors.push(`Row ${row.email}: failed to import`)
    }
  }

  return { created, updated, skipped, errors, total: rows.length }
}
