import jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const testJwtTokens = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // 두 사용자 조회
    const seanslim = await userRepository.findOne({ 
      where: { account: 'seanslim', isActive: true } 
    })
    
    const jihoonseo = await userRepository.findOne({ 
      where: { account: 'jihoonseo', isActive: true } 
    })
    
    if (!seanslim || !jihoonseo) {
      console.log('❌ 사용자 중 하나 이상을 찾을 수 없습니다.')
      return
    }
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET이 설정되지 않았습니다.')
      return
    }
    
    console.log('🔐 JWT 토큰 생성 및 분석')
    console.log('=' .repeat(80))
    
    // seanslim 토큰 생성
    const seanslimToken = jwt.sign(
      { 
        employeeId: seanslim.employeeId,
        account: seanslim.account,
        employeeName: seanslim.employeeName,
        position: seanslim.position,
        jobTitle: seanslim.jobTitle,
        fieldType: seanslim.fieldType
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // jihoonseo 토큰 생성
    const jihoonseoToken = jwt.sign(
      { 
        employeeId: jihoonseo.employeeId,
        account: jihoonseo.account,
        employeeName: jihoonseo.employeeName,
        position: jihoonseo.position,
        jobTitle: jihoonseo.jobTitle,
        fieldType: jihoonseo.fieldType
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // 토큰 디코딩
    const seanslimDecoded = jwt.verify(seanslimToken, process.env.JWT_SECRET) as any
    const jihoonseoDecoded = jwt.verify(jihoonseoToken, process.env.JWT_SECRET) as any
    
    console.log('\n👤 seanslim JWT 토큰 내용:')
    console.log(`   employeeId: ${seanslimDecoded.employeeId}`)
    console.log(`   account: ${seanslimDecoded.account}`)
    console.log(`   employeeName: ${seanslimDecoded.employeeName}`)
    console.log(`   position: ${seanslimDecoded.position}`)
    console.log(`   jobTitle: ${seanslimDecoded.jobTitle}`)
    console.log(`   fieldType: ${seanslimDecoded.fieldType}`)
    
    console.log('\n👤 jihoonseo JWT 토큰 내용:')
    console.log(`   employeeId: ${jihoonseoDecoded.employeeId}`)
    console.log(`   account: ${jihoonseoDecoded.account}`)
    console.log(`   employeeName: ${jihoonseoDecoded.employeeName}`)
    console.log(`   position: ${jihoonseoDecoded.position}`)
    console.log(`   jobTitle: ${jihoonseoDecoded.jobTitle}`)
    console.log(`   fieldType: ${jihoonseoDecoded.fieldType}`)
    
    // 권한 체크 시뮬레이션
    console.log('\n🔍 권한 체크 시뮬레이션')
    console.log('=' .repeat(80))
    
    const checkPermissions = (user: any, username: string) => {
      const userPosition = user.position || ''
      const userJobTitle = user.jobTitle || ''
      const userAccount = user.account || ''
      const userFieldType = user.fieldType || ''
      
      console.log(`\n👤 ${username} 권한 체크:`)
      console.log(`   userPosition: "${userPosition}"`)
      console.log(`   userJobTitle: "${userJobTitle}"`)
      console.log(`   userAccount: "${userAccount}"`)
      console.log(`   userFieldType: "${userFieldType}"`)
      
      // 권한 체크 로직 (auth.middleware.ts와 동일)
      let userRole = 'user'
      
      if (userAccount === 'admin' || userJobTitle.includes('시스템관리자')) {
        userRole = 'admin'
      } else if (userPosition.includes('스탭') || userJobTitle.includes('스탭') || userFieldType === '스탭') {
        userRole = 'staff'
      } else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
        userRole = 'manager'
      }
      
      console.log(`   ✅ 최종 권한: ${userRole.toUpperCase()}`)
      
      // 상세 체크 결과
      console.log('   상세 체크 결과:')
      console.log(`     - admin 계정: ${userAccount === 'admin'}`)
      console.log(`     - 시스템관리자 포함: ${userJobTitle.includes('시스템관리자')}`)
      console.log(`     - position에 스탭 포함: ${userPosition.includes('스탭')}`)
      console.log(`     - jobTitle에 스탭 포함: ${userJobTitle.includes('스탭')}`)
      console.log(`     - fieldType === '스탭': ${userFieldType === '스탭'}`)
      console.log(`     - position에 지점장 포함: ${userPosition.includes('지점장')}`)
      console.log(`     - jobTitle에 지점장 포함: ${userJobTitle.includes('지점장')}`)
      
      return userRole
    }
    
    const seanslimRole = checkPermissions(seanslimDecoded, 'seanslim')
    const jihoonseoRole = checkPermissions(jihoonseoDecoded, 'jihoonseo')
    
    console.log('\n🎯 결론:')
    console.log('=' .repeat(80))
    console.log(`seanslim 권한: ${seanslimRole.toUpperCase()}`)
    console.log(`jihoonseo 권한: ${jihoonseoRole.toUpperCase()}`)
    
    if (seanslimRole === jihoonseoRole) {
      console.log('✅ 두 사용자의 권한이 동일합니다.')
      console.log('⚠️  권한 문제가 다른 곳에서 발생하고 있을 수 있습니다.')
    } else {
      console.log('❌ 두 사용자의 권한이 다릅니다.')
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ JWT 토큰 테스트 완료')
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
testJwtTokens()