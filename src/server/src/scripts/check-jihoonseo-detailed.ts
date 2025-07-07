import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const checkJihoonseoDetailed = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // jihoonseo 계정의 모든 필드 조회
    const jihoonseo = await userRepository.findOne({ 
      where: { account: 'jihoonseo' }
    })
    
    // seanslim 계정의 모든 필드 조회 (비교용)
    const seanslim = await userRepository.findOne({ 
      where: { account: 'seanslim' }
    })
    
    console.log('📋 jihoonseo 계정 상세 정보:')
    console.log('=' .repeat(80))
    if (jihoonseo) {
      console.log(JSON.stringify(jihoonseo, null, 2))
    } else {
      console.log('❌ jihoonseo 계정을 찾을 수 없습니다.')
    }
    
    console.log('\n📋 seanslim 계정 상세 정보 (비교용):')
    console.log('=' .repeat(80))
    if (seanslim) {
      console.log(JSON.stringify(seanslim, null, 2))
    } else {
      console.log('❌ seanslim 계정을 찾을 수 없습니다.')
    }
    
    // 필드별 차이점 분석
    if (jihoonseo && seanslim) {
      console.log('\n🔍 필드별 차이점 분석:')
      console.log('=' .repeat(80))
      
      const fields = Object.keys(jihoonseo) as (keyof User)[]
      
      for (const field of fields) {
        const jihoonseoValue = (jihoonseo as any)[field]
        const seanslimValue = (seanslim as any)[field]
        
        if (jihoonseoValue !== seanslimValue) {
          console.log(`${field}:`)
          console.log(`  jihoonseo: "${jihoonseoValue}"`)
          console.log(`  seanslim:  "${seanslimValue}"`)
          console.log('')
        }
      }
    }
    
    // 권한 체크 시뮬레이션
    if (jihoonseo) {
      console.log('\n🔐 jihoonseo 권한 체크 시뮬레이션:')
      console.log('=' .repeat(80))
      
      const userPosition = jihoonseo.position || ''
      const userJobTitle = jihoonseo.jobTitle || ''
      const userAccount = jihoonseo.account || ''
      const userFieldType = (jihoonseo as any).fieldType || ''
      
      console.log(`position: "${userPosition}"`)
      console.log(`jobTitle: "${userJobTitle}"`)
      console.log(`account: "${userAccount}"`)
      console.log(`fieldType: "${userFieldType}"`)
      console.log('')
      
      // 권한 체크 로직
      const isAdmin = userAccount === 'admin' || userJobTitle.includes('시스템관리자')
      const isStaffPosition = userPosition.includes('스탭')
      const isStaffJobTitle = userJobTitle.includes('스탭')
      const isStaffFieldType = userFieldType === '스탭'
      const isStaff = isStaffPosition || isStaffJobTitle || isStaffFieldType
      const isBranchManager = userPosition.includes('지점장') || userJobTitle.includes('지점장')
      
      console.log('권한 체크 결과:')
      console.log(`  isAdmin: ${isAdmin}`)
      console.log(`  isStaffPosition: ${isStaffPosition}`)
      console.log(`  isStaffJobTitle: ${isStaffJobTitle}`)
      console.log(`  isStaffFieldType: ${isStaffFieldType}`)
      console.log(`  isStaff (전체): ${isStaff}`)
      console.log(`  isBranchManager: ${isBranchManager}`)
      
      let userRole = 'user'
      if (isAdmin) {
        userRole = 'admin'
      } else if (isStaff) {
        userRole = 'staff'
      } else if (isBranchManager) {
        userRole = 'manager'
      }
      
      console.log(`  최종 권한: ${userRole.toUpperCase()}`)
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
checkJihoonseoDetailed()