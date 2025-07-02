"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const checkAreaDataStructure = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // areas 테이블의 전체 통계
        const stats = await database_1.AppDataSource.query(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN coordinates IS NOT NULL AND JSON_LENGTH(coordinates) > 0 THEN 1 END) as with_coordinates,
        COUNT(CASE WHEN topojson IS NOT NULL THEN 1 END) as with_topojson,
        COUNT(CASE WHEN admCd IS NOT NULL THEN 1 END) as with_admcd,
        COUNT(CASE WHEN isActive = 1 THEN 1 END) as active_count
      FROM areas
    `);
        console.log('\n📊 areas 테이블 통계:');
        console.log(`- 전체 레코드: ${stats[0].total_count}`);
        console.log(`- coordinates 있음: ${stats[0].with_coordinates}`);
        console.log(`- topojson 있음: ${stats[0].with_topojson}`);
        console.log(`- admCd 있음: ${stats[0].with_admcd}`);
        console.log(`- 활성화됨: ${stats[0].active_count}`);
        // 샘플 데이터 확인
        const sampleData = await database_1.AppDataSource.query(`
      SELECT 
        id,
        name,
        CASE 
          WHEN coordinates IS NULL THEN 'NULL'
          WHEN JSON_LENGTH(coordinates) = 0 THEN 'EMPTY_ARRAY'
          ELSE CONCAT('ARRAY_', JSON_LENGTH(coordinates))
        END as coord_status,
        CASE 
          WHEN topojson IS NULL THEN 'NULL'
          ELSE 'EXISTS'
        END as topojson_status,
        admCd,
        isActive
      FROM areas
      WHERE admCd IS NOT NULL
      LIMIT 10
    `);
        console.log('\n📝 샘플 데이터 (10개):');
        sampleData.forEach((area) => {
            console.log(`ID ${area.id}: ${area.name}`);
            console.log(`  - coordinates: ${area.coord_status}`);
            console.log(`  - topojson: ${area.topojson_status}`);
            console.log(`  - admCd: ${area.admCd}`);
            console.log(`  - isActive: ${area.isActive}`);
            console.log('---');
        });
        // topojson 구조 확인
        const topojsonSample = await database_1.AppDataSource.query(`
      SELECT id, name, topojson
      FROM areas
      WHERE topojson IS NOT NULL
      LIMIT 1
    `);
        if (topojsonSample.length > 0) {
            console.log('\n📋 TopojSON 구조 확인:');
            const topojson = topojsonSample[0].topojson;
            console.log(`Area: ${topojsonSample[0].name}`);
            console.log(`TopojSON 타입: ${typeof topojson}`);
            if (topojson) {
                console.log('TopojSON 키:', Object.keys(topojson));
                if (topojson.objects) {
                    console.log('Objects 키:', Object.keys(topojson.objects));
                    const firstObjectKey = Object.keys(topojson.objects)[0];
                    if (firstObjectKey) {
                        const firstObject = topojson.objects[firstObjectKey];
                        console.log(`첫 번째 object (${firstObjectKey}):`);
                        console.log(`  - type: ${firstObject.type}`);
                        if (firstObject.geometries) {
                            console.log(`  - geometries 수: ${firstObject.geometries.length}`);
                            if (firstObject.geometries.length > 0) {
                                console.log(`  - 첫 번째 geometry 타입: ${firstObject.geometries[0].type}`);
                            }
                        }
                    }
                }
                if (topojson.arcs) {
                    console.log(`Arcs 수: ${topojson.arcs.length}`);
                }
                if (topojson.transform) {
                    console.log('Transform:', topojson.transform);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
checkAreaDataStructure();
//# sourceMappingURL=check-area-data-structure.js.map