import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { login, getProfile, logout, changePassword } from '../controllers/auth.controller'

const router = Router()

// 인증이 필요 없는 라우트
router.post('/login', login)

// 인증이 필요한 라우트
router.get('/me', authenticate, getProfile)
router.post('/logout', authenticate, logout)
router.post('/change-password', authenticate, changePassword)

export default router