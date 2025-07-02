"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
async function createTestUsers() {
    try {
        // 데이터베이스 연결
        await database_1.AppDataSource.initialize();
        console.log('데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 관리자 계정 정보
        const adminData = {
            employeeId: 'ADMIN001',
            employeeName: '시스템관리자',
            account: 'admin',
            password: await bcryptjs_1.default.hash('password123', 10),
            position: '팀장',
            jobTitle: '시스템관리자',
            isActive: true,
            headquartersName: '본사',
            divisionName: 'IT부문',
            branchName: '서울지사',
            officeName: '본점'
        };
        // 지점장 계정 정보
        const managerData = {
            employeeId: 'MGR001',
            employeeName: '홍길동',
            account: 'manager',
            password: await bcryptjs_1.default.hash('password123', 10),
            position: '지점장',
            jobTitle: '영업관리',
            isActive: true,
            headquartersName: '본사',
            divisionName: '영업부문',
            branchName: '서울지사',
            officeName: '강남지점'
        };
        // 일반 사용자 계정 정보
        const userData = {
            employeeId: 'USER001',
            employeeName: '김직원',
            account: 'user',
            password: await bcryptjs_1.default.hash('password123', 10),
            position: '대리',
            jobTitle: '영업담당',
            isActive: true,
            headquartersName: '본사',
            divisionName: '영업부문',
            branchName: '서울지사',
            officeName: '강남지점'
        };
        const testAccounts = [
            { data: adminData, name: '관리자' },
            { data: managerData, name: '지점장' },
            { data: userData, name: '일반사용자' }
        ];
        for (const { data, name } of testAccounts) {
            const existing = await userRepository.findOne({
                where: { account: data.account }
            });
            if (existing) {
                console.log(`${name} 계정이 이미 존재합니다.`);
                // 비밀번호 업데이트
                existing.password = data.password;
                await userRepository.save(existing);
                console.log(`${name} 비밀번호가 업데이트되었습니다.`);
            }
            else {
                // 새 계정 생성
                const user = userRepository.create(data);
                await userRepository.save(user);
                console.log(`${name} 계정이 생성되었습니다.`);
            }
        }
        console.log('=================================');
        console.log('테스트 계정 정보:');
        console.log('1. 관리자 (admin 권한)');
        console.log('   계정: admin / 비밀번호: password123');
        console.log('   권한: 모든 기능 사용 가능');
        console.log('');
        console.log('2. 지점장 (manager 권한)');
        console.log('   계정: manager / 비밀번호: password123');
        console.log('   권한: 거래처/영역 생성, 수정 가능');
        console.log('');
        console.log('3. 일반사용자 (user 권한)');
        console.log('   계정: user / 비밀번호: password123');
        console.log('   권한: 조회만 가능');
        console.log('=================================');
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('오류 발생:', error);
        process.exit(1);
    }
}
createTestUsers();
//# sourceMappingURL=create-admin.js.map