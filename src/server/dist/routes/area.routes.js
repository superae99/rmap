"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const area_controller_1 = require("../controllers/area.controller");
const router = (0, express_1.Router)();
// 모든 영역 조회에 인증 + 권한 필요
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'staff', 'manager', 'user'), area_controller_1.getAreas);
router.get('/with-sales-territory', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'staff', 'manager', 'user'), area_controller_1.getAreasWithSalesTerritory);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'staff', 'manager', 'user'), area_controller_1.getArea);
// 영역 수정/삭제는 인증 필요
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('manager', 'admin'), area_controller_1.createArea);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('manager', 'admin'), area_controller_1.updateArea);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), area_controller_1.deleteArea);
// TopoJSON 업로드
router.post('/topojson', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('manager', 'admin'), area_controller_1.uploadTopoJSON);
exports.default = router;
//# sourceMappingURL=area.routes.js.map