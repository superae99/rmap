"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Partner_1 = require("../models/Partner");
const testFilterOptions = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        // 지사 목록 확인
        console.log('\n📋 지사 목록 조회...');
        const branchData = await userRepository
            .createQueryBuilder('user')
            .select('DISTINCT user.branchName', 'branchName')
            .where('user.branchName IS NOT NULL')
            .orderBy('user.branchName')
            .getRawMany();
        console.log('지사 수:', branchData.length);
        console.log('지사들:', branchData.map(b => b.branchName).slice(0, 5));
        // 지점 목록 확인
        console.log('\n📋 지점 목록 조회...');
        const officeData = await userRepository
            .createQueryBuilder('user')
            .select('DISTINCT user.officeName', 'officeName')
            .addSelect('user.branchName', 'branchName')
            .where('user.officeName IS NOT NULL')
            .andWhere('user.branchName IS NOT NULL')
            .orderBy('user.branchName')
            .addOrderBy('user.officeName')
            .getRawMany();
        console.log('지점 수:', officeData.length);
        console.log('지점들 (처음 5개):', officeData.slice(0, 5));
        // 담당자 목록 확인
        console.log('\n📋 담당자 목록 조회...');
        const managers = await userRepository
            .createQueryBuilder('user')
            .select(['user.employeeId', 'user.employeeName', 'user.branchName', 'user.officeName'])
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('user.position NOT LIKE :position', { position: '%지점장%' })
            .andWhere('user.jobTitle NOT LIKE :jobTitle', { jobTitle: '%지점장%' })
            .orderBy('user.branchName')
            .addOrderBy('user.officeName')
            .addOrderBy('user.employeeName')
            .getMany();
        console.log('담당자 수:', managers.length);
        console.log('담당자들 (처음 5개):', managers.slice(0, 5).map(m => ({
            employeeId: m.employeeId,
            employeeName: m.employeeName,
            branchName: m.branchName,
            officeName: m.officeName
        })));
        // Admin 계정 확인
        console.log('\n👤 Admin 계정 확인...');
        const adminUser = await userRepository.findOne({
            where: { account: 'admin' }
        });
        if (adminUser) {
            console.log('✅ Admin 계정 존재:');
            console.log('- 사번:', adminUser.employeeId);
            console.log('- 이름:', adminUser.employeeName);
            console.log('- 직책:', adminUser.jobTitle);
            console.log('- 권한 확인:', adminUser.account === 'admin' || adminUser.jobTitle?.includes('시스템관리자'));
        }
        else {
            console.log('❌ Admin 계정 없음');
        }
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
testFilterOptions();
//# sourceMappingURL=test-filter-options.js.map