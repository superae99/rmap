import { AppDataSource } from '../config/database'
import { Partner } from '../models/Partner'
import { User } from '../models/User'

const checkSystemData = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const partnerRepository = AppDataSource.getRepository(Partner)
    const userRepository = AppDataSource.getRepository(User)
    
    // 전체 거래처 수 확인
    const totalPartners = await partnerRepository.count()
    const activePartners = await partnerRepository.count({ where: { isActive: true } })
    
    console.log('📊 전체 시스템 데이터 현황:')
    console.log('=' .repeat(80))
    console.log(`총 거래처 수: ${totalPartners}개`)
    console.log(`활성 거래처 수: ${activePartners}개`)
    
    // 거래처를 담당하는 담당자들 확인
    const managersWithPartners = await userRepository
      .createQueryBuilder('user')
      .innerJoin(Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
      .select(['user.employeeId', 'user.employeeName', 'user.branchName', 'user.officeName'])
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('partner.isActive = :partnerActive', { partnerActive: true })
      .groupBy('user.employeeId')
      .addGroupBy('user.employeeName')
      .addGroupBy('user.branchName')
      .addGroupBy('user.officeName')
      .getMany()
    
    console.log(`\n👥 거래처를 담당하는 담당자 수: ${managersWithPartners.length}명`)
    
    if (managersWithPartners.length > 0) {
      console.log('\n담당자 목록 (처음 10명):')
      managersWithPartners.slice(0, 10).forEach((manager, index) => {
        console.log(`${index + 1}. ${manager.employeeName} (${manager.employeeId}) - ${manager.branchName || 'N/A'} > ${manager.officeName || 'N/A'}`)
      })
      if (managersWithPartners.length > 10) {
        console.log(`... 외 ${managersWithPartners.length - 10}명`)
      }
    }
    
    // 지사 목록 확인
    const branchData = await userRepository
      .createQueryBuilder('user')
      .innerJoin(Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
      .select('DISTINCT user.branchName', 'branchName')
      .where('user.branchName IS NOT NULL')
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('partner.isActive = :partnerActive', { partnerActive: true })
      .orderBy('user.branchName')
      .getRawMany()
    
    const branches = branchData.map(b => b.branchName)
    console.log(`\n🏢 활성 거래처가 있는 지사: ${branches.length}개`)
    if (branches.length > 0) {
      console.log('지사 목록:')
      branches.forEach((branch, index) => {
        console.log(`${index + 1}. ${branch}`)
      })
    }
    
    // 지점 목록 확인
    const officeData = await userRepository
      .createQueryBuilder('user')
      .innerJoin(Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
      .select(['user.officeName', 'user.branchName'])
      .where('user.officeName IS NOT NULL')
      .andWhere('user.branchName IS NOT NULL')
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('partner.isActive = :partnerActive', { partnerActive: true })
      .groupBy('user.officeName')
      .addGroupBy('user.branchName')
      .orderBy('user.branchName')
      .addOrderBy('user.officeName')
      .getRawMany()
    
    console.log(`\n🏪 활성 거래처가 있는 지점: ${officeData.length}개`)
    if (officeData.length > 0) {
      console.log('지점 목록 (처음 10개):')
      officeData.slice(0, 10).forEach((office, index) => {
        console.log(`${index + 1}. ${office.user_branchName} > ${office.user_officeName}`)
      })
      if (officeData.length > 10) {
        console.log(`... 외 ${officeData.length - 10}개`)
      }
    }
    
    // jihoonseo와 seanslim이 STAFF로서 접근 가능한 필터 시뮬레이션
    console.log('\n' + '=' .repeat(80))
    console.log('🔐 STAFF 계정이 접근 가능한 필터 옵션:')
    console.log(`지사 필터: ${branches.length}개`)
    console.log(`지점 필터: ${officeData.length}개`)
    console.log(`담당자 필터: ${managersWithPartners.length}개`)
    
    if (branches.length === 0 && officeData.length === 0 && managersWithPartners.length === 0) {
      console.log('\n❌ 시스템에 활성 거래처 데이터가 없어서 STAFF 계정도 필터 옵션을 볼 수 없습니다.')
      console.log('💡 해결책: 실제 거래처 데이터를 업로드하거나 기존 데이터를 활성화해야 합니다.')
    } else {
      console.log('\n✅ STAFF 계정은 위의 필터 옵션들에 접근할 수 있어야 합니다.')
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
checkSystemData()