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
        await database_1.AppDataSource.initialize();
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 기존 admin 계정 확인
        const existingAdmin = await userRepository.findOne({
            where: { account: 'admin' }
        });
        if (existingAdmin) {
            return;
        }
        // 새 admin 계정 생성
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
        // staff 권한 사용자도 생성 (예시)
        const existingStaff = await userRepository.findOne({
            where: { account: 'staff' }
        });
        if (!existingStaff) {
            const staffUser = userRepository.create({
                employeeId: 'STAFF001',
                employeeName: '스탭사용자',
                account: 'staff',
                password: hashedPassword,
                position: '스탭', // staff 권한 감지용
                jobTitle: '데이터분석스탭',
                headquartersName: '본사',
                branchName: '데이터분석부',
                officeName: '데이터분석팀',
                isActive: true,
                workStatus: '재직',
                employmentType: '정규직'
            });
            await userRepository.save(staffUser);
        }
        // 생성된 계정 검증
        const createdAdmin = await userRepository.findOne({
            where: { account: 'admin' }
        });
        if (createdAdmin) {
            const isPasswordValid = await bcryptjs_1.default.compare('password123', createdAdmin.password);
        }
    }
    catch (error) {
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
createAdminUser();
//# sourceMappingURL=create-admin-user.js.map