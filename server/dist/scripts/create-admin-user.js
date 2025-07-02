"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createAdminUser = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 기존 admin 계정 확인
        const existingAdmin = await userRepository.findOne({
            where: { account: 'admin' }
        });
        if (existingAdmin) {
            console.log('⚠️  admin 계정이 이미 존재합니다.');
            console.log('- 사번:', existingAdmin.employeeId);
            console.log('- 계정:', existingAdmin.account);
            console.log('- 이름:', existingAdmin.employeeName);
            return;
        }
        // 새 admin 계정 생성
        console.log('🔧 새 admin 계정 생성 중...');
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        // 사번은 ADMIN001로 설정
        const adminUser = userRepository.create({
            employeeId: 'ADMIN001',
            employeeName: '시스템관리자',
            account: 'admin',
            password: hashedPassword,
            position: 'Admin',
            jobTitle: '시스템관리자',
            headquartersName: '본사',
            branchName: '시스템관리부',
            officeName: '시스템관리팀',
            isActive: true,
            workStatus: '재직',
            employmentType: '정규직'
        });
        await userRepository.save(adminUser);
        console.log('✅ admin 계정 생성 완료!');
        console.log('- 사번: ADMIN001');
        console.log('- 계정: admin');
        console.log('- 비밀번호: password123');
        console.log('- 이름: 시스템관리자');
        console.log('- 직책: 시스템관리자');
        // 생성된 계정 검증
        const createdAdmin = await userRepository.findOne({
            where: { account: 'admin' }
        });
        if (createdAdmin) {
            const isPasswordValid = await bcryptjs_1.default.compare('password123', createdAdmin.password);
            console.log('🔍 생성된 계정 검증:');
            console.log('- 계정 존재:', '✅');
            console.log('- 비밀번호 검증:', isPasswordValid ? '✅' : '❌');
            console.log('- Admin 권한:', createdAdmin.jobTitle?.includes('시스템관리자') ? '✅' : '❌');
        }
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
createAdminUser();
//# sourceMappingURL=create-admin-user.js.map