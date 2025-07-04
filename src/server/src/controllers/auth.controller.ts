import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const userRepository = AppDataSource.getRepository(User)

export const login = async (req: Request, res: Response) => {
  try {
    const { account, password } = req.body

    // 필수 필드 검증
    if (!account || !password) {
      return res.status(400).json({ message: '계정과 비밀번호를 입력해주세요.' })
    }

    // 사용자 찾기
    const user = await userRepository.findOne({ 
      where: { account, isActive: true } 
    })
    
    if (!user) {
      return res.status(401).json({ message: '계정 또는 비밀번호가 올바르지 않습니다.' })
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: '계정 또는 비밀번호가 올바르지 않습니다.' })
    }

    // JWT 토큰 생성
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }
    
    const token = jwt.sign(
      { 
        employeeId: user.employeeId,
        account: user.account,
        employeeName: user.employeeName,
        position: user.position,
        jobTitle: user.jobTitle
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    )

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date()
    await userRepository.save(user)

    // 비밀번호 제외하고 응답
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: '로그인에 성공했습니다.',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

export const getProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const employeeId = req.user?.employeeId

    const user = await userRepository.findOne({ 
      where: { employeeId, isActive: true } 
    })
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// 로그아웃은 클라이언트에서 토큰을 삭제하면 되므로 별도 구현 불필요
export const logout = async (req: Request, res: Response) => {
  res.json({ message: '로그아웃되었습니다.' })
}

// 패스워드 변경
export const changePassword = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    const employeeId = req.user?.employeeId

    // 필수 필드 검증
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' })
    }

    // 패스워드 정책 검증 (최소 8자, 숫자/문자/특수문자 포함)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: '비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.' 
      })
    }

    // 현재 비밀번호와 새 비밀번호가 같은지 확인
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호가 동일합니다.' })
    }

    // 사용자 찾기
    const user = await userRepository.findOne({ 
      where: { employeeId, isActive: true } 
    })
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' })
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // 비밀번호 업데이트
    user.password = hashedPassword
    user.passwordChangedAt = new Date()
    await userRepository.save(user)

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' })
  } catch (error) {
    console.error('패스워드 변경 오류:', error)
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}