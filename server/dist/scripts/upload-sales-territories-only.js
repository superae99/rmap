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
const SalesTerritory_1 = require("../models/SalesTerritory");
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
async function uploadSalesTerritories() {
    try {
        console.log('🚀 SalesTerritory 테이블 업로드 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const territoryData = readExcelFile('sales_territories.xlsx');
        if (!territoryData) {
            console.error('❌ SalesTerritory 데이터 파일을 찾을 수 없습니다.');
            return;
        }
        const territoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;
        console.log(`📊 총 ${territoryData.length}개 영업구역 데이터 처리 시작...`);
        for (const [index, territory] of territoryData.entries()) {
            try {
                // 디버깅: 첫 번째 행의 컬럼명 출력
                if (successCount === 0 && errorCount === 0) {
                    console.log('Territory 데이터 첫 번째 행 컬럼들:', Object.keys(territory));
                    console.log('Territory 데이터 첫 번째 행 값들:', territory);
                }
                // 필수 필드 확인
                const managerEmployeeId = territory['담당 사번'];
                if (!managerEmployeeId) {
                    console.log(`⚠️  필수 필드 누락 (행 ${index + 1}): 담당 사번이 없음`);
                    skipCount++;
                    continue;
                }
                const newTerritory = territoryRepository.create({
                    branchCode: territory['지사코드'],
                    branchName: territory['지사'],
                    officeCode: territory['지점코드'],
                    officeName: territory['지점'],
                    managerEmployeeId,
                    managerName: territory['담당 영업사원'],
                    sido: territory['sidonm'],
                    gungu: territory['sggnm'],
                    admCd: territory['adm_cd'],
                    admNm: territory['adm_nm'],
                    admNm2: territory['adm_nm2'],
                    isActive: true
                });
                await territoryRepository.save(newTerritory);
                successCount++;
                if (successCount % 500 === 0) {
                    console.log(`진행률: ${successCount}/${territoryData.length}`);
                }
            }
            catch (error) {
                console.error(`영업구역 ${territory['담당 사번']} 업로드 실패:`, error);
                errorCount++;
            }
        }
        console.log(`✅ SalesTerritory 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건, 건너뜀 ${skipCount}건`);
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadSalesTerritories();
//# sourceMappingURL=upload-sales-territories-only.js.map