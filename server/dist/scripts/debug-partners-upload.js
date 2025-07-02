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
const Partner_1 = require("../models/Partner");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const XLSX = __importStar(require("xlsx"));
// 데이터 파일 경로 설정
const DATA_PATH = path.join(__dirname, '../../../data');
// 엑셀 파일 읽기 함수
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
// 디버그용 파트너 업로드 함수
async function debugPartnersUpload() {
    console.log('\n🔍 Partners 업로드 디버그 시작...');
    const partnerData = readExcelFile('partners.xlsx');
    if (!partnerData) {
        console.error('❌ Partners 데이터 파일을 찾을 수 없습니다.');
        return;
    }
    const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    // 현재 데이터베이스 상태 확인
    const currentCount = await partnerRepository.count();
    console.log(`📊 현재 Partners 테이블 레코드 수: ${currentCount.toLocaleString()}개`);
    // Users 테이블에서 유효한 employeeId 목록 가져오기
    const users = await userRepository.find({ select: ['employeeId'] });
    const validEmployeeIds = new Set(users.map(user => String(user.employeeId)));
    console.log(`👥 유효한 사번 수: ${validEmployeeIds.size}개`);
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;
    const processedBusinessNumbers = new Set();
    const errorSamples = [];
    console.log(`\n📊 총 처리할 레코드: ${partnerData.length.toLocaleString()}개`);
    console.log('처리 시작...\n');
    for (let i = 0; i < Math.min(partnerData.length, 1000); i++) { // 처음 1000개만 테스트
        const partner = partnerData[i];
        try {
            // 단계별 검증
            // 1단계: 필수 필드 확인
            const partnerCode = partner.partnerCode || partner.거래처코드;
            const currentManagerEmployeeId = partner.currentManagerEmployeeId || partner['현재 담당 사번'];
            const partnerName = partner.partnerName || partner.거래처명;
            const currentManagerName = partner.currentManagerName || partner['현재 담당 영업사원'];
            if (!partnerCode || !currentManagerEmployeeId) {
                skipCount++;
                if (errorSamples.length < 10) {
                    errorSamples.push({
                        step: '필수 필드 누락',
                        error: `partnerCode: ${partnerCode}, currentManagerEmployeeId: ${currentManagerEmployeeId}`,
                        data: { partnerCode, currentManagerEmployeeId }
                    });
                }
                continue;
            }
            // 2단계: 데이터베이스 필수 필드 확인
            if (!partnerName || !currentManagerName) {
                skipCount++;
                if (errorSamples.length < 10) {
                    errorSamples.push({
                        step: 'DB 필수 필드 누락',
                        error: `partnerName: ${partnerName}, currentManagerName: ${currentManagerName}`,
                        data: { partnerName, currentManagerName }
                    });
                }
                continue;
            }
            // 3단계: 외래키 참조 확인
            if (!validEmployeeIds.has(String(currentManagerEmployeeId))) {
                skipCount++;
                if (errorSamples.length < 10) {
                    errorSamples.push({
                        step: '외래키 참조 실패',
                        error: `사번 ${currentManagerEmployeeId}가 Users 테이블에 없음`,
                        data: { currentManagerEmployeeId }
                    });
                }
                continue;
            }
            // 4단계: 사업자번호 중복 체크
            const businessNumber = partner.businessNumber || partner.사업자번호;
            if (businessNumber && processedBusinessNumbers.has(businessNumber)) {
                skipCount++;
                if (errorSamples.length < 10) {
                    errorSamples.push({
                        step: '사업자번호 중복',
                        error: `사업자번호 ${businessNumber} 중복`,
                        data: { businessNumber, partnerCode }
                    });
                }
                continue;
            }
            if (businessNumber) {
                processedBusinessNumbers.add(businessNumber);
            }
            // 5단계: 필드 길이 검증
            const lengthChecks = [
                { field: 'partnerCode', value: partnerCode, max: 20 },
                { field: 'partnerName', value: partnerName, max: 100 },
                { field: 'currentManagerEmployeeId', value: String(currentManagerEmployeeId), max: 20 },
                { field: 'currentManagerName', value: currentManagerName, max: 50 }
            ];
            let lengthError = false;
            for (const check of lengthChecks) {
                if (check.value && String(check.value).length > check.max) {
                    skipCount++;
                    lengthError = true;
                    if (errorSamples.length < 10) {
                        errorSamples.push({
                            step: '필드 길이 초과',
                            error: `${check.field}: ${String(check.value).length}/${check.max}`,
                            data: { field: check.field, length: String(check.value).length, value: String(check.value).substring(0, 50) }
                        });
                    }
                    break;
                }
            }
            if (lengthError)
                continue;
            // 6단계: 실제 데이터베이스 저장 시도
            try {
                const newPartner = partnerRepository.create({
                    partnerCode,
                    partnerName,
                    signboardName: partner.signboardName || partner.간판명,
                    officeName: partner.officeName || partner.지점,
                    officeCode: partner.officeCode || partner.지점코드,
                    currentManagerEmployeeId: String(currentManagerEmployeeId),
                    currentManagerName,
                    previousManagerEmployeeId: partner.previousManagerEmployeeId || partner.이전담당사번,
                    previousManagerName: partner.previousManagerName || partner.이전담당영업사원,
                    managerChangedDate: partner.managerChangedDate || partner.담당변경일 ?
                        new Date(partner.managerChangedDate || partner.담당변경일) : undefined,
                    managerChangeReason: partner.managerChangeReason || partner.담당변경사유,
                    channel: partner.channel || partner.채널,
                    rtmChannel: partner.rtmChannel || partner.RTM채널,
                    partnerGrade: partner.partnerGrade || partner.거래처등급,
                    managementGrade: partner.managementGrade || partner.거래처관리등급,
                    businessNumber,
                    ownerName: partner.ownerName || partner['대표자성명(점주 성명)'],
                    postalCode: partner.postalCode || partner['우편번호(사업자기준)'],
                    businessAddress: partner.businessAddress || partner['기본주소(사업자기준)'],
                    latitude: parseFloat(partner.latitude || partner.위도) || undefined,
                    longitude: parseFloat(partner.longitude || partner.경도) || undefined,
                    isActive: partner.isActive !== undefined ? partner.isActive : true
                });
                await partnerRepository.save(newPartner);
                successCount++;
                if (successCount % 100 === 0) {
                    console.log(`✅ 진행률: ${successCount}/${i + 1} (성공률: ${(successCount / (i + 1) * 100).toFixed(1)}%)`);
                }
            }
            catch (dbError) {
                errorCount++;
                if (errorSamples.length < 10) {
                    errorSamples.push({
                        step: 'DB 저장 실패',
                        error: dbError.message,
                        data: { partnerCode, businessNumber, sqlState: dbError.sqlState, errno: dbError.errno }
                    });
                }
            }
        }
        catch (error) {
            errorCount++;
            if (errorSamples.length < 10) {
                errorSamples.push({
                    step: '처리 중 오류',
                    error: error.message,
                    data: partner
                });
            }
        }
    }
    console.log(`\n📊 디버그 결과 (처음 1000개):`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 오류: ${errorCount}개`);
    console.log(`⏭️  건너뜀: ${skipCount}개`);
    console.log(`📈 처리율: ${((successCount + errorCount + skipCount) / Math.min(partnerData.length, 1000) * 100).toFixed(1)}%`);
    console.log(`\n🔍 오류 샘플:`);
    errorSamples.forEach((sample, index) => {
        console.log(`${index + 1}. [${sample.step}] ${sample.error}`);
        console.log(`   데이터:`, JSON.stringify(sample.data, null, 2));
    });
    const finalCount = await partnerRepository.count();
    console.log(`\n📊 최종 Partners 테이블 레코드 수: ${finalCount.toLocaleString()}개`);
    console.log(`📈 증가량: ${(finalCount - currentCount).toLocaleString()}개`);
}
// 메인 함수
async function main() {
    try {
        console.log('🚀 Partners 업로드 디버그 시작...');
        // 데이터베이스 연결 (로그 비활성화)
        database_1.AppDataSource.setOptions({ logging: false });
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        await debugPartnersUpload();
    }
    catch (error) {
        console.error('❌ 디버그 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
// 스크립트 실행
main();
//# sourceMappingURL=debug-partners-upload.js.map