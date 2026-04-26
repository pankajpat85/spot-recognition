import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function makeStorage(subdir: (req: Request) => string) {
  return multer.diskStorage({
    destination(req, _file, cb) {
      const dir = path.join(process.cwd(), 'uploads', subdir(req))
      ensureDir(dir)
      cb(null, dir)
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
    },
  })
}

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only images are allowed.'))
}

export const uploadUserPhoto = multer({
  storage: makeStorage(req => `${req.user?.orgId ?? 'unknown'}/users`),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
})

export const uploadOrgLogo = multer({
  storage: makeStorage(req => `${req.user?.orgId ?? 'unknown'}/org`),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
})

export const uploadBackground = multer({
  storage: makeStorage(req => `${req.user?.orgId ?? 'unknown'}/backgrounds`),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

export const uploadSpotImage = multer({
  storage: makeStorage(req => `${req.user?.orgId ?? 'unknown'}/spots`),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter(_req, file, cb) {
    const allowed = ['text/csv', 'application/csv', 'text/plain']
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv')) cb(null, true)
    else cb(new Error('Only CSV files are accepted'))
  },
  limits: { fileSize: 2 * 1024 * 1024 },
})
