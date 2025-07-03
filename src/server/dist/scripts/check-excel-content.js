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
const checkExcelContent = async () => {
    try {
        // Excel 파일 경로
        const excelPath = path.join(__dirname, '../../data/Users2.xlsx');
        console.log('📄 Excel 파일 읽기:', excelPath);
        // Excel 파일 읽기
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`📊 총 ${data.length}개의 행 발견\n`);
        console.log('📋 Excel 파일 내용:');
        console.log('='.repeat(80));
        // 헤더 출력
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            console.log('컬럼:', headers.join(', '));
            console.log('-'.repeat(80));
        }
        // 모든 데이터 출력
        data.forEach((row, index) => {
            console.log(`${index + 1}:`, JSON.stringify(row, null, 2));
        });
        console.log('\n' + '='.repeat(80));
        // 계정 필드만 추출
        console.log('\n🔍 계정 정보만 추출:');
        data.forEach((row, index) => {
            const account = row['계정'] || row['account'] || row['Account'];
            console.log(`${index + 1}. 계정: ${account}`);
        });
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
};
// 스크립트 실행
checkExcelContent();
//# sourceMappingURL=check-excel-content.js.map