"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const checkCoordinatesFormat = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // coordinates가 있는 area 샘플 조회
        const areasWithCoords = await database_1.AppDataSource.query(`
      SELECT id, name, coordinates, JSON_LENGTH(coordinates) as coord_count
      FROM areas
      WHERE coordinates IS NOT NULL 
      AND JSON_LENGTH(coordinates) > 0
      AND admCd IS NOT NULL
      LIMIT 5
    `);
        console.log('\n📝 coordinates가 있는 areas:');
        areasWithCoords.forEach((area) => {
            console.log(`\n${area.name} (ID: ${area.id}):`);
            console.log(`  - 좌표 개수: ${area.coord_count}`);
            if (area.coordinates) {
                console.log(`  - coordinates 타입: ${typeof area.coordinates}`);
                // 첫 번째와 마지막 좌표 확인
                if (Array.isArray(area.coordinates) && area.coordinates.length > 0) {
                    console.log(`  - 첫 번째 좌표:`, area.coordinates[0]);
                    console.log(`  - 마지막 좌표:`, area.coordinates[area.coordinates.length - 1]);
                    // 좌표 형식 확인
                    const firstCoord = area.coordinates[0];
                    if (firstCoord && typeof firstCoord === 'object') {
                        console.log(`  - 좌표 형식: ${firstCoord.lat ? 'lat/lng 객체' : '배열 형식'}`);
                    }
                }
            }
        });
        // 빈 배열이거나 매우 적은 좌표를 가진 areas 확인
        const problemAreas = await database_1.AppDataSource.query(`
      SELECT 
        COUNT(CASE WHEN coordinates IS NULL THEN 1 END) as null_count,
        COUNT(CASE WHEN JSON_LENGTH(coordinates) = 0 THEN 1 END) as empty_count,
        COUNT(CASE WHEN JSON_LENGTH(coordinates) > 0 AND JSON_LENGTH(coordinates) < 3 THEN 1 END) as too_few_count,
        COUNT(CASE WHEN JSON_LENGTH(coordinates) >= 3 THEN 1 END) as valid_count
      FROM areas
      WHERE admCd IS NOT NULL
    `);
        console.log('\n📊 coordinates 상태 통계:');
        console.log(`- NULL: ${problemAreas[0].null_count}`);
        console.log(`- 빈 배열: ${problemAreas[0].empty_count}`);
        console.log(`- 좌표 부족 (1-2개): ${problemAreas[0].too_few_count}`);
        console.log(`- 유효한 좌표 (3개 이상): ${problemAreas[0].valid_count}`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
checkCoordinatesFormat();
//# sourceMappingURL=check-coordinates-format.js.map