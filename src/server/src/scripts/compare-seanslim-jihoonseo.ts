import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const compareUsers = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // 두 사용자 조회
    const seanslim = await userRepository.findOne({ 
      where: { employeeId: '30243079' }
    })
    
    const jihoonseo = await userRepository.findOne({ 
      where: { employeeId: '19950312' }
    })
    
    console.log('👥 사용자 비교 분석')
    console.log('=' .repeat(80))
    
    if (!seanslim) {
      console.log('❌ seanslim (employeeId: 30243079) 사용자를 찾을 수 없습니다.')
      return
    }
    
    if (!jihoonseo) {
      console.log('❌ jihoonseo (employeeId: 19950312) 사용자를 찾을 수 없습니다.')
      return
    }
    
    console.log(`\n👤 seanslim (${seanslim.employeeName})`)
    console.log(`   employeeId: ${seanslim.employeeId}`)
    console.log(`   account: ${seanslim.account}`)
    console.log(`   position: ${seanslim.position}`)
    console.log(`   jobTitle: ${seanslim.jobTitle}`)
    console.log(`   fieldType: ${seanslim.fieldType}`)
    console.log(`   branchName: ${seanslim.branchName}`)
    console.log(`   officeName: ${seanslim.officeName}`)
    console.log(`   isActive: ${seanslim.isActive}`)
    console.log(`   workStatus: ${seanslim.workStatus}`)
    
    console.log(`\n👤 jihoonseo (${jihoonseo.employeeName})`)
    console.log(`   employeeId: ${jihoonseo.employeeId}`)
    console.log(`   account: ${jihoonseo.account}`)
    console.log(`   position: ${jihoonseo.position}`)
    console.log(`   jobTitle: ${jihoonseo.jobTitle}`)
    console.log(`   fieldType: ${jihoonseo.fieldType}`)
    console.log(`   branchName: ${jihoonseo.branchName}`)
    console.log(`   officeName: ${jihoonseo.officeName}`)
    console.log(`   isActive: ${jihoonseo.isActive}`)
    console.log(`   workStatus: ${jihoonseo.workStatus}`)
    
    console.log(`\n🔍 STAFF 권한 조건 분석`)
    console.log('=' .repeat(80))
    
    // STAFF 권한 조건: userAccount === 'admin' || userJobTitle.includes('시스템관리자') || userPosition.includes('스탭') || userJobTitle.includes('스탭') || userFieldType === '스탭'
    
    console.log('\n👤 seanslim STAFF 권한 체크:')
    console.log(`   userAccount === 'admin': ${seanslim.account === 'admin'}`)
    console.log(`   userJobTitle.includes('시스템관리자'): ${(seanslim.jobTitle || '').includes('시스템관리자')}`)
    console.log(`   userPosition.includes('스탭'): ${(seanslim.position || '').includes('스탭')}`)
    console.log(`   userJobTitle.includes('스탭'): ${(seanslim.jobTitle || '').includes('스탭')}`)
    console.log(`   userFieldType === '스탭': ${seanslim.fieldType === '스탭'}`)
    
    const seanslimIsStaff = seanslim.account === 'admin' || 
                           (seanslim.jobTitle || '').includes('시스템관리자') || 
                           (seanslim.position || '').includes('스탭') || 
                           (seanslim.jobTitle || '').includes('스탭') || 
                           seanslim.fieldType === '스탭'
    
    console.log(`   ✅ 결과: ${seanslimIsStaff ? 'STAFF 권한 있음' : 'STAFF 권한 없음'}`)
    
    console.log('\n👤 jihoonseo STAFF 권한 체크:')
    console.log(`   userAccount === 'admin': ${jihoonseo.account === 'admin'}`)
    console.log(`   userJobTitle.includes('시스템관리자'): ${(jihoonseo.jobTitle || '').includes('시스템관리자')}`)
    console.log(`   userPosition.includes('스탭'): ${(jihoonseo.position || '').includes('스탭')}`)
    console.log(`   userJobTitle.includes('스탭'): ${(jihoonseo.jobTitle || '').includes('스탭')}`)
    console.log(`   userFieldType === '스탭': ${jihoonseo.fieldType === '스탭'}`)
    
    const jihoonseoIsStaff = jihoonseo.account === 'admin' || 
                            (jihoonseo.jobTitle || '').includes('시스템관리자') || 
                            (jihoonseo.position || '').includes('스탭') || 
                            (jihoonseo.jobTitle || '').includes('스탭') || 
                            jihoonseo.fieldType === '스탭'
    
    console.log(`   ✅ 결과: ${jihoonseoIsStaff ? 'STAFF 권한 있음' : 'STAFF 권한 없음'}`)
    
    console.log('\n🔍 차이점 분석:')
    console.log('=' .repeat(80))
    
    const differences = []
    
    if (seanslim.position !== jihoonseo.position) {
      differences.push(`position: "${seanslim.position}" vs "${jihoonseo.position}"`)
    }
    
    if (seanslim.jobTitle !== jihoonseo.jobTitle) {
      differences.push(`jobTitle: "${seanslim.jobTitle}" vs "${jihoonseo.jobTitle}"`)
    }
    
    if (seanslim.fieldType !== jihoonseo.fieldType) {
      differences.push(`fieldType: "${seanslim.fieldType}" vs "${jihoonseo.fieldType}"`)
    }
    
    if (seanslim.account !== jihoonseo.account) {
      differences.push(`account: "${seanslim.account}" vs "${jihoonseo.account}"`)
    }
    
    if (seanslim.isActive !== jihoonseo.isActive) {
      differences.push(`isActive: ${seanslim.isActive} vs ${jihoonseo.isActive}`)
    }
    
    if (seanslim.workStatus !== jihoonseo.workStatus) {
      differences.push(`workStatus: "${seanslim.workStatus}" vs "${jihoonseo.workStatus}"`)
    }
    
    if (differences.length === 0) {
      console.log('✅ 두 사용자의 권한 관련 데이터가 동일합니다.')
      console.log('⚠️  권한 문제가 JWT 토큰 또는 다른 요인에 의한 것일 수 있습니다.')
    } else {
      console.log('❌ 발견된 차이점:')
      differences.forEach(diff => console.log(`   - ${diff}`))
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ 비교 분석 완료')
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
compareUsers()