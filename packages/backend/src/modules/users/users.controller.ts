import { Request, Response, NextFunction } from 'express'
import * as usersService from './users.service'
import { createUserSchema, updateUserSchema, listUsersSchema } from './users.schema'
import { env } from '../../config/env'

function photoUrl(req: Request): string | undefined {
  return req.file ? `/uploads/${req.user!.orgId}/${req.file.filename}` : undefined
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, limit, page } = listUsersSchema.parse(req.query)
    const result = await usersService.listUsers(req.user!.orgId, search, limit, page)
    res.json(result)
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createUserSchema.parse(req.body)
    const photo = req.file ? `/uploads/${req.user!.orgId}/users/${req.file.filename}` : undefined
    const user = await usersService.createUser(req.user!.orgId, input, photo)
    res.status(201).json(user)
  } catch (err) { next(err) }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUser(req.user!.orgId, req.params.id)
    res.json(user)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateUserSchema.parse(req.body)
    const photo = req.file ? `/uploads/${req.user!.orgId}/users/${req.file.filename}` : undefined
    const user = await usersService.updateUser(req.user!.orgId, req.params.id, input, photo)
    res.json(user)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await usersService.deleteUser(req.user!.orgId, req.params.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

export async function importCsv(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file required', code: 'VALIDATION_ERROR' })
    const result = await usersService.importCsv(req.user!.orgId, req.file.buffer)
    res.json(result)
  } catch (err) { next(err) }
}
