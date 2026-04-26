import { z } from 'zod'

const participantSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('user'), userId: z.string(), name: z.string(), email: z.string(), photoUrl: z.string().nullable().optional() }),
  z.object({ type: z.literal('freeText'), name: z.string().min(1, 'Name required'), email: z.string().email('Valid email required') }),
])

export const spotFormSchema = z.object({
  winners: z.array(participantSchema).min(1, 'At least one winner required'),
  senders: z.array(participantSchema).min(1, 'At least one sender required'),
  badges: z.array(z.string()).min(1, 'At least one badge required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  backgroundId: z.string().optional(),
  photo: z.instanceof(File).optional(),
})

export const registerSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})

export const userFormSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
})

export type SpotFormValues = z.infer<typeof spotFormSchema>
export type Participant = z.infer<typeof participantSchema>
