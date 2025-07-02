"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createTestBranchManager() {
    try {
        console.log('🚀 테스트 지점장 계정 생성 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 기존 테스트 계정 삭제 (있다면)
        const existingUser = await userRepository.findOne({
            where: { employeeId: 'TEST_MANAGER_001' }
        });
        if (existingUser) {
            await userRepository.remove(existingUser);
            console.log('🗑️ 기존 테스트 계정 삭제 완료');
        }
        // 비밀번호 해시
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        // 수도권1지사 지점장 계정 생성
        const testBranchManager = userRepository.create({
            employeeId: 'TEST_MANAGER_001',
            account: 'test_manager',
            password: hashedPassword,
            employeeName: '테스트지점장',
            position: '지점장',
            jobTitle: '주류수도권1지사지점장',
            branchName: '주류수도권1지사',
            isActive: true
        });
        await userRepository.save(testBranchManager);
        console.log('✅ 테스트 지점장 계정 생성 완료');
        console.log('📋 계정 정보:');
        console.log(`   - 사번: ${testBranchManager.employeeId}`);
        console.log(`   - 계정: ${testBranchManager.account}`);
        console.log(`   - 비밀번호: password123`);
        console.log(`   - 이름: ${testBranchManager.employeeName}`);
        console.log(`   - 직책: ${testBranchManager.position}`);
        console.log(`   - 직급: ${testBranchManager.jobTitle}`);
        console.log(`   - 지점명: ${testBranchManager.branchName}`);
    }
    catch (error) {
        console.error('❌ 테스트 계정 생성 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
createTestBranchManager();
//# sourceMappingURL=create-test-branch-manager.js.map