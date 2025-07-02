"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const area_controller_1 = require("../controllers/area.controller");
const router = (0, express_1.Router)();
// 영역 조회는 인증 없이 접근 가능 (하지만 필터는 인증된 사용자만)
router.get('/', area_controller_1.getAreas);
router.get('/with-sales-territory', area_controller_1.getAreasWithSalesTerritory);
router.get('/with-partner-counts', area_controller_1.getAreasWithPartnerCounts);
router.get('/:id', area_controller_1.getArea);
// 영역 수정/삭제는 인증 필요
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('manager', 'admin'), area_controller_1.createArea);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('manager', 'admin'), area_controller_1.updateArea);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), area_controller_1.deleteArea);
// TopoJSON 업로드
router.post('/topojson', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('manager', 'admin'), area_controller_1.uploadTopoJSON);
exports.default = router;
//# sourceMappingURL=area.routes.js.map