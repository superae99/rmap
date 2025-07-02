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
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
const bcrypt = __importStar(require("bcryptjs"));
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
// JSON 파일 읽기 함수
function readJsonFile(filename) {
    const filePath = path.join(DATA_PATH, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`파일을 찾을 수 없습니다: ${filePath}`);
        return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}
// 1. Users 테이블 업로드
async function uploadUsers() {
    console.log('\n📤 Users 테이블 업로드 시작...');
    // 엑셀 또는 JSON 파일에서 데이터 읽기
    const userData = readExcelFile('users.xlsx') || readJsonFile('users.json');
    if (!userData) {
        console.error('❌ Users 데이터 파일을 찾을 수 없습니다.');
        return;
    }
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    let successCount = 0;
    let errorCount = 0;
    for (const user of userData) {
        try {
            // 헤더 행 또는 빈 행 건너뛰기
            if (!user.employeeId && !user['직원 ID']) {
                continue;
            }
            // 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(user.password || user.비밀번호 || 'defaultpass123', 10);
            const newUser = userRepository.create({
                employeeId: user.employeeId || user['직원 ID'],
                employeeName: user.employeeName || user.성명,
                headquartersCode: user.headquartersCode || user.본부코드,
                headquartersName: user.headquartersName || user.본부,
                divisionCode: user.divisionCode || user.부문코드,
                divisionName: user.divisionName || user.부문,
                branchCode: user.branchCode || user.지사코드,
                branchName: user.branchName || user.지사,
                officeName: user.officeName || user.지점,
                officeCode: user.officeCode || user.지점코드,
                position: user.position || user.직급,
                jobTitle: user.jobTitle || user.직책,
                jobRole: user.jobRole || user.발령직무,
                fieldType: user.fieldType || user.스탭필드,
                account: user.account || user.계정,
                password: hashedPassword,
                employmentType: user.employmentType || user.고용구분,
                workStatus: user.workStatus || user.근무상태,
                isActive: user.isActive !== undefined ? user.isActive : true
            });
            await userRepository.save(newUser);
            successCount++;
        }
        catch (error) {
            console.error(`사용자 ${user.employeeId} 업로드 실패:`, error);
            errorCount++;
        }
    }
    console.log(`✅ Users 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건`);
}
// 2. Partners 테이블 업로드
async function uploadPartners() {
    console.log('\n📤 Partners 테이블 업로드 시작...');
    const partnerData = readExcelFile('partners.xlsx') || readJsonFile('partners.json');
    if (!partnerData) {
        console.error('❌ Partners 데이터 파일을 찾을 수 없습니다.');
        return;
    }
    const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;
    const processedBusinessNumbers = new Set();
    for (const partner of partnerData) {
        try {
            // 디버깅: 첫 번째 행의 컬럼명 출력
            if (successCount === 0 && errorCount === 0) {
                console.log('Partner 데이터 첫 번째 행 컬럼들:', Object.keys(partner));
                console.log('Partner 데이터 첫 번째 행 값들:', partner);
            }
            // 필수 필드 확인
            const partnerCode = partner.partnerCode || partner.거래처코드;
            const currentManagerEmployeeId = partner.currentManagerEmployeeId || partner['현재 담당 사번'];
            const businessNumber = partner.businessNumber || partner.사업자번호;
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
                partnerName: partner.partnerName || partner.거래처명,
                signboardName: partner.signboardName || partner.간판명,
                officeName: partner.officeName || partner.지점,
                officeCode: partner.officeCode || partner.지점코드,
                currentManagerEmployeeId,
                currentManagerName: partner.currentManagerName || partner['현재 담당 영업사원'],
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
        }
        catch (error) {
            console.error(`거래처 ${partner.partnerCode} 업로드 실패:`, error);
            errorCount++;
        }
    }
    console.log(`✅ Partners 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건, 중복건너뜀 ${skipCount}건`);
}
// 3. Areas 테이블 업로드
async function uploadAreas() {
    console.log('\n📤 Areas 테이블 업로드 시작...');
    const areaData = readJsonFile('areas.json') || readExcelFile('areas.xlsx');
    if (!areaData) {
        console.error('❌ Areas 데이터 파일을 찾을 수 없습니다.');
        return;
    }
    const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
    let successCount = 0;
    let errorCount = 0;
    // TopoJSON 파일인 경우 전체를 하나의 Area로 저장
    if (areaData.type === 'Topology') {
        try {
            const newArea = areaRepository.create({
                name: '서울특별시 행정구역',
                description: '서울특별시 전체 행정구역 (TopoJSON)',
                color: '#4ECDC4',
                strokeColor: '#00BCD4',
                strokeWeight: 2,
                fillOpacity: 0.3,
                topojson: areaData,
                isActive: true
            });
            await areaRepository.save(newArea);
            successCount++;
            console.log('✅ TopoJSON 데이터 업로드 성공');
        }
        catch (error) {
            console.error('TopoJSON 업로드 실패:', error);
            errorCount++;
        }
    }
    else if (Array.isArray(areaData)) {
        // 배열 형태의 영역 데이터 처리
        for (const area of areaData) {
            try {
                const newArea = areaRepository.create({
                    name: area.name || area.영역명,
                    description: area.description || area.설명,
                    color: area.color || area.색상 || '#4ECDC4',
                    strokeColor: area.strokeColor || area.테두리색상 || '#00BCD4',
                    strokeWeight: area.strokeWeight || area.테두리두께 || 2,
                    fillOpacity: area.fillOpacity || area.투명도 || 0.3,
                    coordinates: area.coordinates || area.좌표,
                    topojson: area.topojson,
                    properties: area.properties || area.속성,
                    isActive: area.isActive !== undefined ? area.isActive : true
                });
                await areaRepository.save(newArea);
                successCount++;
            }
            catch (error) {
                console.error(`영역 ${area.name} 업로드 실패:`, error);
                errorCount++;
            }
        }
    }
    console.log(`✅ Areas 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건`);
}
// 4. SalesTerritory 테이블 업로드
async function uploadSalesTerritories() {
    console.log('\n📤 SalesTerritory 테이블 업로드 시작...');
    const territoryData = readExcelFile('sales_territories.xlsx') || readJsonFile('sales_territories.json');
    if (!territoryData) {
        console.error('❌ SalesTerritory 데이터 파일을 찾을 수 없습니다.');
        return;
    }
    const territoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
    let successCount = 0;
    let errorCount = 0;
    for (const territory of territoryData) {
        try {
            // 디버깅: 첫 번째 행의 컬럼명 출력
            if (successCount === 0 && errorCount === 0) {
                console.log('Territory 데이터 첫 번째 행 컬럼들:', Object.keys(territory));
                console.log('Territory 데이터 첫 번째 행 값들:', territory);
            }
            // 필수 필드 확인
            if (!territory.managerEmployeeId && !territory['담당 사번']) {
                continue;
            }
            const newTerritory = territoryRepository.create({
                branchCode: territory.branchCode || territory.지사코드,
                branchName: territory.branchName || territory.지사,
                officeCode: territory.officeCode || territory.지점코드,
                officeName: territory.officeName || territory.지점,
                managerEmployeeId: territory.managerEmployeeId || territory['담당 사번'],
                managerName: territory.managerName || territory['담당 영업사원'],
                sido: territory.sido || territory.sidonm,
                gungu: territory.gungu || territory.sggnm,
                admCd: territory.admCd || territory.adm_cd,
                admNm: territory.admNm || territory.adm_nm,
                admNm2: territory.admNm2 || territory.adm_nm2,
                isActive: territory.isActive !== undefined ? territory.isActive : true
            });
            await territoryRepository.save(newTerritory);
            successCount++;
        }
        catch (error) {
            console.error(`영업구역 ${territory.employeeId} 업로드 실패:`, error);
            errorCount++;
        }
    }
    console.log(`✅ SalesTerritory 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건`);
}
// 메인 업로드 함수
async function uploadAllData() {
    try {
        console.log('🚀 전체 데이터 업로드 시작...');
        console.log(`📁 데이터 경로: ${DATA_PATH}`);
        // 데이터 폴더 확인
        if (!fs.existsSync(DATA_PATH)) {
            fs.mkdirSync(DATA_PATH, { recursive: true });
            console.log(`📁 데이터 폴더 생성: ${DATA_PATH}`);
            console.log('\n⚠️  다음 파일들을 data 폴더에 넣어주세요:');
            console.log('- users.xlsx 또는 users.json');
            console.log('- partners.xlsx 또는 partners.json');
            console.log('- areas.json (또는 areas.xlsx)');
            console.log('- sales_territories.xlsx 또는 sales_territories.json');
            console.log('\n📋 파일 형식 안내:');
            console.log('users.xlsx: 사번,성명,본부코드,본부,부문코드,부문,지사코드,지사,지점,지점코드,직급,직책,발령직무,스탭필드,계정,비밀번호,고용구분,근무상태');
            console.log('partners.xlsx: 지점명,지점코드,현재담당사번,현재담당영업사원,이전담당사번,이전담당영업사원,담당변경일,담당변경사유,거래처코드,거래처명,간판명,RTM채널,채널,거래처등급,관리등급,사업자등록번호,대표자명,우편번호,거래처주소,위도,경도');
            console.log('sales_territories.xlsx: 지사코드,지사,지점코드,지점,담당사번,담당영업사원,시도,시군구,행정구역코드,행정구역명,상세행정구역명');
            console.log('areas.json: [{"name":"영역명","description":"설명","color":"#4ECDC4","coordinates":[...],"topojson":{...}}]');
            return;
        }
        // 데이터베이스 연결 (로그 비활성화)
        database_1.AppDataSource.setOptions({ logging: false });
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // 기존 데이터 백업 여부 확인
        console.log('\n⚠️  주의: 기존 데이터를 덮어쓸 수 있습니다.');
        console.log('계속 진행하려면 5초 후 자동으로 시작됩니다...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        // 순차적으로 업로드 (의존성 고려)
        await uploadUsers(); // 1. 사용자 먼저
        await uploadPartners(); // 2. 거래처 
        await uploadSalesTerritories(); // 3. 영업구역
        await uploadAreas(); // 4. 영역
        console.log('\n🎉 전체 데이터 업로드 완료!');
    }
    catch (error) {
        console.error('❌ 데이터 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
// 스크립트 실행
uploadAllData();
//# sourceMappingURL=upload-all-data.js.map