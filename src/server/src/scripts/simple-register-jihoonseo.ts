import { AppDataSource } from '../config/database'
import { User } from '../models/User'
import bcrypt from 'bcryptjs'

const registerJihoonseo = async () => {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    console.log('👤 서지훈 사용자 등록 시작...')
    console.log('='.repeat(60))
    
    // 기존 사용자 확인
    const existingUser = await userRepository.findOne({
      where: [
        { employeeId: '19950312' },
        { account: 'jihoonseo' }
      ]
    })
    
    if (existingUser) {
      console.log(`⏭️  이미 존재: jihoonseo (서지훈)`)
      return
    }
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('lotte1234!', 10)
    
    // 새 사용자 생성 (기존 import-and-grant-staff.ts와 동일한 방식)
    const newUser = userRepository.create([{
      employeeId: '19950312',
      employeeName: '서지훈',
      account: 'jihoonseo',
      password: hashedPassword,
      
      // 조직 정보
      headquartersCode: 'BB0001',
      headquartersName: '영업2본부',
      divisionCode: 'BM0001',
      divisionName: '도매부문',
      branchCode: null,
      branchName: null,
      officeCode: null,
      officeName: null,
      
      // 직급/직책 정보 - Staff 권한을 위해 '스탭' 추가
      position: '상무보/스탭',
      jobTitle: '부문장(스탭권한)',
      assignment: '부문장',
      fieldType: '영업필드',
      
      // 고용 정보
      employmentType: '정규직',
      workStatus: '재직',
      
      // 시스템 정보
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }])
    
    await userRepository.save(newUser)
    
    console.log(`✅ 등록 완료: jihoonseo (서지훈)`)
    console.log(`   - 사번: 19950312`)
    console.log(`   - 직급: 상무보 → ${newUser.position}`)
    console.log(`   - 직책: 부문장 → ${newUser.jobTitle}`)
    console.log(`   - 조직: ${newUser.headquartersName} > ${newUser.divisionName}`)
    
    // Staff 권한 확인
    const staffCheck = newUser.position?.includes('스탭') || newUser.jobTitle?.includes('스탭')
    console.log(`   - Staff 권한: ${staffCheck ? '✅ 부여됨' : '❌ 미부여'}`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
registerJihoonseo()