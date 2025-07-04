"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// (스탭권한) 텍스트 제거 API
router.post('/remove-staff-suffix', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), async (req, res) => {
    try {
        console.log('🔍 (스탭권한) 텍스트 제거 작업 시작...');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // (스탭권한) 텍스트가 포함된 사용자 조회
        const usersWithStaffSuffix = await userRepository
            .createQueryBuilder('user')
            .where('user.jobTitle LIKE :suffix', { suffix: '%(스탭권한)%' })
            .getMany();
        console.log(`📋 수정 대상 사용자: ${usersWithStaffSuffix.length}명`);
        if (usersWithStaffSuffix.length === 0) {
            return res.json({
                success: true,
                message: '수정할 사용자가 없습니다.',
                updatedCount: 0,
                totalCount: 0
            });
        }
        let updatedCount = 0;
        const results = [];
        for (const user of usersWithStaffSuffix) {
            const originalJobTitle = user.jobTitle;
            const cleanedJobTitle = user.jobTitle?.replace(/\(스탭권한\)/g, '').trim();
            if (cleanedJobTitle !== originalJobTitle) {
                await userRepository.update({ employeeId: user.employeeId }, { jobTitle: cleanedJobTitle });
                results.push({
                    employeeName: user.employeeName,
                    account: user.account,
                    originalJobTitle,
                    cleanedJobTitle
                });
                console.log(`✅ 수정: ${user.employeeName} (${user.account})`);
                console.log(`   - 변경 전: ${originalJobTitle}`);
                console.log(`   - 변경 후: ${cleanedJobTitle}`);
                updatedCount++;
            }
        }
        // 수정 결과 확인
        const verifyUsers = await userRepository
            .createQueryBuilder('user')
            .where('user.position LIKE :position', { position: '%스탭%' })
            .orderBy('user.employeeName', 'ASC')
            .getMany();
        console.log(`📊 처리 결과: ${updatedCount}명 수정 완료`);
        res.json({
            success: true,
            message: '(스탭권한) 텍스트 제거 완료',
            updatedCount,
            totalCount: usersWithStaffSuffix.length,
            results,
            currentStaffUsers: verifyUsers.map(user => ({
                employeeName: user.employeeName,
                account: user.account,
                jobTitle: user.jobTitle
            }))
        });
    }
    catch (error) {
        console.error('❌ (스탭권한) 텍스트 제거 실패:', error);
        res.status(500).json({
            success: false,
            message: '(스탭권한) 텍스트 제거 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map