import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './error.middleware'

interface JwtPayload {
  employeeId: string
  account: string
  employeeName: string
  position?: string
  jobTitle?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 토큰을 Authorization 헤더 또는 쿠키에서 가져오기
    let token = req.headers.authorization?.split(' ')[1]
    
    // Authorization 헤더에 토큰이 없으면 쿠키에서 확인
    if (!token) {
      token = req.cookies?.authToken
    }

    if (!token) {
      throw new AppError('No token provided', 401)
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not configured', 500)
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload

    req.user = decoded
    next()
  } catch (error) {
    next(new AppError('Invalid token', 401))
  }
}

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401))
    }

    // 권한 체크 로직
    const userPosition = req.user.position || ''
    const userJobTitle = req.user.jobTitle || ''
    const userAccount = req.user.account || ''

    let userRole = 'user' // 기본 권한

    // admin 계정은 최고 권한
    if (userAccount === 'admin' || userJobTitle.includes('시스템관리자')) {
      userRole = 'admin'
    }
    // staff 권한 (스탭 - 조회만 가능, 생성/수정 불가)
    else if (userPosition.includes('스탭') || userJobTitle.includes('스탭')) {
      userRole = 'staff'
    }
    // 지점장 권한
    else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
      userRole = 'manager'
    }

    const hasPermission = allowedRoles.includes(userRole)

    if (!hasPermission) {
      return next(new AppError('권한이 없습니다.', 403))
    }

    next()
  }
}