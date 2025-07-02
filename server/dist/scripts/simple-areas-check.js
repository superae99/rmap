"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const simpleCheck = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // 간단한 카운트 쿼리
        const areaCount = await database_1.AppDataSource.query('SELECT COUNT(*) as count FROM areas');
        console.log('Areas 테이블 레코드 수:', areaCount[0].count);
        const territoryCount = await database_1.AppDataSource.query('SELECT COUNT(*) as count FROM sales_territories');
        console.log('Sales Territories 테이블 레코드 수:', territoryCount[0].count);
        // areas 테이블 구조 확인
        const areaColumns = await database_1.AppDataSource.query('SHOW COLUMNS FROM areas');
        console.log('Areas 테이블 컬럼:', areaColumns.map((col) => col.Field));
        // 첫 번째 area 레코드의 기본 정보만 확인
        const firstArea = await database_1.AppDataSource.query('SELECT id, name, admCd, isActive FROM areas LIMIT 1');
        console.log('첫 번째 area 기본 정보:', firstArea[0]);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
simpleCheck();
//# sourceMappingURL=simple-areas-check.js.map