import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import * as authService from './auth.service'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema'
import { prisma } from '../../config/database'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body)
    const result = await authService.register(input)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export function login(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('local', { session: false }, async (err: Error, user: { id: string; orgId: string } | false) => {
    if (err) return next(err)
    if (!user) return res.status(401).json({ error: 'Invalid credentials', code: 'UNAUTHORIZED' })
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { org: true } })
      if (!dbUser) return res.status(401).json({ error: 'User not found', code: 'UNAUTHORIZED' })
      const result = await authService.login(dbUser.id, dbUser.orgId)
      res.json(result)
    } catch (err) {
      next(err)
    }
  })(req, res, next)
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required', code: 'VALIDATION_ERROR' })
    const result = await authService.refresh(refreshToken)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body
    if (refreshToken) await authService.logout(refreshToken)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(email)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body)
    await authService.resetPassword(token, password)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { org: true },
    })
    if (!user) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' })
    const { passwordHash, ...safeUser } = user
    res.json(safeUser)
  } catch (err) {
    next(err)
  }
}

export function googleCallback(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', { session: false }, async (err: Error, user: { id: string; orgId: string } | false) => {
    if (err || !user) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`)
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { org: true } })
      if (!dbUser) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=no_account`)
      const result = await authService.login(dbUser.id, dbUser.orgId)
      const params = new URLSearchParams({ token: result.accessToken, refresh: result.refreshToken })
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`)
    } catch (err) {
      next(err)
    }
  })(req, res, next)
}
