"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const checkAdminAccount = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // admin 계정 조회
        console.log('\n📋 admin 계정 조회 중...');
        const adminUser = await userRepository.findOne({
            where: { account: 'admin' }
        });
        if (!adminUser) {
            console.log('❌ admin 계정을 찾을 수 없습니다.');
            // 모든 계정 확인
            console.log('\n📋 모든 계정 목록:');
            const allUsers = await userRepository.find({
                select: ['employeeId', 'account', 'employeeName', 'position', 'jobTitle', 'isActive']
            });
            allUsers.forEach(user => {
                console.log(`- ${user.employeeId}: ${user.account} (${user.employeeName}) - ${user.position}/${user.jobTitle} - ${user.isActive ? 'Active' : 'Inactive'}`);
            });
            return;
        }
        console.log('✅ admin 계정 발견:');
        console.log('- 사번:', adminUser.employeeId);
        console.log('- 계정:', adminUser.account);
        console.log('- 이름:', adminUser.employeeName);
        console.log('- 직급:', adminUser.position);
        console.log('- 직책:', adminUser.jobTitle);
        console.log('- 활성화:', adminUser.isActive ? 'Yes' : 'No');
        console.log('- 비밀번호 해시:', adminUser.password ? '설정됨' : '미설정');
        // 비밀번호 검증
        if (adminUser.password) {
            const testPassword = 'password123';
            const isValid = await bcryptjs_1.default.compare(testPassword, adminUser.password);
            console.log(`- 비밀번호 '${testPassword}' 검증:`, isValid ? '✅ 성공' : '❌ 실패');
        }
        // admin 권한 확인
        const isAdmin = adminUser.account === 'admin' || adminUser.jobTitle?.includes('시스템관리자');
        console.log('- Admin 권한:', isAdmin ? '✅ 있음' : '❌ 없음');
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
checkAdminAccount();
//# sourceMappingURL=check-admin-account.js.map