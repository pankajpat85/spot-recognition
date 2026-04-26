import crypto from 'crypto'
import { prisma } from '../../config/database'
import { type OrgPlan } from '@prisma/client'
import { hashPassword } from '../../utils/bcrypt'
import { slugify } from '../../utils/slugify'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt'
import { sendEmail } from '../email/email.service'
import { env } from '../../config/env'
import type { RegisterInput } from './auth.schema'

const DEFAULT_BACKGROUND_URL = '/static/backgrounds/default-background.png'

export async function register(input: RegisterInput) {
  const slug = slugify(input.orgName)

  const existingOrg = await prisma.org.findUnique({ where: { slug } })
  if (existingOrg) throw Object.assign(new Error('Organization name already taken'), { code: 'CONFLICT' })

  const existingUser = await prisma.user.findFirst({
    where: { email: input.email.toLowerCase() },
  })
  if (existingUser) throw Object.assign(new Error('Email already registered'), { code: 'CONFLICT' })

  const passwordHash = await hashPassword(input.password)

  const result = await prisma.$transaction(async tx => {
    const org = await tx.org.create({
      data: { name: input.orgName, slug },
    })

    const user = await tx.user.create({
      data: {
        orgId: org.id,
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        isAdmin: true,
      },
    })

    await tx.spotBackground.create({
      data: {
        orgId: org.id,
        name: 'Default Background',
        imageUrl: DEFAULT_BACKGROUND_URL,
        isDefault: true,
      },
    })

    return { org, user }
  })

  return buildTokenResponse(result.user, result.org)
}

export async function login(userId: string, orgId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { org: true },
  })
  if (!user) throw Object.assign(new Error('User not found'), { code: 'NOT_FOUND' })
  return buildTokenResponse(user, user.org)
}

export async function refresh(rawRefreshToken: string) {
  const payload = verifyRefreshToken(rawRefreshToken)
  if (!payload) throw Object.assign(new Error('Invalid refresh token'), { code: 'UNAUTHORIZED' })

  const stored = await prisma.refreshToken.findUnique({ where: { token: rawRefreshToken } })
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('Refresh token expired or revoked'), { code: 'UNAUTHORIZED' })
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })

  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
    include: { org: true },
  })
  if (!user) throw Object.assign(new Error('User not found'), { code: 'UNAUTHORIZED' })

  return buildTokenResponse(user, user.org)
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } })
  if (!user) return

  const token = crypto.randomBytes(32).toString('hex')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`
  await sendEmail({
    to: user.email,
    subject: 'Reset your Spot Recognition password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  })
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired reset token'), { code: 'UNAUTHORIZED' })
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ])
}

async function buildTokenResponse(user: { id: string; orgId: string; isAdmin: boolean; name: string; email: string; photoUrl: string | null }, org: { id: string; name: string; slug: string; plan: OrgPlan }) {
  const accessToken = signAccessToken({
    userId: user.id,
    orgId: user.orgId,
    isAdmin: user.isAdmin,
    orgPlan: org.plan,
  })

  const rawRefreshToken = signRefreshToken(user.id)
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: rawRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: { id: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl, isAdmin: user.isAdmin, orgId: user.orgId },
    org: { id: org.id, name: org.name, slug: org.slug, plan: org.plan },
  }
}
