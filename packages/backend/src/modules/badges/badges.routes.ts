import { Router } from 'express'
import { authenticate } from '../../middleware/auth'

const BADGES = [
  { value: 'brain-wave', label: 'Brain Wave', imageUrl: '/static/badges/brain-wave.png' },
  { value: 'calmer-of-storms', label: 'Calmer of Storms', imageUrl: '/static/badges/calmer-of-storms.png' },
  { value: 'cool-cucumber', label: 'Cool Cucumber', imageUrl: '/static/badges/cool-cucumber.png' },
  { value: 'high-five', label: 'High Five', imageUrl: '/static/badges/high-five.png' },
  { value: 'juggler', label: 'Juggler', imageUrl: '/static/badges/juggler.png' },
  { value: 'out-of-box', label: 'Out of Box', imageUrl: '/static/badges/out-of-box.png' },
  { value: 'rockstar', label: 'Rockstar', imageUrl: '/static/badges/rockstar.png' },
]

const router = Router()
router.get('/', authenticate, (_req, res) => res.json(BADGES))

export default router
