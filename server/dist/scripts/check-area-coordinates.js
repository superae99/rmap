"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const checkAreaCoordinates = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // coordinates가 있는 areas 확인
        const areasWithCoords = await database_1.AppDataSource.query(`
      SELECT id, name, admCd,
             CASE 
               WHEN coordinates IS NOT NULL THEN 'YES'
               ELSE 'NO'
             END as has_coordinates,
             CASE 
               WHEN coordinates IS NOT NULL THEN CHAR_LENGTH(coordinates)
               ELSE 0
             END as coord_length
      FROM areas 
      WHERE admCd IS NOT NULL
      LIMIT 10
    `);
        console.log('\n📊 coordinates 데이터 현황:');
        areasWithCoords.forEach((area) => {
            console.log(`- ${area.name}: coordinates ${area.has_coordinates}, 길이: ${area.coord_length}`);
        });
        // 실제 coordinates 데이터 샘플 확인
        const coordSample = await database_1.AppDataSource.query(`
      SELECT id, name, coordinates
      FROM areas 
      WHERE coordinates IS NOT NULL 
      AND admCd IS NOT NULL
      LIMIT 3
    `);
        console.log('\n📝 coordinates 데이터 샘플:');
        coordSample.forEach((area, index) => {
            console.log(`\n${index + 1}. ${area.name}:`);
            if (area.coordinates) {
                const coordStr = area.coordinates.toString();
                console.log(`   타입: ${typeof area.coordinates}`);
                console.log(`   길이: ${coordStr.length}`);
                console.log(`   시작: ${coordStr.substring(0, 100)}...`);
                // JSON 파싱 시도
                try {
                    const parsed = JSON.parse(coordStr);
                    console.log(`   파싱 가능: YES, 배열 길이: ${Array.isArray(parsed) ? parsed.length : 'Not Array'}`);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log(`   첫 번째 좌표: ${JSON.stringify(parsed[0])}`);
                    }
                }
                catch (e) {
                    console.log(`   파싱 가능: NO - ${e instanceof Error ? e.message : String(e)}`);
                }
            }
        });
        // isActive가 true인 areas 확인
        const activeAreas = await database_1.AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM areas 
      WHERE isActive = true
      AND coordinates IS NOT NULL
      AND admCd IS NOT NULL
    `);
        console.log(`\n✅ 활성화된 영역 수: ${activeAreas[0].count}`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
checkAreaCoordinates();
//# sourceMappingURL=check-area-coordinates.js.map