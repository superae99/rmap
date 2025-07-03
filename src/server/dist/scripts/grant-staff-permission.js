"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
const grantStaffPermission = async () => {
    try {
        // Excel 파일 경로
        const excelPath = path.join(__dirname, '../../data/Users2.xlsx');
        console.log('📄 Excel 파일 읽기:', excelPath);
        // Excel 파일 읽기
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`📊 총 ${data.length}개의 계정 발견\n`);
        // 데이터베이스 연결
        await database_1.AppDataSource.initialize();
        console.log('🔍 데이터베이스 연결 성공\n');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 업데이트 카운터
        let updatedCount = 0;
        let skippedCount = 0;
        let notFoundCount = 0;
        const excludedAccount = 'hyeongraekim';
        console.log('🔄 Staff 권한 부여 시작...');
        console.log('='.repeat(80));
        for (const row of data) {
            const account = row['계정'] || row['account'];
            if (!account) {
                console.log('⚠️  계정 정보 없음:', row);
                continue;
            }
            // hyeongraekim 계정 제외
            if (account === excludedAccount) {
                console.log(`❌ 제외: ${account} (요청에 따라 제외)`);
                skippedCount++;
                continue;
            }
            // 해당 계정의 사용자 찾기
            const user = await userRepository.findOne({
                where: { account: account }
            });
            if (!user) {
                console.log(`❌ 미발견: ${account} - 데이터베이스에 없는 계정`);
                notFoundCount++;
                continue;
            }
            // 이미 스탭 권한이 있는지 확인
            if (user.position?.includes('스탭') || user.jobTitle?.includes('스탭')) {
                console.log(`⏭️  스킵: ${account} (${user.employeeName}) - 이미 staff 권한 보유`);
                skippedCount++;
                continue;
            }
            // Staff 권한 부여 - position에 '스탭' 추가
            const originalPosition = user.position || '';
            const originalJobTitle = user.jobTitle || '';
            // position 업데이트 (기존 직급 유지하면서 스탭 추가)
            if (originalPosition && !originalPosition.includes('스탭')) {
                user.position = originalPosition + '/스탭';
            }
            else if (!originalPosition) {
                user.position = '스탭';
            }
            // jobTitle 업데이트 (필요한 경우)
            if (!originalJobTitle.includes('스탭')) {
                user.jobTitle = originalJobTitle ? originalJobTitle + '(스탭권한)' : '스탭권한';
            }
            await userRepository.save(user);
            console.log(`✅ 부여: ${account} (${user.employeeName})`);
            console.log(`   - 직급: ${originalPosition} → ${user.position}`);
            console.log(`   - 직책: ${originalJobTitle} → ${user.jobTitle}`);
            updatedCount++;
        }
        console.log('='.repeat(80));
        console.log('\n📊 처리 결과:');
        console.log(`- ✅ Staff 권한 부여: ${updatedCount}명`);
        console.log(`- ⏭️  스킵 (이미 권한 있음/제외): ${skippedCount}명`);
        console.log(`- ❌ 미발견 계정: ${notFoundCount}명`);
        console.log(`- 📋 전체 처리: ${data.length}명`);
        // 현재 staff 권한 사용자 수 확인
        const totalStaffUsers = await userRepository
            .createQueryBuilder('user')
            .where('user.position LIKE :position', { position: '%스탭%' })
            .orWhere('user.jobTitle LIKE :jobTitle', { jobTitle: '%스탭%' })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getCount();
        console.log(`\n📊 현재 전체 Staff 권한 사용자: ${totalStaffUsers}명`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
// 스크립트 실행
grantStaffPermission();
//# sourceMappingURL=grant-staff-permission.js.map