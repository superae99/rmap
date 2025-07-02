import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import {
  getAreas,
  getAreasWithSalesTerritory,
  getAreasWithPartnerCounts,
  getArea,
  createArea,
  updateArea,
  deleteArea,
  uploadTopoJSON
} from '../controllers/area.controller'

const router = Router()

// 영역 조회는 인증 없이 접근 가능 (하지만 필터는 인증된 사용자만)
router.get('/', getAreas)
router.get('/with-sales-territory', getAreasWithSalesTerritory)
router.get('/with-partner-counts', getAreasWithPartnerCounts)
router.get('/:id', getArea)

// 영역 수정/삭제는 인증 필요
router.post('/', authenticate, authorize('manager', 'admin'), createArea)
router.put('/:id', authenticate, authorize('manager', 'admin'), updateArea)
router.delete('/:id', authenticate, authorize('admin'), deleteArea)

// TopoJSON 업로드
router.post('/topojson', authenticate, authorize('manager', 'admin'), uploadTopoJSON)

export default router