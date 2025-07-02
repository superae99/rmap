"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const extractCoordinatesFromTopojson = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // topojson과 coordinates 데이터 직접 조회
        const sampleAreas = await database_1.AppDataSource.query(`
      SELECT id, name, topojson, coordinates
      FROM areas 
      WHERE topojson IS NOT NULL 
      AND admCd IS NOT NULL
      LIMIT 3
    `);
        console.log(`\n📝 샘플 데이터 (${sampleAreas.length}개):`);
        sampleAreas.forEach((area, index) => {
            console.log(`\n${index + 1}. ${area.name}:`);
            console.log(`   topojson 타입: ${typeof area.topojson}`);
            console.log(`   coordinates 타입: ${typeof area.coordinates}`);
            if (area.topojson) {
                console.log(`   topojson 내용:`, area.topojson);
            }
            if (area.coordinates) {
                console.log(`   coordinates 내용:`, area.coordinates);
            }
        });
        // topojson에서 geometry를 추출하여 coordinates로 변환
        console.log('\n🔄 topojson에서 coordinates 추출 시작...');
        // 변환할 areas를 조회 (coordinates가 비어있거나 null인 것들)
        const areasToUpdate = await database_1.AppDataSource.query(`
      SELECT id, name, topojson
      FROM areas 
      WHERE topojson IS NOT NULL 
      AND admCd IS NOT NULL
      AND (coordinates IS NULL OR JSON_LENGTH(coordinates) = 0)
      LIMIT 10
    `);
        console.log(`변환할 areas 수: ${areasToUpdate.length}`);
        let updatedCount = 0;
        let errorCount = 0;
        for (const area of areasToUpdate) {
            try {
                const topojson = area.topojson;
                if (topojson && topojson.objects) {
                    // TopojSON에서 첫 번째 object 가져오기
                    const objectKeys = Object.keys(topojson.objects);
                    if (objectKeys.length > 0) {
                        const firstObject = topojson.objects[objectKeys[0]];
                        if (firstObject.geometries && firstObject.geometries.length > 0) {
                            const geometry = firstObject.geometries[0];
                            if (geometry.type === 'Polygon' && topojson.arcs) {
                                // TopojSON arcs를 실제 좌표로 변환
                                const coordinates = [];
                                if (geometry.arcs && geometry.arcs.length > 0) {
                                    const ring = geometry.arcs[0]; // 첫 번째 링(외곽선)
                                    if (Array.isArray(ring) && ring.length > 0) {
                                        const arcIndex = ring[0]; // 첫 번째 arc
                                        if (topojson.arcs[arcIndex]) {
                                            const arc = topojson.arcs[arcIndex];
                                            // arc의 각 점을 좌표로 변환
                                            arc.forEach((point) => {
                                                if (point.length >= 2) {
                                                    coordinates.push({
                                                        lat: point[1],
                                                        lng: point[0]
                                                    });
                                                }
                                            });
                                            if (coordinates.length > 0) {
                                                // coordinates 업데이트
                                                await database_1.AppDataSource.query(`
                          UPDATE areas 
                          SET coordinates = ? 
                          WHERE id = ?
                        `, [JSON.stringify(coordinates), area.id]);
                                                updatedCount++;
                                                if (updatedCount === 1) {
                                                    console.log(`첫 번째 변환 예시 (${area.name}):`);
                                                    console.log(`  추출된 좌표 수: ${coordinates.length}`);
                                                    console.log(`  첫 번째 좌표: ${JSON.stringify(coordinates[0])}`);
                                                    console.log(`  마지막 좌표: ${JSON.stringify(coordinates[coordinates.length - 1])}`);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
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
      AND JSON_LENGTH(coordinates) > 0
      AND admCd IS NOT NULL
    `);
        console.log(`\n📊 유효한 coordinates를 가진 areas 수: ${updatedAreas[0].count}`);
        // 실제 변환된 데이터 샘플 확인
        const convertedSample = await database_1.AppDataSource.query(`
      SELECT id, name, JSON_LENGTH(coordinates) as coord_count
      FROM areas 
      WHERE coordinates IS NOT NULL 
      AND JSON_LENGTH(coordinates) > 0
      AND admCd IS NOT NULL
      LIMIT 5
    `);
        console.log(`\n✅ 변환된 데이터 샘플:`);
        convertedSample.forEach((area) => {
            console.log(`- ${area.name}: ${area.coord_count}개 좌표`);
        });
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
extractCoordinatesFromTopojson();
//# sourceMappingURL=extract-coordinates-from-topojson.js.map