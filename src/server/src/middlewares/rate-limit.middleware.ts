import rateLimit from 'express-rate-limit'

// 일반 인증 API 율제한 (로그인)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분 동안 최대 5회 시도
  message: {
    success: false,
    error: {
      message: '너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.',
      code: 'TOO_MANY_ATTEMPTS'
    }
  },
  standardHeaders: true, // X-RateLimit-* 헤더 포함
  legacyHeaders: false, // X-RateLimit-Limit, X-RateLimit-Remaining 헤더 비활성화
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: '너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.',
        code: 'TOO_MANY_ATTEMPTS'
      }
    })
  }
})

// 패스워드 변경 API 율제한 (더 엄격)
export const passwordChangeRateLimit = rateLimit({
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
    })
  }
})

// 일반 API 율제한 (더 관대함)
export const generalRateLimit = rateLimit({
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
    })
  }
})