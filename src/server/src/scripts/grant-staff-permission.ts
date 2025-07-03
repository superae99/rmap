import { AppDataSource } from '../config/database'
import { User } from '../models/User'
import * as XLSX from 'xlsx'
import * as path from 'path'

const grantStaffPermission = async () => {
  try {
    // Excel 파일 경로
    const excelPath = path.join(__dirname, '../../data/Users2.xlsx')
    console.log('📄 Excel 파일 읽기:', excelPath)
    
    // Excel 파일 읽기
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`📊 총 ${data.length}개의 계정 발견\n`)
    
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // 업데이트 카운터
    let updatedCount = 0
    let skippedCount = 0
    let notFoundCount = 0
    const excludedAccount = 'hyeongraekim'
    
    console.log('🔄 Staff 권한 부여 시작...')
    console.log('=' .repeat(80))
    
    for (const row of data) {
      const account = (row as any)['계정'] || (row as any)['account']
      
      if (!account) {
        console.log('⚠️  계정 정보 없음:', row)
        continue
      }
      
      // hyeongraekim 계정 제외
      if (account === excludedAccount) {
        console.log(`❌ 제외: ${account} (요청에 따라 제외)`)
        skippedCount++
        continue
      }
      
      // 해당 계정의 사용자 찾기
      const user = await userRepository.findOne({
        where: { account: account }
      })
      
      if (!user) {
        console.log(`❌ 미발견: ${account} - 데이터베이스에 없는 계정`)
        notFoundCount++
        continue
      }
      
      // 이미 스탭 권한이 있는지 확인
      if (user.position?.includes('스탭') || user.jobTitle?.includes('스탭')) {
        console.log(`⏭️  스킵: ${account} (${user.employeeName}) - 이미 staff 권한 보유`)
        skippedCount++
        continue
      }
      
      // Staff 권한 부여 - position에 '스탭' 추가
      const originalPosition = user.position || ''
      const originalJobTitle = user.jobTitle || ''
      
      // position 업데이트 (기존 직급 유지하면서 스탭 추가)
      if (originalPosition && !originalPosition.includes('스탭')) {
        user.position = originalPosition + '/스탭'
      } else if (!originalPosition) {
        user.position = '스탭'
      }
      
      // jobTitle 업데이트 (필요한 경우)
      if (!originalJobTitle.includes('스탭')) {
        user.jobTitle = originalJobTitle ? originalJobTitle + '(스탭권한)' : '스탭권한'
      }
      
      await userRepository.save(user)
      
      console.log(`✅ 부여: ${account} (${user.employeeName})`)
      console.log(`   - 직급: ${originalPosition} → ${user.position}`)
      console.log(`   - 직책: ${originalJobTitle} → ${user.jobTitle}`)
      updatedCount++
    }
    
    console.log('=' .repeat(80))
    console.log('\n📊 처리 결과:')
    console.log(`- ✅ Staff 권한 부여: ${updatedCount}명`)
    console.log(`- ⏭️  스킵 (이미 권한 있음/제외): ${skippedCount}명`)
    console.log(`- ❌ 미발견 계정: ${notFoundCount}명`)
    console.log(`- 📋 전체 처리: ${data.length}명`)
    
    // 현재 staff 권한 사용자 수 확인
    const totalStaffUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.position LIKE :position', { position: '%스탭%' })
      .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%스탭%' })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getCount()
    
    console.log(`\n📊 현재 전체 Staff 권한 사용자: ${totalStaffUsers}명`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
grantStaffPermission()