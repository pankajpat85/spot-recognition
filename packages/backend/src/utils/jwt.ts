import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { OrgPlan } from '@prisma/client'

export interface AccessTokenPayload {
  userId: string
  orgId: string
  isAdmin: boolean
  orgPlan: OrgPlan
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' })
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
  } catch {
    return null
  }
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string }
  } catch {
    return null
  }
}
