import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { getKakaoMapScript, getKakaoSDK, searchAddresses, getCoordinates } from '../controllers/kakao.controller'

const router = Router()

// 카카오맵 스크립트 URL 제공 (인증 불필요)
router.get('/script', getKakaoMapScript)

// 카카오맵 SDK 프록시 (인증 불필요)
router.get('/sdk.js', getKakaoSDK)

// 주소 검색 API (인증 필요)
router.get('/search/address', authenticate, searchAddresses)

// 좌표 변환 API (인증 필요)
router.get('/geocode', authenticate, getCoordinates)

export default router