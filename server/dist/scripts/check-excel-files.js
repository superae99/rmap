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
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
function checkExcelFile(filePath, fileName) {
    try {
        console.log(`\n=== ${fileName} 파일 분석 ===`);
        const workbook = XLSX.readFile(filePath);
        console.log(`시트 목록: ${workbook.SheetNames.join(', ')}`);
        workbook.SheetNames.forEach((sheetName, index) => {
            console.log(`\n[시트 ${index + 1}: ${sheetName}]`);
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(`행 수: ${data.length}`);
            if (data.length > 0) {
                // 헤더 확인
                const headers = data[0];
                console.log(`컬럼 수: ${headers.length}`);
                console.log(`헤더: ${headers.join(', ')}`);
                // 샘플 데이터 (최대 3행)
                console.log('\n샘플 데이터:');
                for (let i = 1; i <= Math.min(3, data.length - 1); i++) {
                    const row = data[i];
                    console.log(`${i}. ${row.slice(0, 5).join(' | ')}${row.length > 5 ? ' | ...' : ''}`);
                }
                // 데이터 유형 분석
                if (data.length > 1) {
                    const sampleRow = data[1];
                    console.log('\n데이터 유형 분석:');
                    headers.forEach((header, idx) => {
                        const value = sampleRow[idx];
                        const type = typeof value;
                        const isEmpty = value === null || value === undefined || value === '';
                        console.log(`  ${header}: ${type}${isEmpty ? ' (빈 값)' : ''} - 예시: ${value}`);
                    });
                }
            }
        });
    }
    catch (error) {
        console.error(`${fileName} 파일 읽기 실패:`, error instanceof Error ? error.message : String(error));
    }
}
function checkExcelFiles() {
    const dataDir = path.join(__dirname, '../../../data');
    console.log('=== Excel 파일 분석 시작 ===');
    // 각 Excel 파일 확인
    checkExcelFile(path.join(dataDir, 'partners.xlsx'), 'partners.xlsx');
    checkExcelFile(path.join(dataDir, 'sales_territories.xlsx'), 'sales_territories.xlsx');
    checkExcelFile(path.join(dataDir, 'users.xlsx'), 'users.xlsx');
    console.log('\n=== Excel 파일 분석 완료 ===');
}
checkExcelFiles();
//# sourceMappingURL=check-excel-files.js.map