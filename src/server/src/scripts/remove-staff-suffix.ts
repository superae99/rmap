import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const removeStaffSuffix = async () => {
  try {
    console.log('📊 데이터베이스 연결 중...')
    await AppDataSource.initialize()
    console.log('✅ 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    console.log('🔍 (스탭권한) 텍스트가 포함된 사용자 검색 중...')
    
    // (스탭권한) 텍스트가 포함된 사용자 조회
    const usersWithStaffSuffix = await userRepository
      .createQueryBuilder('user')
      .where('user.jobTitle LIKE :suffix', { suffix: '%(스탭권한)%' })
      .getMany()
    
    console.log(`📋 수정 대상 사용자: ${usersWithStaffSuffix.length}명\n`)
    
    if (usersWithStaffSuffix.length === 0) {
      console.log('✅ 수정할 사용자가 없습니다.')
      return
    }
    
    console.log('🔄 (스탭권한) 텍스트 제거 시작...')
    console.log('='.repeat(80))
    
    let updatedCount = 0
    
    for (const user of usersWithStaffSuffix) {
      const originalJobTitle = user.jobTitle
      const cleanedJobTitle = user.jobTitle?.replace(/\(스탭권한\)/g, '').trim()
      
      if (cleanedJobTitle !== originalJobTitle) {
        await userRepository.update(
          { employeeId: user.employeeId },
          { jobTitle: cleanedJobTitle }
        )
        
        console.log(`✅ 수정: ${user.employeeName} (${user.account})`)
        console.log(`   - 변경 전: ${originalJobTitle}`)
        console.log(`   - 변경 후: ${cleanedJobTitle}`)
        console.log('')
        
        updatedCount++
      }
    }
    
    console.log('='.repeat(80))
    console.log(`\n📊 처리 결과:`)
    console.log(`- ✅ 수정 완료: ${updatedCount}명`)
    console.log(`- 📋 전체 대상: ${usersWithStaffSuffix.length}명`)
    
    // 수정 결과 확인
    const verifyUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.position LIKE :position', { position: '%스탭%' })
      .orderBy('user.employeeName', 'ASC')
      .getMany()
    
    console.log(`\n📋 현재 Staff 권한 사용자 목록 (${verifyUsers.length}명):`)
    console.log('-'.repeat(80))
    verifyUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.employeeName} (${user.account}) - ${user.jobTitle}`)
    })
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
    console.log('\n🔚 데이터베이스 연결 종료')
  }
}

// 스크립트 실행
removeStaffSuffix()