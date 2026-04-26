import { prisma } from '../../config/database'

export async function listBackgrounds(orgId: string) {
  return prisma.spotBackground.findMany({
    where: { orgId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })
}

export async function createBackground(orgId: string, name: string, imageUrl: string) {
  return prisma.spotBackground.create({ data: { orgId, name, imageUrl } })
}

export async function deleteBackground(orgId: string, id: string) {
  const bg = await prisma.spotBackground.findFirst({ where: { id, orgId } })
  if (!bg) throw Object.assign(new Error('Background not found'), { code: 'NOT_FOUND' })
  if (bg.isDefault) throw Object.assign(new Error('Cannot delete the default background'), { code: 'VALIDATION_ERROR' })
  await prisma.spotBackground.delete({ where: { id } })
}
