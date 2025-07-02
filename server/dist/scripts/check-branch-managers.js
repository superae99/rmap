"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
async function checkBranchManagers() {
    try {
        console.log('🔍 지점장 계정 조회 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 지점장 계정들 조회
        const branchManagers = await userRepository
            .createQueryBuilder('user')
            .where('user.position LIKE :position', { position: '%지점장%' })
            .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%지점장%' })
            .select([
            'user.employeeId',
            'user.account',
            'user.employeeName',
            'user.position',
            'user.jobTitle',
            'user.branchName'
        ])
            .limit(10)
            .getMany();
        console.log(`\n📋 지점장 계정 목록 (총 ${branchManagers.length}개):`);
        console.log('='.repeat(80));
        branchManagers.forEach((manager, index) => {
            console.log(`${index + 1}. ${manager.employeeName} (${manager.employeeId})`);
            console.log(`   계정: ${manager.account}`);
            console.log(`   직책: ${manager.position}`);
            console.log(`   직급: ${manager.jobTitle}`);
            console.log(`   지점: ${manager.branchName}`);
            console.log('   ---');
        });
        // 수도권1지사 관련 지점장이 있는지 확인
        const sudogwon1Managers = branchManagers.filter(m => m.branchName?.includes('수도권1') || m.jobTitle?.includes('수도권1'));
        if (sudogwon1Managers.length > 0) {
            console.log(`\n🎯 수도권1지사 관련 지점장: ${sudogwon1Managers.length}명`);
            sudogwon1Managers.forEach(manager => {
                console.log(`   ${manager.employeeName} - ${manager.branchName}`);
            });
        }
    }
    catch (error) {
        console.error('❌ 지점장 조회 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
checkBranchManagers();
//# sourceMappingURL=check-branch-managers.js.map