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
async function uploadMissingPartners() {
    try {
        console.log('🚀 누락된 Partners 데이터 업로드 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const partnerData = readExcelFile('partners.xlsx');
        if (!partnerData) {
            console.error('❌ Partners 데이터 파일을 찾을 수 없습니다.');
            return;
        }
        console.log(`📊 원본 데이터: ${partnerData.length}개 행`);
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        // 기존 거래처코드 목록 조회
        const existingPartnerCodes = await partnerRepository
            .createQueryBuilder('partner')
            .select('partner.partnerCode')
            .getRawMany();
        const existingCodesSet = new Set(existingPartnerCodes.map(p => p.partner_partnerCode));
        console.log(`📋 기존 데이터베이스 레코드: ${existingCodesSet.size}개`);
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;
        const missingPartners = [];
        console.log('📋 누락된 거래처 찾는 중...');
        for (const partner of partnerData) {
            try {
                const partnerCode = partner['거래처코드'];
                if (!partnerCode) {
                    skipCount++;
                    continue;
                }
                // 이미 존재하는 거래처코드는 건너뛰기
                if (existingCodesSet.has(partnerCode)) {
                    continue;
                }
                // 누락된 거래처 발견
                missingPartners.push(partner);
            }
            catch (error) {
                console.error(`거래처 체크 중 오류:`, error);
                errorCount++;
            }
        }
        console.log(`\n🔍 누락된 거래처 ${missingPartners.length}개 발견!`);
        // 누락된 거래처만 추가
        for (const partner of missingPartners) {
            try {
                const partnerCode = partner['거래처코드'];
                const partnerName = partner['거래처명'] || '정보없음';
                const currentManagerEmployeeId = partner['현재 담당 사번'] || 'Unknown';
                const currentManagerName = partner['현재 담당 영업사원'] || '담당자 정보없음';
                // 데이터 변환
                const newPartnerData = {
                    partnerCode,
                    partnerName,
                    signboardName: partner['간판명'] || undefined,
                    officeName: partner['지점'] || undefined,
                    officeCode: partner['지점코드'] || undefined,
                    currentManagerEmployeeId,
                    currentManagerName,
                    previousManagerEmployeeId: partner['이전 담당 사번'] || undefined,
                    previousManagerName: partner['이전 담당 영업사원'] || undefined,
                    managerChangedDate: partner['담당변경일'] ? new Date(partner['담당변경일']) : undefined,
                    managerChangeReason: partner['담당변경사유'] || undefined,
                    channel: partner['채널'] || undefined,
                    rtmChannel: partner['RTM채널'] || undefined,
                    partnerGrade: partner['거래처등급'] || undefined,
                    managementGrade: partner['거래처관리등급'] || undefined,
                    businessNumber: partner['사업자번호'] || undefined,
                    ownerName: partner['대표자성명(점주 성명)'] || undefined,
                    postalCode: partner['우편번호(사업자기준)'] || undefined,
                    businessAddress: partner['기본주소(사업자기준)'] || undefined,
                    latitude: partner['위도'] ? parseFloat(partner['위도']) : undefined,
                    longitude: partner['경도'] ? parseFloat(partner['경도']) : undefined,
                    isActive: true
                };
                const newPartner = partnerRepository.create(newPartnerData);
                await partnerRepository.save(newPartner);
                successCount++;
                console.log(`✅ 추가됨: ${partnerCode} - ${partnerName}`);
            }
            catch (error) {
                console.error(`거래처 ${partner['거래처코드']} 업로드 실패:`, error);
                errorCount++;
            }
        }
        console.log('\n' + '='.repeat(60));
        console.log('📊 누락된 Partners 업로드 결과');
        console.log('='.repeat(60));
        console.log(`✅ 성공: ${successCount}건`);
        console.log(`❌ 실패: ${errorCount}건`);
        console.log(`📈 누락된 데이터 중 처리: ${successCount + errorCount}건`);
        // 최종 DB 상태 확인
        const finalCount = await partnerRepository.count();
        console.log(`\n🏁 최종 Partners 테이블 레코드 수: ${finalCount}개`);
        console.log(`📊 엑셀 파일 총 레코드: ${partnerData.length}개`);
        console.log(`🔍 차이: ${partnerData.length - finalCount}개`);
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadMissingPartners();
//# sourceMappingURL=upload-missing-partners.js.map