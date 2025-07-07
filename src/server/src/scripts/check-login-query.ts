import { AppDataSource } from '../config/database'
import { User } from '../models/User'

async function checkLoginQuery() {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')

    const userRepository = AppDataSource.getRepository(User)
    
    // 로그인 시와 동일한 쿼리 실행
    console.log('🔍 로그인 시와 동일한 쿼리 실행:')
    const user = await userRepository.findOne({
      where: { account: 'jihoonseo' }
    })
    
    if (!user) {
      console.log('❌ jihoonseo 계정을 찾을 수 없습니다.')
      return
    }

    console.log('👤 로그인 쿼리 결과:')
    console.log(`   employeeId: "${user.employeeId}"`)
    console.log(`   account: "${user.account}"`)
    console.log(`   employeeName: "${user.employeeName}"`)
    console.log(`   position: "${user.position}"`)
    console.log(`   jobTitle: "${user.jobTitle}"`)
    console.log(`   fieldType: "${user.fieldType}"`)
    
    console.log('\n🔍 JWT 토큰에 들어갈 정보:')
    const tokenPayload = {
      employeeId: user.employeeId,
      account: user.account,
      employeeName: user.employeeName,
      position: user.position,
      jobTitle: user.jobTitle,
      fieldType: user.fieldType
    }
    console.log(JSON.stringify(tokenPayload, null, 2))
    
    console.log('\n🔍 STAFF 권한 체크:')
    console.log(`   position.includes('스탭'): ${user.position?.includes('스탭')}`)
    console.log(`   fieldType === '스탭': ${user.fieldType === '스탭'}`)
    
    const isStaff = user.account === 'admin' || user.jobTitle?.includes('시스템관리자') || 
                    user.position?.includes('스탭') || user.jobTitle?.includes('스탭') || user.fieldType === '스탭'
    
    console.log(`   ✅ 최종 STAFF 권한: ${isStaff}`)

    // 원시 SQL로도 확인
    console.log('\n🔍 원시 SQL 쿼리 결과:')
    const rawResult = await AppDataSource.query(
      'SELECT employeeId, account, employeeName, position, jobTitle, fieldType FROM users WHERE account = ?',
      ['jihoonseo']
    )
    
    if (rawResult.length > 0) {
      console.log('Raw SQL 결과:')
      console.log(JSON.stringify(rawResult[0], null, 2))
    }

    await AppDataSource.destroy()
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

checkLoginQuery()