import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import passport from './config/passport'
import { env } from './config/env'
import { errorHandler, notFound } from './middleware/errorHandler'
import { apiRateLimiter } from './middleware/rateLimiter'

import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import spotsRoutes from './modules/spots/spots.routes'
import orgRoutes from './modules/org/org.routes'
import backgroundsRoutes from './modules/backgrounds/backgrounds.routes'
import badgesRoutes from './modules/badges/badges.routes'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(passport.initialize())

// Static file serving (CORS required for html2canvas)
app.use('/static', express.static(path.join(__dirname, 'assets'), {
  setHeaders: (res) => res.setHeader('Access-Control-Allow-Origin', '*'),
}))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => res.setHeader('Access-Control-Allow-Origin', '*'),
}))
app.use('/legacy', express.static(path.join(process.cwd(), '../../legacy')))

app.use('/api', apiRateLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/spots', spotsRoutes)
app.use('/api/history', spotsRoutes)
app.use('/api/org', orgRoutes)
app.use('/api/backgrounds', backgroundsRoutes)
app.use('/api/badges', badgesRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT}`)
})

export default app
