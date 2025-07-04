"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("./error.middleware");
const authenticate = async (req, res, next) => {
    try {
        // 디버깅: 쿠키와 헤더 확인
        console.log('🔍 Auth Debug - Cookies:', req.cookies);
        console.log('🔍 Auth Debug - Headers:', req.headers.cookie);
        console.log('🔍 Auth Debug - Origin:', req.headers.origin);
        // 토큰을 Authorization 헤더 또는 쿠키에서 가져오기
        let token = req.headers.authorization?.split(' ')[1];
        // Authorization 헤더에 토큰이 없으면 쿠키에서 확인
        if (!token) {
            token = req.cookies?.authToken;
        }
        if (!token) {
            console.log('❌ No token found in headers or cookies');
            throw new error_middleware_1.AppError('No token provided', 401);
        }
        if (!process.env.JWT_SECRET) {
            throw new error_middleware_1.AppError('JWT_SECRET is not configured', 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new error_middleware_1.AppError('Invalid token', 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError('Unauthorized', 401));
        }
        // 권한 체크 로직
        const userPosition = req.user.position || '';
        const userJobTitle = req.user.jobTitle || '';
        const userAccount = req.user.account || '';
        let userRole = 'user'; // 기본 권한
        // admin 계정은 최고 권한
        if (userAccount === 'admin' || userJobTitle.includes('시스템관리자')) {
            userRole = 'admin';
        }
        // staff 권한 (스탭 - 조회만 가능, 생성/수정 불가)
        else if (userPosition.includes('스탭') || userJobTitle.includes('스탭') || req.user.fieldType === '스탭') {
            userRole = 'staff';
        }
        // 지점장 권한
        else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
            userRole = 'manager';
        }
        const hasPermission = allowedRoles.includes(userRole);
        if (!hasPermission) {
            return next(new error_middleware_1.AppError('권한이 없습니다.', 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map