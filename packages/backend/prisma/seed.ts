import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding demo org...')

  const existingOrg = await prisma.org.findUnique({ where: { slug: 'demo' } })
  if (existingOrg) {
    console.log('Demo org already exists, skipping seed.')
    return
  }

  const org = await prisma.org.create({
    data: { name: 'Demo Organization', slug: 'demo' },
  })

  const passwordHash = await bcrypt.hash('Demo@1234', 12)
  await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Demo Admin',
      email: 'admin@demo.com',
      passwordHash,
      isAdmin: true,
    },
  })

  await prisma.spotBackground.create({
    data: {
      orgId: org.id,
      name: 'Default Background',
      imageUrl: '/static/backgrounds/default-background.png',
      isDefault: true,
    },
  })

  console.log('Demo org seeded. Login: admin@demo.com / Demo@1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
