"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
async function deleteSeoulBranchData() {
    try {
        console.log('🔍 서울지사 데이터 조회 및 삭제 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 서울지사 사용자들 조회
        const seoulUsers = await userRepository.find({
            where: { branchName: '서울지사' }
        });
        console.log(`📊 발견된 서울지사 사용자: ${seoulUsers.length}명`);
        if (seoulUsers.length > 0) {
            console.log('서울지사 사용자 목록:');
            seoulUsers.forEach(user => {
                console.log(`- ${user.employeeId}: ${user.employeeName} (${user.position}/${user.jobTitle})`);
            });
            // 서울지사 사용자들 삭제
            await userRepository.remove(seoulUsers);
            console.log(`✅ 서울지사 사용자 ${seoulUsers.length}명 삭제 완료`);
        }
        else {
            console.log('❌ 서울지사 사용자를 찾을 수 없습니다.');
        }
        // 삭제 후 남은 지사 목록 확인
        const remainingBranches = await userRepository
            .createQueryBuilder('user')
            .select('DISTINCT user.branchName', 'branchName')
            .where('user.branchName IS NOT NULL')
            .orderBy('user.branchName')
            .getRawMany();
        console.log('\n남은 지사 목록:');
        remainingBranches.forEach(branch => {
            console.log(`- ${branch.branchName}`);
        });
    }
    catch (error) {
        console.error('❌ 삭제 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
deleteSeoulBranchData();
//# sourceMappingURL=delete-seoul-branch.js.map