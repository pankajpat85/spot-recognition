import { Router } from 'express'
import * as controller from './users.controller'
import { authenticate } from '../../middleware/auth'
import { uploadUserPhoto, uploadCsv } from '../../middleware/upload'
import { planGate } from '../../middleware/planGate'

const router = Router()
router.use(authenticate)

router.get('/', controller.list)
router.post('/', uploadUserPhoto.single('photo'), controller.create)
router.get('/:id', controller.get)
router.put('/:id', uploadUserPhoto.single('photo'), controller.update)
router.delete('/:id', controller.remove)
router.post('/import', planGate('PRO'), uploadCsv.single('file'), controller.importCsv)

export default router
