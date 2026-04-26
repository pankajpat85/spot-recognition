import { Router } from 'express'
import * as controller from './spots.controller'
import { authenticate } from '../../middleware/auth'
import { uploadSpotImage } from '../../middleware/upload'

const router = Router()
router.use(authenticate)

router.get('/stats', controller.stats)
router.get('/', controller.list)
router.post('/', controller.create)
router.get('/:id', controller.get)
router.delete('/:id', controller.remove)
router.post('/:id/image', uploadSpotImage.single('image'), controller.uploadImage)
router.post('/:id/send', controller.send)

export default router
