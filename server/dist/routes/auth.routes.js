"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// 인증이 필요 없는 라우트
router.post('/login', auth_controller_1.login);
// 인증이 필요한 라우트
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getProfile);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map