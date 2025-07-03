import { AppDataSource } from '../config/database'
import { User } from '../models/User'
import * as XLSX from 'xlsx'
import * as path from 'path'
import bcrypt from 'bcryptjs'

const importAndGrantStaff = async () => {
  try {
    // Excel 파일 경로
    const excelPath = path.join(__dirname, '../../data/Users2.xlsx')
    console.log('📄 Excel 파일 읽기:', excelPath)
    
    // Excel 파일 읽기
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`📊 총 ${data.length}개의 사용자 발견\n`)
    
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')
    
    const userRepository = AppDataSource.getRepository(User)
    
    // 카운터
    let importedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const excludedAccount = 'hyeongraekim'
    
    console.log('🔄 사용자 등록 및 Staff 권한 부여 시작...')
    console.log('=' .repeat(80))
    
    for (const row of data) {
      const rowData = row as any
      const account = rowData['계정']
      const employeeId = String(rowData['직원 ID'])
      const employeeName = rowData['성명']
      
      if (!account || !employeeId || !employeeName) {
        console.log('⚠️  필수 정보 누락:', { account, employeeId, employeeName })
        errorCount++
        continue
      }
      
      // hyeongraekim 계정 제외
      if (account === excludedAccount) {
        console.log(`❌ 제외: ${account} (${employeeName}) - 요청에 따라 제외`)
        skippedCount++
        continue
      }
      
      try {
        // 기존 사용자 확인 (사번과 계정 둘 다 체크)
        const existingUser = await userRepository.findOne({
          where: [
            { employeeId: employeeId },
            { account: account }
          ]
        })
        
        if (existingUser) {
          console.log(`⏭️  스킵: ${account} (${employeeName}) - 이미 존재`)
          skippedCount++
          continue
        }
        
        // 비밀번호 해시화
        const password = rowData['비밀번호'] || 'lotte1234!'
        const hashedPassword = await bcrypt.hash(password, 10)
        
        // 새 사용자 생성
        const newUser = userRepository.create({
          employeeId: employeeId,
          employeeName: employeeName,
          account: account,
          password: hashedPassword,
          
          // 조직 정보
          headquartersCode: rowData['본부코드'] || null,
          headquartersName: rowData['본부'] || null,
          divisionCode: rowData['부문코드'] === 'Null' ? null : rowData['부문코드'],
          divisionName: rowData['부문'] === 'Undefined' ? null : rowData['부문'],
          branchCode: rowData['지사코드'] === 'Null' ? null : rowData['지사코드'],
          branchName: rowData['지사'] === 'Undefined' ? null : rowData['지사'],
          officeCode: rowData['지점코드'] === 'Null' ? null : rowData['지점코드'],
          officeName: rowData['지점'] === 'Undefined' ? null : rowData['지점'],
          
          // 직급/직책 정보 - Staff 권한을 위해 '스탭' 추가
          position: rowData['직급'] ? `${rowData['직급']}/스탭` : '스탭',
          jobTitle: rowData['직책'] ? `${rowData['직책']}(스탭권한)` : '스탭권한',
          assignment: rowData['발령직무'] || null,
          fieldType: rowData['스탭/필드'] || null,
          
          // 고용 정보
          employmentType: rowData['고용구분'] === '고정직' ? '정규직' : rowData['고용구분'],
          workStatus: rowData['근무상태'] || '재직',
          
          // 시스템 정보
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        await userRepository.save(newUser)
        
        console.log(`✅ 등록: ${account} (${employeeName})`)
        console.log(`   - 사번: ${employeeId}`)
        console.log(`   - 직급: ${rowData['직급']} → ${newUser.position}`)
        console.log(`   - 직책: ${rowData['직책']} → ${newUser.jobTitle}`)
        console.log(`   - 조직: ${newUser.headquartersName} > ${newUser.divisionName || 'N/A'} > ${newUser.officeName || 'N/A'}`)
        
        importedCount++
        
      } catch (error) {
        console.error(`❌ 오류 발생 - ${account} (${employeeName}):`, error)
        errorCount++
      }
    }
    
    console.log('=' .repeat(80))
    console.log('\n📊 처리 결과:')
    console.log(`- ✅ 등록 완료: ${importedCount}명`)
    console.log(`- ⏭️  스킵: ${skippedCount}명`)
    console.log(`- ❌ 오류: ${errorCount}명`)
    console.log(`- 📋 전체 처리: ${data.length}명`)
    
    // 현재 staff 권한 사용자 수 확인
    const totalStaffUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.position LIKE :position', { position: '%스탭%' })
      .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%스탭%' })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getCount()
    
    console.log(`\n📊 현재 전체 Staff 권한 사용자: ${totalStaffUsers}명`)
    
    // 새로 등록된 사용자들 확인
    if (importedCount > 0) {
      console.log('\n📋 새로 등록된 Staff 사용자 목록:')
      console.log('-'.repeat(80))
      
      const newStaffUsers = await userRepository
        .createQueryBuilder('user')
        .where('user.position LIKE :position', { position: '%스탭%' })
        .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%스탭%' })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .andWhere('user.createdAt >= :today', { today: new Date().toISOString().split('T')[0] })
        .orderBy('user.employeeId', 'ASC')
        .getMany()
      
      newStaffUsers.forEach(user => {
        console.log(`${user.employeeId} | ${user.employeeName} | ${user.account} | ${user.position} | ${user.jobTitle}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 전체 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
importAndGrantStaff()