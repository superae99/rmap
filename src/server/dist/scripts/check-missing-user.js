"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const checkMissingUser = async () => {
    try {
        await database_1.AppDataSource.initialize();
        console.log('🔍 데이터베이스 연결 성공\n');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Excel에서 가져온 전체 계정 리스트 (hyeongraekim 제외)
        const expectedAccounts = [
            'leenc', 'jihoonseo', 'seanslim', 'shongwp', 'giseokjang',
            'narikim', 'hyeokjaelee', 'jiung.ha', 'eunji.lee.2', 'hojun_seo'
        ];
        console.log('📋 등록되어야 할 계정 확인:');
        console.log('='.repeat(60));
        for (const account of expectedAccounts) {
            const user = await userRepository.findOne({
                where: { account: account }
            });
            if (user) {
                const hasStaffPermission = user.position?.includes('스탭') || user.jobTitle?.includes('스탭');
                console.log(`✅ ${account} - ${user.employeeName} (사번: ${user.employeeId}) - Staff권한: ${hasStaffPermission ? 'O' : 'X'}`);
            }
            else {
                console.log(`❌ ${account} - 미등록`);
            }
        }
        // 오늘 등록된 모든 사용자 확인
        console.log('\n📅 오늘 등록된 모든 사용자:');
        console.log('='.repeat(60));
        const today = new Date().toISOString().split('T')[0];
        const todayUsers = await userRepository
            .createQueryBuilder('user')
            .where('DATE(user.createdAt) = :today', { today })
            .orderBy('user.employeeId', 'ASC')
            .getMany();
        if (todayUsers.length === 0) {
            console.log('❌ 오늘 등록된 사용자가 없습니다.');
        }
        else {
            console.log(`✅ 총 ${todayUsers.length}명이 오늘 등록되었습니다:\n`);
            todayUsers.forEach(user => {
                const hasStaffPermission = user.position?.includes('스탭') || user.jobTitle?.includes('스탭');
                console.log(`${user.employeeId} | ${user.employeeName} | ${user.account} | Staff권한: ${hasStaffPermission ? 'O' : 'X'}`);
            });
        }
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
// 스크립트 실행
checkMissingUser();
//# sourceMappingURL=check-missing-user.js.map