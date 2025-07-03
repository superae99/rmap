import { AppDataSource } from '../config/database'
import { User } from '../models/User'

const checkStaffUsers = async () => {
  try {
    await AppDataSource.initialize()
    
    const userRepository = AppDataSource.getRepository(User)
    
    const staffUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.position LIKE :position', { position: '%스탭%' })
      .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%스탭%' })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .orderBy('user.employeeId', 'ASC')
      .getMany()
    
    console.log('현재 Staff 권한 사용자:')
    staffUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.employeeName} (${user.account}) - ${user.headquartersName} ${user.divisionName || 'N/A'} ${user.position} ${user.jobTitle}`)
    })
    
    console.log(`\n총 ${staffUsers.length}명`)
    
    await AppDataSource.destroy()
  } catch (error) {
    console.error('오류:', error)
  }
}

checkStaffUsers()