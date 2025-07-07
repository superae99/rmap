import { AppDataSource } from '../config/database'
import { User } from '../models/User'

async function checkJihoonseoExact() {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')

    const userRepository = AppDataSource.getRepository(User)
    
    // jihoonseo 계정의 정확한 정보 조회
    const jihoonseo = await userRepository.findOne({
      where: { account: 'jihoonseo' }
    })
    
    if (!jihoonseo) {
      console.log('❌ jihoonseo 계정을 찾을 수 없습니다.')
      return
    }

    console.log('👤 jihoonseo 계정 정보:')
    console.log(`   employeeId: "${jihoonseo.employeeId}"`)
    console.log(`   account: "${jihoonseo.account}"`)
    console.log(`   employeeName: "${jihoonseo.employeeName}"`)
    console.log(`   position: "${jihoonseo.position}"`)
    console.log(`   jobTitle: "${jihoonseo.jobTitle}"`)
    console.log(`   fieldType: "${jihoonseo.fieldType}"`)
    console.log(`   branchName: ${jihoonseo.branchName}`)
    console.log(`   officeName: ${jihoonseo.officeName}`)
    console.log(`   isActive: ${jihoonseo.isActive}`)
    console.log(`   workStatus: "${jihoonseo.workStatus}"`)

    console.log('\n🔍 STAFF 권한 체크:')
    const userAccount = jihoonseo.account || ''
    const userPosition = jihoonseo.position || ''
    const userJobTitle = jihoonseo.jobTitle || ''
    const userFieldType = jihoonseo.fieldType || ''
    
    console.log(`   userAccount === 'admin': ${userAccount === 'admin'}`)
    console.log(`   userJobTitle.includes('시스템관리자'): ${userJobTitle.includes('시스템관리자')}`)
    console.log(`   userPosition.includes('스탭'): ${userPosition.includes('스탭')}`)
    console.log(`   userJobTitle.includes('스탭'): ${userJobTitle.includes('스탭')}`)
    console.log(`   userFieldType === '스탭': ${userFieldType === '스탭'}`)
    
    const isStaff = userAccount === 'admin' || userJobTitle.includes('시스템관리자') || 
                    userPosition.includes('스탭') || userJobTitle.includes('스탭') || userFieldType === '스탭'
    
    console.log(`   ✅ 최종 STAFF 권한: ${isStaff}`)

    // seanslim과 비교
    const seanslim = await userRepository.findOne({
      where: { account: 'seanslim' }
    })
    
    if (seanslim) {
      console.log('\n👤 seanslim 계정 정보:')
      console.log(`   fieldType: "${seanslim.fieldType}"`)
      console.log(`   position: "${seanslim.position}"`)
      
      const seansFieldType = seanslim.fieldType || ''
      const seansPosition = seanslim.position || ''
      const seansIsStaff = seanslim.account === 'admin' || seanslim.jobTitle?.includes('시스템관리자') || 
                          seansPosition.includes('스탭') || seanslim.jobTitle?.includes('스탭') || seansFieldType === '스탭'
      
      console.log(`   ✅ seanslim STAFF 권한: ${seansIsStaff}`)
    }

    await AppDataSource.destroy()
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

checkJihoonseoExact()