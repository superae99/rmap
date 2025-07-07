import { AppDataSource } from '../config/database'
import { Partner } from '../models/Partner'

const checkJihoonseoPartners = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const partnerRepository = AppDataSource.getRepository(Partner)
    
    // jihoonseo(서지훈, employeeId: 19950312)가 담당하는 거래처 확인
    const jihoonseoPartners = await partnerRepository.find({
      where: { currentManagerEmployeeId: '19950312' },
      select: ['partnerCode', 'partnerName', 'currentManagerEmployeeId', 'currentManagerName', 'isActive']
    })
    
    console.log(`📊 jihoonseo(서지훈, employeeId: 19950312)가 담당하는 거래처:`)
    console.log(`   총 ${jihoonseoPartners.length}개`)
    console.log('')
    
    if (jihoonseoPartners.length > 0) {
      console.log('거래처 목록:')
      jihoonseoPartners.forEach((partner, index) => {
        console.log(`${index + 1}. ${partner.partnerName} (${partner.partnerCode}) - 활성: ${partner.isActive}`)
      })
    } else {
      console.log('❌ jihoonseo가 담당하는 거래처가 없습니다.')
    }
    
    // 활성 거래처만 카운트
    const activePartners = jihoonseoPartners.filter(p => p.isActive)
    console.log(`\n📈 활성 거래처: ${activePartners.length}개`)
    
    // 비교용: seanslim(임승석, employeeId: 30243079)이 담당하는 거래처 확인
    const seanslimPartners = await partnerRepository.find({
      where: { currentManagerEmployeeId: '30243079' },
      select: ['partnerCode', 'partnerName', 'currentManagerEmployeeId', 'currentManagerName', 'isActive']
    })
    
    console.log(`\n📊 seanslim(임승석, employeeId: 30243079)이 담당하는 거래처:`)
    console.log(`   총 ${seanslimPartners.length}개`)
    
    if (seanslimPartners.length > 0) {
      console.log('거래처 목록 (처음 5개만):')
      seanslimPartners.slice(0, 5).forEach((partner, index) => {
        console.log(`${index + 1}. ${partner.partnerName} (${partner.partnerCode}) - 활성: ${partner.isActive}`)
      })
      if (seanslimPartners.length > 5) {
        console.log(`... 외 ${seanslimPartners.length - 5}개`)
      }
    } else {
      console.log('❌ seanslim이 담당하는 거래처가 없습니다.')
    }
    
    const activeSeanslimPartners = seanslimPartners.filter(p => p.isActive)
    console.log(`📈 활성 거래처: ${activeSeanslimPartners.length}개`)
    
    // 결론
    console.log('\n' + '=' .repeat(80))
    console.log('🔍 필터 옵션 조회 가능 여부:')
    console.log(`jihoonseo: ${activePartners.length > 0 ? '가능' : '불가능'} (활성 거래처 ${activePartners.length}개)`)
    console.log(`seanslim:  ${activeSeanslimPartners.length > 0 ? '가능' : '불가능'} (활성 거래처 ${activeSeanslimPartners.length}개)`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
checkJihoonseoPartners()