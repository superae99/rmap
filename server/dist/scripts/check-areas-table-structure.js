"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const checkAreasTableStructure = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // areas 테이블 구조 확인
        const columns = await database_1.AppDataSource.query('SHOW COLUMNS FROM areas');
        console.log('\n📋 areas 테이블 구조:');
        columns.forEach((col) => {
            console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        // 실제 데이터 샘플 확인
        const sampleData = await database_1.AppDataSource.query(`
      SELECT id, name, 
             CASE 
               WHEN coordinates IS NOT NULL THEN 'YES'
               ELSE 'NO'
             END as has_coordinates,
             CASE 
               WHEN topojson IS NOT NULL THEN 'YES'
               ELSE 'NO'
             END as has_topojson,
             CASE 
               WHEN properties IS NOT NULL THEN 'YES'
               ELSE 'NO'
             END as has_properties
      FROM areas 
      WHERE admCd IS NOT NULL
      LIMIT 5
    `);
        console.log('\n📊 데이터 현황:');
        sampleData.forEach((area) => {
            console.log(`- ${area.name}: coordinates=${area.has_coordinates}, topojson=${area.has_topojson}, properties=${area.has_properties}`);
        });
        // topojson에서 geometry 추출 시도
        const topojsonSample = await database_1.AppDataSource.query(`
      SELECT id, name, topojson
      FROM areas 
      WHERE topojson IS NOT NULL 
      AND admCd IS NOT NULL
      LIMIT 2
    `);
        console.log('\n📝 topojson 데이터 샘플:');
        topojsonSample.forEach((area, index) => {
            console.log(`\n${index + 1}. ${area.name}:`);
            if (area.topojson) {
                const topoStr = area.topojson.toString();
                console.log(`   타입: ${typeof area.topojson}`);
                console.log(`   길이: ${topoStr.length}`);
                console.log(`   시작: ${topoStr.substring(0, 200)}...`);
                // JSON 파싱 시도
                try {
                    const parsed = JSON.parse(topoStr);
                    console.log(`   파싱 가능: YES`);
                    console.log(`   타입: ${parsed.type || 'unknown'}`);
                    if (parsed.objects) {
                        console.log(`   objects 키: ${Object.keys(parsed.objects)}`);
                        const firstObjectKey = Object.keys(parsed.objects)[0];
                        if (firstObjectKey && parsed.objects[firstObjectKey].geometries) {
                            console.log(`   geometries 수: ${parsed.objects[firstObjectKey].geometries.length}`);
                        }
                    }
                    if (parsed.arcs) {
                        console.log(`   arcs 수: ${parsed.arcs.length}`);
                    }
                }
                catch (e) {
                    console.log(`   파싱 가능: NO - ${e instanceof Error ? e.message : String(e)}`);
                }
            }
        });
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
checkAreasTableStructure();
//# sourceMappingURL=check-areas-table-structure.js.map