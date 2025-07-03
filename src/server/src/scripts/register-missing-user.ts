import { AppDataSource } from '../config/database'
import { User } from '../models/User'
import bcrypt from 'bcryptjs'

const registerMissingUser = async () => {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // 서지훈 사용자 정보 (Excel에서 확인한 데이터)
    const userData = {
      employeeId: '19950312',
      employeeName: '서지훈',
      account: 'jihoonseo',
      password: 'lotte1234!',
      headquartersCode: 'BB0001',
      headquartersName: '영업2본부',
      divisionCode: 'BM0001',
      divisionName: '도매부문',
      position: '상무보',
      jobTitle: '부문장',
      assignment: '부문장',
      fieldType: '영업필드'
    }
    
    console.log('👤 서지훈 사용자 등록 시작...')
    console.log('='.repeat(60))
    
    // 기존 사용자 확인
    const existingUser = await userRepository.findOne({
      where: [
        { employeeId: userData.employeeId },
        { account: userData.account }
      ]
    })
    
    if (existingUser) {
      console.log(`⏭️  이미 존재: ${userData.account} (${userData.employeeName})`)
      return
    }
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // 새 사용자 생성 (Staff 권한 포함)
    const newUser = userRepository.create({
      employeeId: userData.employeeId,
      employeeName: userData.employeeName,
      account: userData.account,
      password: hashedPassword,
      
      // 조직 정보
      headquartersCode: userData.headquartersCode,
      headquartersName: userData.headquartersName,
      divisionCode: userData.divisionCode,
      divisionName: userData.divisionName,
      branchCode: null,
      branchName: null,
      officeCode: null,
      officeName: null,
      
      // 직급/직책 정보 - Staff 권한을 위해 '스탭' 추가
      position: `${userData.position}/스탭`,
      jobTitle: `${userData.jobTitle}(스탭권한)`,
      assignment: userData.assignment,
      jobRole: null,
      fieldType: userData.fieldType as any,
      
      // 고용 정보
      employmentType: '정규직',
      workStatus: '재직',
      
      // 시스템 정보
      isActive: true
    })
    
    await userRepository.save(newUser)
    
    console.log(`✅ 등록 완료: ${userData.account} (${userData.employeeName})`)
    console.log(`   - 사번: ${userData.employeeId}`)
    console.log(`   - 직급: ${userData.position} → ${newUser.position}`)
    console.log(`   - 직책: ${userData.jobTitle} → ${newUser.jobTitle}`)
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
registerMissingUser()