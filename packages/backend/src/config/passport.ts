import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from './database'
import { env } from './env'
import { comparePassword } from '../utils/bcrypt'

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), deletedAt: null },
        include: { org: true },
      })
      if (!user || !user.passwordHash) return done(null, false, { message: 'Invalid credentials' })
      const valid = await comparePassword(password, user.passwordHash)
      if (!valid) return done(null, false, { message: 'Invalid credentials' })
      return done(null, user as unknown as Express.User)
    } catch (err) {
      return done(err)
    }
  })
)

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()
          if (!email) return done(new Error('No email from Google'))

          let user = await prisma.user.findFirst({
            where: { googleId: profile.id, deletedAt: null },
            include: { org: true },
          })

          if (!user) {
            user = await prisma.user.findFirst({
              where: { email, deletedAt: null },
              include: { org: true },
            })
            if (user) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id },
                include: { org: true },
              })
            }
          }

          if (!user) return done(null, false, { message: 'No account found. Please register your organization first.' })
          return done(null, user as unknown as Express.User)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
}

export default passport
