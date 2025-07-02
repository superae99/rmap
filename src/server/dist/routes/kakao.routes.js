"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const kakao_controller_1 = require("../controllers/kakao.controller");
const router = (0, express_1.Router)();
// 카카오맵 스크립트 URL 제공 (인증 불필요)
router.get('/script', kakao_controller_1.getKakaoMapScript);
// 카카오맵 SDK 프록시 (인증 불필요)
router.get('/sdk.js', kakao_controller_1.getKakaoSDK);
// 주소 검색 API (인증 필요)
router.get('/search/address', auth_middleware_1.authenticate, kakao_controller_1.searchAddresses);
// 좌표 변환 API (인증 필요)
router.get('/geocode', auth_middleware_1.authenticate, kakao_controller_1.getCoordinates);
exports.default = router;
//# sourceMappingURL=kakao.routes.js.map