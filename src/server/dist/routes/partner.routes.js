"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const partner_controller_1 = require("../controllers/partner.controller");
const router = (0, express_1.Router)();
// 모든 라우트에 인증 필요
router.use(auth_middleware_1.authenticate);
// 필터 옵션 조회
router.get('/filter-options', partner_controller_1.getFilterOptions);
// 거래처 CRUD
router.get('/', partner_controller_1.getPartners);
router.get('/:partnerCode', partner_controller_1.getPartner);
router.post('/', (0, auth_middleware_1.authorize)('manager', 'admin'), partner_controller_1.createPartner);
router.put('/:partnerCode', (0, auth_middleware_1.authorize)('manager', 'admin'), partner_controller_1.updatePartner);
router.delete('/:partnerCode', (0, auth_middleware_1.authorize)('admin'), partner_controller_1.deletePartner);
// 일괄 업로드
router.post('/bulk', (0, auth_middleware_1.authorize)('manager', 'admin'), partner_controller_1.bulkUploadPartners);
// 전체 교체 업로드 (관리자만)
router.post('/replace-all', (0, auth_middleware_1.authorize)('admin'), partner_controller_1.replaceAllPartners);
exports.default = router;
//# sourceMappingURL=partner.routes.js.map