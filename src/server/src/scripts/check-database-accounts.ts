import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const checkDatabaseAccounts = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🔍 데이터베이스 연결 성공\n')

    const userRepository = AppDataSource.getRepository(User)

    // Excel 파일에서 찾은 계정들
    const excelAccounts = [
      'leenc', 'jihoonseo', 'seanslim', 'shongwp', 'giseokjang',
      'narikim', 'hyeokjaelee', 'jiung.ha', 'hyeongraekim', 
      'eunji.lee.2', 'hojun_seo'
    ]

    console.log('📋 Excel 파일의 계정들을 데이터베이스에서 검색:')
    console.log('='.repeat(80))

    for (const account of excelAccounts) {
      const user = await userRepository.findOne({
        where: { account: account }
      })

      if (user) {
        console.log(`✅ 발견: ${account} - ${user.employeeName} (${user.employeeId})`)
      } else {
        console.log(`❌ 미발견: ${account}`)
      }
    }

    console.log('\n' + '='.repeat(80))

    // 유사한 계정들 검색
    console.log('\n🔍 유사한 계정명 검색:')
    for (const account of excelAccounts) {
      const users = await userRepository
        .createQueryBuilder('user')
        .where('user.account LIKE :account', { account: `%${account}%` })
        .orWhere('user.employeeName LIKE :name', { name: `%${account}%` })
        .getMany()

      if (users.length > 0) {
        console.log(`\n📋 "${account}" 관련 계정들:`)
        users.forEach(user => {
          console.log(`  - ${user.account} (${user.employeeName}, ${user.employeeId})`)
        })
      }
    }

    // 전체 계정 샘플 확인
    console.log('\n' + '='.repeat(80))
    console.log('\n📊 데이터베이스 계정 샘플 (처음 20개):')
    const sampleUsers = await userRepository.find({
      take: 20,
      order: { employeeId: 'ASC' }
    })

    sampleUsers.forEach(user => {
      console.log(`${user.account} - ${user.employeeName} (${user.employeeId})`)
    })

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

// 스크립트 실행
checkDatabaseAccounts()