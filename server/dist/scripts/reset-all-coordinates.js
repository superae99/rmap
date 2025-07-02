"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const resetAllCoordinates = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // 모든 coordinates를 빈 배열로 초기화
        console.log('\n🔄 모든 coordinates 필드를 초기화 중...');
        const result = await database_1.AppDataSource.query(`
      UPDATE areas 
      SET coordinates = '[]'
      WHERE 1=1
    `);
        console.log('✅ 초기화 완료:', result);
        // 확인
        const checkResult = await database_1.AppDataSource.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN JSON_LENGTH(coordinates) = 0 THEN 1 END) as empty_count
      FROM areas
    `);
        console.log('\n📊 초기화 결과:');
        console.log(`- 전체 areas: ${checkResult[0].total}`);
        console.log(`- 빈 coordinates: ${checkResult[0].empty_count}`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
resetAllCoordinates();
//# sourceMappingURL=reset-all-coordinates.js.map