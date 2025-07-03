"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const registerJihoonseo = async () => {
    try {
        // 데이터베이스 연결
        await database_1.AppDataSource.initialize();
        console.log('🔍 데이터베이스 연결 성공\n');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        console.log('👤 서지훈 사용자 등록 시작...');
        console.log('='.repeat(60));
        // 기존 사용자 확인
        const existingUser = await userRepository.findOne({
            where: [
                { employeeId: '19950312' },
                { account: 'jihoonseo' }
            ]
        });
        if (existingUser) {
            console.log(`⏭️  이미 존재: jihoonseo (서지훈)`);
            return;
        }
        // 비밀번호 해시화
        const hashedPassword = await bcryptjs_1.default.hash('lotte1234!', 10);
        // 새 사용자 생성 (기존 스크립트와 동일한 방식)
        const newUser = new User_1.User();
        newUser.employeeId = '19950312';
        newUser.employeeName = '서지훈';
        newUser.account = 'jihoonseo';
        newUser.password = hashedPassword;
        newUser.headquartersCode = 'BB0001';
        newUser.headquartersName = '영업2본부';
        newUser.divisionCode = 'BM0001';
        newUser.divisionName = '도매부문';
        newUser.branchCode = undefined;
        newUser.branchName = undefined;
        newUser.officeCode = undefined;
        newUser.officeName = undefined;
        newUser.position = '상무보/스탭'; // Staff 권한 부여
        newUser.jobTitle = '부문장(스탭권한)'; // Staff 권한 부여
        newUser.assignment = '부문장';
        newUser.jobRole = undefined;
        newUser.fieldType = '영업필드';
        newUser.employmentType = '정규직';
        newUser.workStatus = '재직';
        newUser.isActive = true;
        await userRepository.save(newUser);
        console.log(`✅ 등록 완료: jihoonseo (서지훈)`);
        console.log(`   - 사번: 19950312`);
        console.log(`   - 직급: 상무보 → ${newUser.position}`);
        console.log(`   - 직책: 부문장 → ${newUser.jobTitle}`);
        console.log(`   - 조직: ${newUser.headquartersName} > ${newUser.divisionName}`);
        // Staff 권한 확인
        const staffCheck = newUser.position?.includes('스탭') || newUser.jobTitle?.includes('스탭');
        console.log(`   - Staff 권한: ${staffCheck ? '✅ 부여됨' : '❌ 미부여'}`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
// 스크립트 실행
registerJihoonseo();
//# sourceMappingURL=register-jihoonseo.js.map