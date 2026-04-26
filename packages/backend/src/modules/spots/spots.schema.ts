import { z } from 'zod'

const participantSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('user'), userId: z.string() }),
  z.object({ type: z.literal('freeText'), name: z.string().min(1), email: z.string().email() }),
])

export const createSpotSchema = z.object({
  winners: z.array(participantSchema).min(1),
  senders: z.array(participantSchema).min(1),
  badges: z.array(z.string()).min(1),
  description: z.string().min(5),
  startDate: z.string().datetime().or(z.string().date()),
  endDate: z.string().datetime().or(z.string().date()),
  backgroundId: z.string().optional(),
})

export const listSpotsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  badgeValue: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export type CreateSpotInput = z.infer<typeof createSpotSchema>
export type Participant = z.infer<typeof participantSchema>
