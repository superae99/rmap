"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const updateAreasAdmCdFromPropertiesFixed = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        console.log('\n📝 properties에서 adm_cd 추출하여 업데이트 중...');
        // JSON_EXTRACT를 사용해서 MySQL에서 직접 adm_cd 추출하여 업데이트
        const updateQuery = `
      UPDATE areas 
      SET admCd = JSON_UNQUOTE(JSON_EXTRACT(properties, '$.adm_cd'))
      WHERE properties IS NOT NULL 
      AND JSON_EXTRACT(properties, '$.adm_cd') IS NOT NULL
      AND (admCd IS NULL OR admCd = '')
    `;
        const result = await database_1.AppDataSource.query(updateQuery);
        console.log('업데이트 결과:', result);
        // 최종 통계 확인
        const finalStats = await database_1.AppDataSource.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(admCd) as with_admcd,
        COUNT(*) - COUNT(admCd) as without_admcd
      FROM areas
    `);
        console.log(`\n📊 최종 통계:`);
        console.log(`- 전체 areas: ${finalStats[0].total}`);
        console.log(`- admCd 있음: ${finalStats[0].with_admcd}`);
        console.log(`- admCd 없음: ${finalStats[0].without_admcd}`);
        // 성공적으로 업데이트된 예시 확인
        const examples = await database_1.AppDataSource.query(`
      SELECT id, name, admCd, JSON_EXTRACT(properties, '$.adm_cd') as props_adm_cd
      FROM areas 
      WHERE admCd IS NOT NULL 
      LIMIT 5
    `);
        console.log(`\n✅ 업데이트된 예시:`);
        examples.forEach((area, index) => {
            console.log(`${index + 1}. ${area.name} - admCd: ${area.admCd}`);
        });
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
updateAreasAdmCdFromPropertiesFixed();
//# sourceMappingURL=update-areas-admcd-from-properties-fixed.js.map