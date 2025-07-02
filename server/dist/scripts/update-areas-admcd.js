"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const updateAreasAdmCd = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        console.log('\n📝 areas 테이블의 admCd 업데이트 중...');
        // name을 기반으로 sales_territories의 admCd와 매칭하여 areas 업데이트
        const updateQuery = `
      UPDATE areas a
      INNER JOIN sales_territories st ON a.name = st.admNm
      SET a.admCd = st.admCd
      WHERE a.admCd IS NULL
    `;
        const result = await database_1.AppDataSource.query(updateQuery);
        console.log('업데이트 결과:', result);
        // 업데이트된 개수 확인
        const updatedCount = await database_1.AppDataSource.query('SELECT COUNT(*) as count FROM areas WHERE admCd IS NOT NULL');
        console.log('admCd가 있는 areas 수:', updatedCount[0].count);
        // 매칭되지 않은 areas 확인
        const unmatchedCount = await database_1.AppDataSource.query('SELECT COUNT(*) as count FROM areas WHERE admCd IS NULL');
        console.log('admCd가 없는 areas 수:', unmatchedCount[0].count);
        if (unmatchedCount[0].count > 0) {
            // 매칭되지 않은 몇 개 예시 확인
            const unmatchedExamples = await database_1.AppDataSource.query('SELECT name FROM areas WHERE admCd IS NULL LIMIT 5');
            console.log('매칭되지 않은 예시:', unmatchedExamples.map((a) => a.name));
        }
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
updateAreasAdmCd();
//# sourceMappingURL=update-areas-admcd.js.map