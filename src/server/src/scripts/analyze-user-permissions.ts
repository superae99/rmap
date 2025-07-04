import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const analyzeUserPermissions = async () => {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // 전체 사용자 수 조회
    const totalUsers = await userRepository.count()
    console.log(`📊 전체 사용자 수: ${totalUsers}명\n`)
    
    // 활성 사용자 수 조회
    const activeUsers = await userRepository.count({ where: { isActive: true } })
    console.log(`✅ 활성 사용자 수: ${activeUsers}명`)
    console.log(`❌ 비활성 사용자 수: ${totalUsers - activeUsers}명\n`)
    
    // 모든 활성 사용자 정보 조회
    const users = await userRepository.find({ 
      where: { isActive: true },
      select: ['employeeId', 'employeeName', 'account', 'position', 'jobTitle', 'branchName', 'officeName']
    })
    
    // 권한 분류 함수 (auth.middleware.ts와 동일한 로직)
    const getUserRole = (user: User): string => {
      const userPosition = user.position || ''
      const userJobTitle = user.jobTitle || ''
      const userAccount = user.account || ''
      
      // admin 계정은 최고 권한
      if (userAccount === 'admin' || userJobTitle.includes('시스템관리자')) {
        return 'admin'
      }
      // staff 권한 (스탭 - 조회만 가능, 생성/수정 불가)
      else if (userPosition.includes('스탭') || userJobTitle.includes('스탭')) {
        return 'staff'
      }
      // 지점장 권한
      else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
        return 'manager'
      }
      
      return 'user' // 기본 권한
    }
    
    // 권한별 사용자 분류
    const roleStats: { [key: string]: User[] } = {
      admin: [],
      manager: [],
      staff: [],
      user: []
    }
    
    users.forEach(user => {
      const role = getUserRole(user)
      roleStats[role].push(user)
    })
    
    // 권한별 통계 출력
    console.log('🔐 권한별 사용자 분석 결과')
    console.log('=' .repeat(80))
    
    // Admin 권한 사용자
    console.log(`\n👑 ADMIN 권한 (${roleStats.admin.length}명):`)
    if (roleStats.admin.length > 0) {
      roleStats.admin.forEach(user => {
        console.log(`  - ${user.employeeName} (${user.account}) | ${user.position || 'N/A'} | ${user.jobTitle || 'N/A'}`)
      })
    } else {
      console.log('  (해당 권한 사용자 없음)')
    }
    
    // Manager 권한 사용자
    console.log(`\n🏢 MANAGER 권한 (${roleStats.manager.length}명):`)
    if (roleStats.manager.length > 0) {
      roleStats.manager.slice(0, 10).forEach(user => {
        console.log(`  - ${user.employeeName} (${user.account}) | ${user.position || 'N/A'} | ${user.branchName || 'N/A'} ${user.officeName || 'N/A'}`)
      })
      if (roleStats.manager.length > 10) {
        console.log(`  ... 및 ${roleStats.manager.length - 10}명 추가`)
      }
    } else {
      console.log('  (해당 권한 사용자 없음)')
    }
    
    // Staff 권한 사용자
    console.log(`\n📋 STAFF 권한 (${roleStats.staff.length}명):`)
    if (roleStats.staff.length > 0) {
      roleStats.staff.slice(0, 10).forEach(user => {
        console.log(`  - ${user.employeeName} (${user.account}) | ${user.position || 'N/A'} | ${user.branchName || 'N/A'} ${user.officeName || 'N/A'}`)
      })
      if (roleStats.staff.length > 10) {
        console.log(`  ... 및 ${roleStats.staff.length - 10}명 추가`)
      }
    } else {
      console.log('  (해당 권한 사용자 없음)')
    }
    
    // User 권한 사용자
    console.log(`\n👤 USER 권한 (${roleStats.user.length}명):`)
    if (roleStats.user.length > 0) {
      roleStats.user.slice(0, 10).forEach(user => {
        console.log(`  - ${user.employeeName} (${user.account}) | ${user.position || 'N/A'} | ${user.branchName || 'N/A'} ${user.officeName || 'N/A'}`)
      })
      if (roleStats.user.length > 10) {
        console.log(`  ... 및 ${roleStats.user.length - 10}명 추가`)
      }
    } else {
      console.log('  (해당 권한 사용자 없음)')
    }
    
    // 권한별 비율 계산
    console.log('\n📊 권한별 분포:')
    console.log('=' .repeat(40))
    Object.entries(roleStats).forEach(([role, users]) => {
      const percentage = ((users.length / activeUsers) * 100).toFixed(1)
      const roleName = {
        admin: 'Admin (시스템관리자)',
        manager: 'Manager (지점장)',
        staff: 'Staff (스탭)',
        user: 'User (일반사용자)'
      }[role]
      
      console.log(`${roleName}: ${users.length}명 (${percentage}%)`)
    })
    
    // 지사별 권한 분포 분석
    console.log('\n🏢 지사별 권한 분포:')
    console.log('=' .repeat(50))
    
    const branchStats: { [key: string]: { [role: string]: number } } = {}
    
    users.forEach(user => {
      const branch = user.branchName || '미배정'
      const role = getUserRole(user)
      
      if (!branchStats[branch]) {
        branchStats[branch] = { admin: 0, manager: 0, staff: 0, user: 0 }
      }
      branchStats[branch][role]++
    })
    
    Object.entries(branchStats)
      .sort(([,a], [,b]) => (b.admin + b.manager + b.staff + b.user) - (a.admin + a.manager + a.staff + a.user))
      .slice(0, 10)
      .forEach(([branch, stats]) => {
        const total = stats.admin + stats.manager + stats.staff + stats.user
        console.log(`${branch}: ${total}명 (Admin:${stats.admin}, Manager:${stats.manager}, Staff:${stats.staff}, User:${stats.user})`)
      })
    
    // 잠재적 권한 문제 분석
    console.log('\n⚠️  권한 체계 분석:')
    console.log('=' .repeat(50))
    
    // 중복 권한 문제 확인
    const duplicateRoles = users.filter(user => {
      const position = user.position || ''
      const jobTitle = user.jobTitle || ''
      
      let roleCount = 0
      if (position.includes('스탭') || jobTitle.includes('스탭')) roleCount++
      if (position.includes('지점장') || jobTitle.includes('지점장')) roleCount++
      if (jobTitle.includes('시스템관리자')) roleCount++
      
      return roleCount > 1
    })
    
    if (duplicateRoles.length > 0) {
      console.log(`❌ 중복 권한 사용자: ${duplicateRoles.length}명`)
      duplicateRoles.slice(0, 5).forEach(user => {
        console.log(`  - ${user.employeeName}: position="${user.position}", jobTitle="${user.jobTitle}"`)
      })
    } else {
      console.log('✅ 중복 권한 없음')
    }
    
    // 권한 없는 사용자 확인
    const noRoleUsers = users.filter(user => {
      const role = getUserRole(user)
      return role === 'user' && (!user.position && !user.jobTitle)
    })
    
    if (noRoleUsers.length > 0) {
      console.log(`⚠️  직급/직책 정보 없는 사용자: ${noRoleUsers.length}명`)
    } else {
      console.log('✅ 모든 사용자가 직급/직책 정보 보유')
    }
    
    // 특별 계정 확인
    const specialAccounts = users.filter(user => 
      ['admin', 'manager', 'user', 'test'].includes(user.account)
    )
    
    if (specialAccounts.length > 0) {
      console.log(`\n🔑 특별 계정 (${specialAccounts.length}개):`)
      specialAccounts.forEach(user => {
        const role = getUserRole(user)
        console.log(`  - ${user.account} → ${role} (${user.employeeName})`)
      })
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
analyzeUserPermissions()