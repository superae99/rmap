import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// 모든 라우트에 인증 필요
router.use(authenticate)

// TODO: Implement sales territory controller
router.get('/', authorize('admin', 'staff', 'manager', 'user'), (req, res) => {
  res.json({ message: 'Get all sales territories' })
})

router.get('/:territoryId', authorize('admin', 'staff', 'manager', 'user'), (req, res) => {
  res.json({ message: `Get sales territory ${req.params.territoryId}` })
})

router.post('/', authorize('manager', 'admin'), (req, res) => {
  res.json({ message: 'Create sales territory' })
})

router.put('/:territoryId', authorize('manager', 'admin'), (req, res) => {
  res.json({ message: `Update sales territory ${req.params.territoryId}` })
})

router.delete('/:territoryId', authorize('admin'), (req, res) => {
  res.json({ message: `Delete sales territory ${req.params.territoryId}` })
})

export default router