import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import {
  getAreas,
  getAreasWithSalesTerritory,
  getArea,
  createArea,
  updateArea,
  deleteArea,
  uploadTopoJSON
} from '../controllers/area.controller'

const router = Router()

// 모든 영역 조회에 인증 필요
router.get('/', authenticate, getAreas)
router.get('/with-sales-territory', authenticate, getAreasWithSalesTerritory)
router.get('/:id', authenticate, getArea)

// 영역 수정/삭제는 인증 필요
router.post('/', authenticate, authorize('manager', 'admin'), createArea)
router.put('/:id', authenticate, authorize('manager', 'admin'), updateArea)
router.delete('/:id', authenticate, authorize('admin'), deleteArea)

// TopoJSON 업로드
router.post('/topojson', authenticate, authorize('manager', 'admin'), uploadTopoJSON)

export default router