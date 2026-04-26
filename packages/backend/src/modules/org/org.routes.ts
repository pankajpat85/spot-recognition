import { Router } from 'express'
import * as controller from './org.controller'
import { authenticate, requireAdmin } from '../../middleware/auth'
import { uploadOrgLogo } from '../../middleware/upload'
import { planGate } from '../../middleware/planGate'

const router = Router()
router.use(authenticate, requireAdmin)

router.get('/', controller.getOrg)
router.put('/', uploadOrgLogo.single('logo'), controller.updateOrg)
router.put('/smtp', controller.updateSmtp)
router.post('/smtp/test', controller.testSmtp)

export default router
