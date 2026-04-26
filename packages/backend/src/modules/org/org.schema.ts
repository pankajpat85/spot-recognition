import { z } from 'zod'

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  fromEmail: z.string().email().optional().or(z.literal('')),
  fromName: z.string().max(100).optional(),
})

export const smtpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().min(1).max(65535),
  secure: z.boolean().default(false),
  user: z.string().min(1),
  pass: z.string().min(1),
})

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>
export type SmtpConfigInput = z.infer<typeof smtpConfigSchema>
