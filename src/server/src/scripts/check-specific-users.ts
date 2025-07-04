import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const checkSpecificUsers = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    const accounts = [
      'leenc',
      'jihoonseo', 
      'seanslim',
      'shongwp',
      'giseokjang',
      'narikim',
      'hyeokjaelee',
      'jiung.ha',
      'hyeongraekim',
      'eunji.lee.2',
      'hojun_seo'
    ]
    
    console.log('📋 지정된 계정들의 권한 정보:\n')
    console.log('=' .repeat(100))
    
    for (const account of accounts) {
      const user = await userRepository.findOne({ 
        where: { account },
        select: ['employeeId', 'employeeName', 'account', 'position', 'jobTitle', 'branchName', 'officeName']
      })
      
      if (user) {
        // 권한 판별 로직 (auth.middleware.ts와 동일)
        const userPosition = user.position || ''
        const userJobTitle = user.jobTitle || ''
        const userAccount = user.account || ''
        
        let userRole = 'user' // 기본 권한
        
        if (userAccount === 'admin' || userJobTitle.includes('시스템관리자')) {
          userRole = 'admin'
        } else if (userPosition.includes('스탭') || userJobTitle.includes('스탭')) {
          userRole = 'staff'
        } else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
          userRole = 'manager'
        }
        
        console.log(`\n👤 ${user.employeeName} (${account})`)
        console.log(`   직급: ${user.position || 'N/A'}`)
        console.log(`   직책: ${user.jobTitle || 'N/A'}`)
        console.log(`   지사: ${user.branchName || 'N/A'}`)
        console.log(`   지점: ${user.officeName || 'N/A'}`)
        console.log(`   👑 권한: ${userRole.toUpperCase()}`)
        
        // 권한 판별 상세 정보
        const checks = {
          'position에 스탭 포함': userPosition.includes('스탭'),
          'jobTitle에 스탭 포함': userJobTitle.includes('스탭'),
          'position에 지점장 포함': userPosition.includes('지점장'),
          'jobTitle에 지점장 포함': userJobTitle.includes('지점장'),
          'admin 계정': userAccount === 'admin',
          'jobTitle에 시스템관리자 포함': userJobTitle.includes('시스템관리자')
        }
        
        const trueChecks = Object.entries(checks).filter(([_, value]) => value)
        if (trueChecks.length > 0) {
          console.log(`   🔍 권한 근거: ${trueChecks.map(([key, _]) => key).join(', ')}`)
        }
        
      } else {
        console.log(`\n❌ ${account}: 사용자를 찾을 수 없습니다.`)
      }
    }
    
    console.log('\n' + '=' .repeat(100))
    console.log('✅ 권한 확인 완료')
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
checkSpecificUsers()