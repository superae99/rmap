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
const Partner_1 = require("../models/Partner");
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
async function uploadPartners() {
    try {
        console.log('🚀 Partners 테이블 업로드 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const partnerData = readExcelFile('partners.xlsx');
        if (!partnerData) {
            console.error('❌ Partners 데이터 파일을 찾을 수 없습니다.');
            return;
        }
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;
        const processedBusinessNumbers = new Set();
        console.log(`📊 총 ${partnerData.length}개 거래처 데이터 처리 시작...`);
        for (const [index, partner] of partnerData.entries()) {
            try {
                // 디버깅: 첫 번째 행의 컬럼명 출력
                if (successCount === 0 && errorCount === 0) {
                    console.log('Partner 데이터 첫 번째 행 컬럼들:', Object.keys(partner));
                    console.log('Partner 데이터 첫 번째 행 값들:', partner);
                }
                // 필수 필드 확인
                const partnerCode = partner['거래처코드'];
                const currentManagerEmployeeId = partner['현재 담당 사번'];
                const businessNumber = partner['사업자번호'];
                if (!partnerCode || !currentManagerEmployeeId) {
                    continue;
                }
                // 사업자번호 중복 체크 (Excel 파일 내에서)
                if (businessNumber && processedBusinessNumbers.has(businessNumber)) {
                    console.log(`⚠️  중복 사업자번호 ${businessNumber} 건너뜀 (거래처: ${partnerCode})`);
                    skipCount++;
                    continue;
                }
                if (businessNumber) {
                    processedBusinessNumbers.add(businessNumber);
                }
                const newPartner = partnerRepository.create({
                    partnerCode,
                    partnerName: partner['거래처명'],
                    signboardName: partner['간판명'],
                    officeName: partner['지점'],
                    officeCode: partner['지점코드'],
                    currentManagerEmployeeId,
                    currentManagerName: partner['현재 담당 영업사원'],
                    previousManagerEmployeeId: partner['이전 담당 사번'],
                    previousManagerName: partner['이전 담당 영업사원'],
                    managerChangedDate: partner['담당변경일'] ? new Date(partner['담당변경일']) : undefined,
                    managerChangeReason: partner['담당변경사유'],
                    channel: partner['채널'],
                    rtmChannel: partner['RTM채널'],
                    partnerGrade: partner['거래처등급'],
                    managementGrade: partner['거래처관리등급'],
                    businessNumber,
                    ownerName: partner['대표자성명(점주 성명)'],
                    postalCode: partner['우편번호(사업자기준)'],
                    businessAddress: partner['기본주소(사업자기준)'],
                    latitude: parseFloat(partner['위도']) || undefined,
                    longitude: parseFloat(partner['경도']) || undefined,
                    isActive: true
                });
                await partnerRepository.save(newPartner);
                successCount++;
                if (successCount % 1000 === 0) {
                    console.log(`진행률: ${successCount}/${partnerData.length}`);
                }
            }
            catch (error) {
                console.error(`거래처 ${partner['거래처코드']} 업로드 실패:`, error);
                errorCount++;
            }
        }
        console.log(`✅ Partners 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건, 중복건너뜀 ${skipCount}건`);
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadPartners();
//# sourceMappingURL=upload-partners-only.js.map