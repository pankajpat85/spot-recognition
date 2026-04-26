import { Router } from 'express'
import passport from 'passport'
import * as controller from './auth.controller'
import { authenticate } from '../../middleware/auth'
import { authRateLimiter } from '../../middleware/rateLimiter'

const router = Router()

router.post('/register', authRateLimiter, controller.register)
router.post('/login', authRateLimiter, controller.login)
router.post('/refresh', authRateLimiter, controller.refresh)
router.post('/logout', controller.logout)
router.post('/forgot-password', authRateLimiter, controller.forgotPassword)
router.post('/reset-password', authRateLimiter, controller.resetPassword)
router.get('/me', authenticate, controller.me)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback', controller.googleCallback)

export default router
