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

// 필터 옵션 조회 (staff 포함 - 조회 권한)
router.get('/filter-options', authorize('admin', 'staff', 'manager', 'user'), getFilterOptions)

// 거래처 CRUD
router.get('/', authorize('admin', 'staff', 'manager', 'user'), getPartners)
router.get('/:partnerCode', authorize('admin', 'staff', 'manager', 'user'), getPartner)
router.post('/', authorize('manager', 'admin'), createPartner)
router.put('/:partnerCode', authorize('manager', 'admin'), updatePartner)
router.delete('/:partnerCode', authorize('admin'), deletePartner)

// 일괄 업로드
router.post('/bulk', authorize('manager', 'admin'), bulkUploadPartners)

export default router