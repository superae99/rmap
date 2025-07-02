"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const updateCoordinatesFromGeometry = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // geometry 데이터가 있는 areas 확인
        const areasWithGeometry = await database_1.AppDataSource.query(`
      SELECT id, name, 
             CASE 
               WHEN geometry IS NOT NULL THEN 'YES'
               ELSE 'NO'
             END as has_geometry,
             CASE 
               WHEN geometry IS NOT NULL THEN CHAR_LENGTH(geometry)
               ELSE 0
             END as geometry_length
      FROM areas 
      WHERE admCd IS NOT NULL
      LIMIT 5
    `);
        console.log('\n📊 geometry 데이터 현황:');
        areasWithGeometry.forEach((area) => {
            console.log(`- ${area.name}: geometry ${area.has_geometry}, 길이: ${area.geometry_length}`);
        });
        // geometry 데이터 샘플 확인
        const geometrySample = await database_1.AppDataSource.query(`
      SELECT id, name, geometry
      FROM areas 
      WHERE geometry IS NOT NULL 
      AND admCd IS NOT NULL
      LIMIT 2
    `);
        console.log('\n📝 geometry 데이터 샘플:');
        geometrySample.forEach((area, index) => {
            console.log(`\n${index + 1}. ${area.name}:`);
            if (area.geometry) {
                const geomStr = area.geometry.toString();
                console.log(`   타입: ${typeof area.geometry}`);
                console.log(`   길이: ${geomStr.length}`);
                console.log(`   시작: ${geomStr.substring(0, 200)}...`);
                // JSON 파싱 시도
                try {
                    const parsed = JSON.parse(geomStr);
                    console.log(`   파싱 가능: YES`);
                    console.log(`   타입: ${parsed.type}`);
                    if (parsed.coordinates) {
                        console.log(`   coordinates 있음: YES`);
                        if (Array.isArray(parsed.coordinates) && parsed.coordinates.length > 0) {
                            console.log(`   coordinates 길이: ${parsed.coordinates.length}`);
                            console.log(`   첫 번째 coordinate: ${JSON.stringify(parsed.coordinates[0]).substring(0, 100)}`);
                        }
                    }
                }
                catch (e) {
                    console.log(`   파싱 가능: NO - ${e instanceof Error ? e.message : String(e)}`);
                }
            }
        });
        console.log('\n🔄 geometry에서 coordinates로 변환 시작...');
        // geometry 데이터를 coordinates로 변환하여 업데이트
        const areasToUpdate = await database_1.AppDataSource.query(`
      SELECT id, name, geometry
      FROM areas 
      WHERE geometry IS NOT NULL 
      AND admCd IS NOT NULL
      AND (coordinates IS NULL OR coordinates = '' OR coordinates = '[]')
      LIMIT 10
    `);
        console.log(`변환할 areas 수: ${areasToUpdate.length}`);
        let updatedCount = 0;
        let errorCount = 0;
        for (const area of areasToUpdate) {
            try {
                const geometry = JSON.parse(area.geometry);
                if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates.length > 0) {
                    // Polygon의 첫 번째 링(외곽선)을 사용
                    const ring = geometry.coordinates[0];
                    // [lng, lat] 형태를 {lat, lng} 형태로 변환
                    const coordinates = ring.map((coord) => ({
                        lat: coord[1],
                        lng: coord[0]
                    }));
                    // coordinates 업데이트
                    await database_1.AppDataSource.query(`
            UPDATE areas 
            SET coordinates = ? 
            WHERE id = ?
          `, [JSON.stringify(coordinates), area.id]);
                    updatedCount++;
                    if (updatedCount === 1) {
                        console.log(`첫 번째 변환 예시 (${area.name}):`);
                        console.log(`  원본 좌표 수: ${ring.length}`);
                        console.log(`  변환된 첫 좌표: ${JSON.stringify(coordinates[0])}`);
                    }
                }
                else if (geometry.type === 'MultiPolygon' && geometry.coordinates && geometry.coordinates.length > 0) {
                    // MultiPolygon의 첫 번째 Polygon의 첫 번째 링 사용
                    const ring = geometry.coordinates[0][0];
                    const coordinates = ring.map((coord) => ({
                        lat: coord[1],
                        lng: coord[0]
                    }));
                    await database_1.AppDataSource.query(`
            UPDATE areas 
            SET coordinates = ? 
            WHERE id = ?
          `, [JSON.stringify(coordinates), area.id]);
                    updatedCount++;
                }
            }
            catch (error) {
                errorCount++;
                console.error(`Area ID ${area.id} 처리 중 오류:`, error instanceof Error ? error.message : String(error));
            }
        }
        console.log(`\n✅ 변환 완료:`);
        console.log(`- 성공: ${updatedCount}개`);
        console.log(`- 실패: ${errorCount}개`);
        // 변환 결과 확인
        const updatedAreas = await database_1.AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM areas 
      WHERE coordinates IS NOT NULL 
      AND coordinates != ''
      AND coordinates != '[]'
      AND admCd IS NOT NULL
    `);
        console.log(`\n📊 변환된 areas 수: ${updatedAreas[0].count}`);
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
updateCoordinatesFromGeometry();
//# sourceMappingURL=update-coordinates-from-geometry.js.map