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
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcrypt = __importStar(require("bcryptjs"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const XLSX = __importStar(require("xlsx"));
const DATA_PATH = path.join(__dirname, '../../../data');
function readExcelFile(filename) {
    const filePath = path.join(DATA_PATH, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`파일을 찾을 수 없습니다: ${filePath}`);
        return null;
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}
async function uploadUsers() {
    try {
        console.log('🚀 Users 테이블 업로드 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userData = readExcelFile('users.xlsx');
        if (!userData) {
            console.error('❌ Users 데이터 파일을 찾을 수 없습니다.');
            return;
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        let successCount = 0;
        let errorCount = 0;
        console.log(`📊 총 ${userData.length}개 사용자 데이터 처리 시작...`);
        for (const [index, user] of userData.entries()) {
            try {
                // 헤더 행 또는 빈 행 건너뛰기
                if (!user['직원 ID']) {
                    continue;
                }
                // 디버깅: 첫 번째 유효한 데이터 출력
                if (successCount === 0) {
                    console.log('첫 번째 사용자 데이터:', user);
                }
                const hashedPassword = await bcrypt.hash('password123', 10);
                const newUser = userRepository.create({
                    employeeId: user['직원 ID'],
                    employeeName: user.성명,
                    headquartersCode: user.본부코드,
                    headquartersName: user.본부,
                    divisionCode: user.부문코드,
                    divisionName: user.부문,
                    branchCode: user.지사코드,
                    branchName: user.지사,
                    officeName: user.지점,
                    officeCode: user.지점코드,
                    position: user.직급,
                    jobTitle: user.직책,
                    jobRole: user.발령직무,
                    fieldType: user.스탭필드,
                    account: user.계정,
                    password: hashedPassword,
                    employmentType: user.고용구분,
                    workStatus: user.근무상태,
                    isActive: true
                });
                await userRepository.save(newUser);
                successCount++;
                if (successCount % 100 === 0) {
                    console.log(`진행률: ${successCount}/${userData.length}`);
                }
            }
            catch (error) {
                console.error(`사용자 ${user['직원 ID']} 업로드 실패:`, error);
                errorCount++;
            }
        }
        console.log(`✅ Users 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건`);
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadUsers();
//# sourceMappingURL=upload-users-only.js.map