import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', code: 'VALIDATION_ERROR', details: err.flatten().fieldErrors })
    return
  }

  if (err instanceof Error) {
    const statusMap: Record<string, number> = {
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
    }
    const code = (err as Error & { code?: string }).code ?? 'INTERNAL_ERROR'
    const status = statusMap[code] ?? 500
    res.status(status).json({ error: err.message, code })
    return
  }

  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' })
}
