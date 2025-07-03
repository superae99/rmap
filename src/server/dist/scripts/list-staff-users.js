"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const listStaffUsers = async () => {
    try {
        await database_1.AppDataSource.initialize();
        console.log('🔍 데이터베이스 연결 성공\n');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // staff 권한 사용자 조회 (position 또는 jobTitle에 '스탭' 포함)
        const staffUsers = await userRepository
            .createQueryBuilder('user')
            .where('user.position LIKE :position', { position: '%스탭%' })
            .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%스탭%' })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .orderBy('user.employeeId', 'ASC')
            .getMany();
        console.log('📋 현재 Staff 권한 사용자 목록');
        console.log('='.repeat(80));
        if (staffUsers.length === 0) {
            console.log('❌ Staff 권한 사용자가 없습니다.');
        }
        else {
            console.log(`✅ 총 ${staffUsers.length}명의 Staff 권한 사용자가 있습니다.\n`);
            // 테이블 헤더
            console.log('사번'.padEnd(12) + '이름'.padEnd(15) + '계정'.padEnd(15) +
                '직급'.padEnd(15) + '직책'.padEnd(20) + '소속');
            console.log('-'.repeat(80));
            staffUsers.forEach(user => {
                const officePath = [user.headquartersName, user.branchName, user.officeName]
                    .filter(Boolean)
                    .join(' > ');
                console.log(user.employeeId.padEnd(12) +
                    user.employeeName.padEnd(15) +
                    user.account.padEnd(15) +
                    (user.position || '-').padEnd(15) +
                    (user.jobTitle || '-').padEnd(20) +
                    officePath);
            });
        }
        console.log('\n' + '='.repeat(80));
        // 추가 통계
        const allUsers = await userRepository.count();
        const activeUsers = await userRepository.count({ where: { isActive: true } });
        console.log('\n📊 사용자 통계');
        console.log(`- 전체 사용자: ${allUsers}명`);
        console.log(`- 활성 사용자: ${activeUsers}명`);
        console.log(`- Staff 권한 사용자: ${staffUsers.length}명 (${((staffUsers.length / activeUsers) * 100).toFixed(1)}%)`);
        // 권한별 사용자 수 통계
        const adminUsers = await userRepository
            .createQueryBuilder('user')
            .where('user.account = :account', { account: 'admin' })
            .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%시스템관리자%' })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getCount();
        const managerUsers = await userRepository
            .createQueryBuilder('user')
            .where('user.position LIKE :position', { position: '%지점장%' })
            .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%지점장%' })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getCount();
        console.log('\n🎭 권한별 사용자 분포');
        console.log(`- Admin 권한: ${adminUsers}명`);
        console.log(`- Staff 권한: ${staffUsers.length}명`);
        console.log(`- Manager 권한: ${managerUsers}명`);
        console.log(`- User 권한: ${activeUsers - adminUsers - staffUsers.length - managerUsers}명`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
// 스크립트 실행
listStaffUsers();
//# sourceMappingURL=list-staff-users.js.map