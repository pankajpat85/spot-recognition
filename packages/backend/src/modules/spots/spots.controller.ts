import { Request, Response, NextFunction } from 'express'
import * as spotsService from './spots.service'
import { createSpotSchema, listSpotsSchema } from './spots.schema'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listSpotsSchema.parse(req.query)
    res.json(await spotsService.listSpots(req.user!.orgId, query))
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSpotSchema.parse(req.body)
    const spot = await spotsService.createSpot(req.user!.orgId, req.user!.userId, input)
    res.status(201).json(spot)
  } catch (err) { next(err) }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await spotsService.getSpot(req.user!.orgId, req.params.id))
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await spotsService.deleteSpot(req.user!.orgId, req.params.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image required', code: 'VALIDATION_ERROR' })
    const filePath = `/uploads/${req.user!.orgId}/spots/${req.file.filename}`
    await spotsService.saveSpotImage(req.user!.orgId, req.params.id, filePath)
    res.json({ imageUrl: filePath })
  } catch (err) { next(err) }
}

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    await spotsService.sendSpot(req.user!.orgId, req.params.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await spotsService.getStats(req.user!.orgId))
  } catch (err) { next(err) }
}
