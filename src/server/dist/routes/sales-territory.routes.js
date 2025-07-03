"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 모든 라우트에 인증 필요
router.use(auth_middleware_1.authenticate);
// TODO: Implement sales territory controller
router.get('/', (0, auth_middleware_1.authorize)('admin', 'staff', 'manager', 'user'), (req, res) => {
    res.json({ message: 'Get all sales territories' });
});
router.get('/:territoryId', (0, auth_middleware_1.authorize)('admin', 'staff', 'manager', 'user'), (req, res) => {
    res.json({ message: `Get sales territory ${req.params.territoryId}` });
});
router.post('/', (0, auth_middleware_1.authorize)('manager', 'admin'), (req, res) => {
    res.json({ message: 'Create sales territory' });
});
router.put('/:territoryId', (0, auth_middleware_1.authorize)('manager', 'admin'), (req, res) => {
    res.json({ message: `Update sales territory ${req.params.territoryId}` });
});
router.delete('/:territoryId', (0, auth_middleware_1.authorize)('admin'), (req, res) => {
    res.json({ message: `Delete sales territory ${req.params.territoryId}` });
});
exports.default = router;
//# sourceMappingURL=sales-territory.routes.js.map