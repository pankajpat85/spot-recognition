import { Request, Response, NextFunction } from 'express'
import * as orgService from './org.service'
import { updateOrgSchema, smtpConfigSchema } from './org.schema'

export async function getOrg(req: Request, res: Response, next: NextFunction) {
  try { res.json(await orgService.getOrg(req.user!.orgId)) } catch (err) { next(err) }
}

export async function updateOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateOrgSchema.parse(req.body)
    const logoUrl = req.file ? `/uploads/${req.user!.orgId}/org/${req.file.filename}` : undefined
    res.json(await orgService.updateOrg(req.user!.orgId, input, logoUrl))
  } catch (err) { next(err) }
}

export async function updateSmtp(req: Request, res: Response, next: NextFunction) {
  try {
    const input = smtpConfigSchema.parse(req.body)
    await orgService.saveSmtpConfig(req.user!.orgId, input)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

export async function testSmtp(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await orgService.getOrg(req.user!.orgId)
    const user = req.user!
    const fullUser = (await import('../../config/database')).prisma.user.findUnique({ where: { id: user.userId } })
    const email = (await fullUser)?.email ?? ''
    await orgService.testSmtp(req.user!.orgId, email)
    res.json({ ok: true })
  } catch (err) { next(err) }
}
