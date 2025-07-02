"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const updateAreasAdmCdFromProperties = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        console.log('\n📝 properties에서 adm_cd 추출하여 업데이트 중...');
        // properties 필드가 있는 모든 areas 조회
        const areasWithProperties = await database_1.AppDataSource.query(`
      SELECT id, properties 
      FROM areas 
      WHERE properties IS NOT NULL
    `);
        console.log(`properties가 있는 areas 수: ${areasWithProperties.length}`);
        let updatedCount = 0;
        let errorCount = 0;
        for (const area of areasWithProperties) {
            try {
                const properties = JSON.parse(area.properties);
                if (properties.adm_cd) {
                    // admCd 업데이트
                    await database_1.AppDataSource.query(`
            UPDATE areas 
            SET admCd = ? 
            WHERE id = ?
          `, [properties.adm_cd, area.id]);
                    updatedCount++;
                    if (updatedCount % 1000 === 0) {
                        console.log(`진행 상황: ${updatedCount}개 업데이트 완료`);
                    }
                }
            }
            catch (error) {
                errorCount++;
                console.error(`Area ID ${area.id} 처리 중 오류:`, error);
            }
        }
        console.log(`\n✅ 업데이트 완료:`);
        console.log(`- 성공: ${updatedCount}개`);
        console.log(`- 실패: ${errorCount}개`);
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
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
updateAreasAdmCdFromProperties();
//# sourceMappingURL=update-areas-admcd-from-properties.js.map