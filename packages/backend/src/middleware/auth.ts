import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import type { OrgPlan } from '@prisma/client'

export interface TokenUser {
  userId: string
  orgId: string
  isAdmin: boolean
  orgPlan: OrgPlan
}

declare global {
  namespace Express {
    interface User extends TokenUser {}
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', code: 'MISSING_TOKEN' })
    return
  }
  const token = auth.slice(7)
  const payload = verifyAccessToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN' })
    return
  }
  req.user = payload as Express.User
  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' })
    return
  }
  next()
}
