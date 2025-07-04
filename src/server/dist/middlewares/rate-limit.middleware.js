"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimit = exports.passwordChangeRateLimit = exports.authRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 일반 인증 API 율제한 (로그인) - 디버깅을 위해 일시적으로 완화
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5분으로 단축
    max: 20, // 최대 시도 횟수 증가 (디버깅용)
    // 디버깅 모드: 특정 조건에서 rate limit 우회
    skip: (req) => {
        // 디버깅을 위해 Netlify에서 오는 요청은 rate limit 우회
        const origin = req.headers.origin;
        const isFromNetlify = origin && origin.includes('netlify.app');
        if (isFromNetlify) {
            console.log('🚫 Rate limit 우회 (Netlify 디버깅):', origin);
            return true;
        }
        return false;
    },
    message: {
        success: false,
        error: {
            message: '너무 많은 로그인 시도가 있었습니다. 5분 후 다시 시도해주세요.',
            code: 'TOO_MANY_ATTEMPTS'
        }
    },
    standardHeaders: true, // X-RateLimit-* 헤더 포함
    legacyHeaders: false, // X-RateLimit-Limit, X-RateLimit-Remaining 헤더 비활성화
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: '너무 많은 로그인 시도가 있었습니다. 5분 후 다시 시도해주세요.',
                code: 'TOO_MANY_ATTEMPTS'
            }
        });
    }
});
// 패스워드 변경 API 율제한 (더 엄격)
exports.passwordChangeRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1시간
    max: 3, // 1시간 동안 최대 3회 시도
    message: {
        success: false,
        error: {
            message: '너무 많은 비밀번호 변경 시도가 있었습니다. 1시간 후 다시 시도해주세요.',
            code: 'TOO_MANY_PASSWORD_ATTEMPTS'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: '너무 많은 비밀번호 변경 시도가 있었습니다. 1시간 후 다시 시도해주세요.',
                code: 'TOO_MANY_PASSWORD_ATTEMPTS'
            }
        });
    }
});
// 일반 API 율제한 (더 관대함)
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 15분 동안 최대 100회 요청
    message: {
        success: false,
        error: {
            message: '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.',
            code: 'TOO_MANY_REQUESTS'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.',
                code: 'TOO_MANY_REQUESTS'
            }
        });
    }
});
//# sourceMappingURL=rate-limit.middleware.js.map