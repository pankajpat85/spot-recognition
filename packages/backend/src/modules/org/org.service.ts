import { prisma } from '../../config/database'
import { encrypt } from '../../utils/crypto'
import { testSmtpConfig } from '../email/email.service'
import type { UpdateOrgInput, SmtpConfigInput } from './org.schema'

export async function getOrg(orgId: string) {
  const org = await prisma.org.findUnique({ where: { id: orgId } })
  if (!org) throw Object.assign(new Error('Org not found'), { code: 'NOT_FOUND' })
  const { smtpConfig, ...safeOrg } = org
  const hasSmtp = !!(smtpConfig as Record<string, unknown> | null)?.host
  return { ...safeOrg, hasSmtpConfig: hasSmtp }
}

export async function updateOrg(orgId: string, input: UpdateOrgInput, logoUrl?: string) {
  return prisma.org.update({
    where: { id: orgId },
    data: { ...input, ...(logoUrl && { logoUrl }) },
    select: { id: true, name: true, slug: true, logoUrl: true, fromEmail: true, fromName: true, plan: true },
  })
}

export async function saveSmtpConfig(orgId: string, input: SmtpConfigInput) {
  const encryptedPass = encrypt(input.pass)
  const config = { host: input.host, port: input.port, secure: input.secure, user: input.user, encryptedPass }
  await prisma.org.update({ where: { id: orgId }, data: { smtpConfig: config } })
}

export async function testSmtp(orgId: string, toEmail: string) {
  const org = await prisma.org.findUnique({ where: { id: orgId } })
  if (!org?.smtpConfig) throw Object.assign(new Error('SMTP not configured'), { code: 'VALIDATION_ERROR' })
  await testSmtpConfig(org.smtpConfig as unknown as Parameters<typeof testSmtpConfig>[0], toEmail)
}
