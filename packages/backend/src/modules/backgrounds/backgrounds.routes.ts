import { Router } from 'express'
import * as svc from './backgrounds.service'
import { authenticate } from '../../middleware/auth'
import { uploadBackground } from '../../middleware/upload'
import { planGate } from '../../middleware/planGate'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try { res.json(await svc.listBackgrounds(req.user!.orgId)) } catch (err) { next(err) }
})

router.post('/', planGate('PRO'), uploadBackground.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image required', code: 'VALIDATION_ERROR' })
    const name = (req.body.name as string) || req.file.originalname
    const imageUrl = `/uploads/${req.user!.orgId}/backgrounds/${req.file.filename}`
    res.status(201).json(await svc.createBackground(req.user!.orgId, name, imageUrl))
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteBackground(req.user!.orgId, req.params.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
