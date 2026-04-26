import nodemailer, { Transporter } from 'nodemailer'
import { env } from '../../config/env'
import { decrypt } from '../../utils/crypto'

interface SendEmailOptions {
  to: string | string[]
  cc?: string | string[]
  subject: string
  html: string
  attachments?: nodemailer.SendMailOptions['attachments']
}

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  encryptedPass: string
}

function getPlatformTransport(): Transporter {
  return nodemailer.createTransport({
    host: env.PLATFORM_SMTP_HOST,
    port: env.PLATFORM_SMTP_PORT,
    secure: env.PLATFORM_SMTP_SECURE,
    auth: env.PLATFORM_SMTP_USER
      ? { user: env.PLATFORM_SMTP_USER, pass: env.PLATFORM_SMTP_PASS }
      : undefined,
  })
}

function getOrgTransport(config: SmtpConfig): Transporter {
  const pass = decrypt(config.encryptedPass)
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass },
  })
}

export async function sendEmail(options: SendEmailOptions, orgSmtpConfig?: SmtpConfig | null, fromEmail?: string, fromName?: string) {
  const transport = orgSmtpConfig ? getOrgTransport(orgSmtpConfig) : getPlatformTransport()
  const from = `"${fromName ?? env.PLATFORM_FROM_NAME}" <${fromEmail ?? env.PLATFORM_FROM_EMAIL}>`

  await transport.sendMail({
    from,
    to: options.to,
    cc: options.cc,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  })
}

export async function testSmtpConfig(config: SmtpConfig, toEmail: string) {
  const transport = getOrgTransport(config)
  await transport.verify()
  await transport.sendMail({
    from: `"Spot Recognition" <${config.user}>`,
    to: toEmail,
    subject: 'SMTP Test — Spot Recognition',
    html: '<p>Your SMTP configuration is working correctly.</p>',
  })
}
