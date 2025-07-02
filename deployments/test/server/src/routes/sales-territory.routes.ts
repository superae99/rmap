import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// 모든 라우트에 인증 필요
router.use(authenticate)

// TODO: Implement sales territory controller
router.get('/', (req, res) => {
  res.json({ message: 'Get all sales territories' })
})

router.get('/:territoryId', (req, res) => {
  res.json({ message: `Get sales territory ${req.params.territoryId}` })
})

router.post('/', authorize('팀장', '부장', '임원'), (req, res) => {
  res.json({ message: 'Create sales territory' })
})

router.put('/:territoryId', authorize('팀장', '부장', '임원'), (req, res) => {
  res.json({ message: `Update sales territory ${req.params.territoryId}` })
})

router.delete('/:territoryId', authorize('부장', '임원'), (req, res) => {
  res.json({ message: `Delete sales territory ${req.params.territoryId}` })
})

export default router