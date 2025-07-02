import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { 
  getPartners, 
  getPartner, 
  createPartner, 
  updatePartner, 
  deletePartner,
  bulkUploadPartners,
  getFilterOptions
} from '../controllers/partner.controller'

const router = Router()

// 모든 라우트에 인증 필요
router.use(authenticate)

// 필터 옵션 조회
router.get('/filter-options', getFilterOptions)

// 거래처 CRUD
router.get('/', getPartners)
router.get('/:partnerCode', getPartner)
router.post('/', authorize('manager', 'admin'), createPartner)
router.put('/:partnerCode', authorize('manager', 'admin'), updatePartner)
router.delete('/:partnerCode', authorize('admin'), deletePartner)

// 일괄 업로드
router.post('/bulk', authorize('manager', 'admin'), bulkUploadPartners)

export default router