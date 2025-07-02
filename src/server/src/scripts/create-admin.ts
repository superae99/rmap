import 'reflect-metadata'
import bcrypt from 'bcryptjs'
import { AppDataSource } from '../config/database'
import { User } from '../models/User'

async function createTestUsers() {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()

    const userRepository = AppDataSource.getRepository(User)

    // 관리자 계정 정보
    const adminData = {
      employeeId: 'ADMIN001',
      employeeName: '시스템관리자',
      account: 'admin',
      password: await bcrypt.hash('password123', 10),
      position: '팀장',
      jobTitle: '시스템관리자',
      isActive: true,
      headquartersName: '본사',
      divisionName: 'IT부문',
      branchName: '서울지사',
      officeName: '본점'
    }

    // 지점장 계정 정보
    const managerData = {
      employeeId: 'MGR001',
      employeeName: '홍길동',
      account: 'manager',
      password: await bcrypt.hash('password123', 10),
      position: '지점장',
      jobTitle: '영업관리',
      isActive: true,
      headquartersName: '본사',
      divisionName: '영업부문',
      branchName: '서울지사',
      officeName: '강남지점'
    }

    // 일반 사용자 계정 정보
    const userData = {
      employeeId: 'USER001',
      employeeName: '김직원',
      account: 'user',
      password: await bcrypt.hash('password123', 10),
      position: '대리',
      jobTitle: '영업담당',
      isActive: true,
      headquartersName: '본사',
      divisionName: '영업부문',
      branchName: '서울지사',
      officeName: '강남지점'
    }

    const testAccounts = [
      { data: adminData, name: '관리자' },
      { data: managerData, name: '지점장' },
      { data: userData, name: '일반사용자' }
    ]

    for (const { data, name } of testAccounts) {
      const existing = await userRepository.findOne({
        where: { account: data.account }
      })

      if (existing) {
        // 비밀번호 업데이트
        existing.password = data.password
        await userRepository.save(existing)
      } else {
        // 새 계정 생성
        const user = userRepository.create(data)
        await userRepository.save(user)
      }
    }


    await AppDataSource.destroy()
  } catch (error) {
    process.exit(1)
  }
}

createTestUsers()