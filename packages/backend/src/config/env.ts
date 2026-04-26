import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  PLATFORM_SMTP_HOST: z.string().optional(),
  PLATFORM_SMTP_PORT: z.coerce.number().default(587),
  PLATFORM_SMTP_SECURE: z.string().transform(v => v === 'true').default('false'),
  PLATFORM_SMTP_USER: z.string().optional(),
  PLATFORM_SMTP_PASS: z.string().optional(),
  PLATFORM_FROM_EMAIL: z.string().default('noreply@spotrecognition.app'),
  PLATFORM_FROM_NAME: z.string().default('Spot Recognition'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:3001/api/auth/google/callback'),

  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_TENANT_ID: z.string().default('common'),
  MICROSOFT_CALLBACK_URL: z.string().default('http://localhost:3001/api/auth/microsoft/callback'),

  ENCRYPTION_KEY: z.string().length(32).optional(),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
