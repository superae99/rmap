"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
async function checkAreasStructure() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공\n');
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        // 1. Areas 테이블의 기본 정보
        console.log('=== 1. AREAS 테이블 기본 정보 ===');
        const totalAreaCount = await areaRepository.count();
        console.log(`전체 영역 수: ${totalAreaCount}`);
        // 2. Areas 테이블의 샘플 데이터 구조 확인
        console.log('\n=== 2. AREAS 테이블 샘플 데이터 구조 ===');
        const sampleAreas = await areaRepository.find({ take: 5 });
        sampleAreas.forEach((area, index) => {
            console.log(`\n--- 영역 ${index + 1} ---`);
            console.log(`ID: ${area.id}`);
            console.log(`Name: ${area.name}`);
            console.log(`Description: ${area.description}`);
            console.log(`Color: ${area.color}`);
            console.log(`admCd: ${area.admCd}`); // 직접 admCd 필드
            console.log(`Properties 타입: ${typeof area.properties}`);
            console.log(`Properties 내용: ${JSON.stringify(area.properties, null, 2)}`);
            console.log(`Coordinates 길이: ${area.coordinates ? area.coordinates.length : 'null'}`);
            console.log(`TopJSON 존재: ${area.topojson ? 'Yes' : 'No'}`);
            console.log(`활성 상태: ${area.isActive}`);
        });
        // 3. admCd 필드 존재 여부 확인
        console.log('\n=== 3. admCd 필드 존재 여부 확인 ===');
        // 직접 admCd 필드가 있는 영역 수
        const areasWithDirectAdmCd = await areaRepository
            .createQueryBuilder('area')
            .where('area.admCd IS NOT NULL')
            .getCount();
        console.log(`직접 admCd 필드가 있는 영역 수: ${areasWithDirectAdmCd}`);
        // properties에 admCd가 있는지 확인 (다른 방법으로)
        const allAreas = await areaRepository.find({ take: 10 });
        let propertiesWithAdmCd = 0;
        let propertiesSamples = [];
        allAreas.forEach(area => {
            if (area.properties && typeof area.properties === 'object') {
                const props = area.properties;
                if (props.admCd) {
                    propertiesWithAdmCd++;
                }
                if (propertiesSamples.length < 3) {
                    propertiesSamples.push({
                        name: area.name,
                        properties: props
                    });
                }
            }
        });
        console.log(`Properties에 admCd가 있는 영역 수 (샘플 10개 중): ${propertiesWithAdmCd}`);
        console.log('\nProperties 샘플:');
        propertiesSamples.forEach((sample, index) => {
            console.log(`${index + 1}. ${sample.name}:`);
            console.log(`   Properties: ${JSON.stringify(sample.properties, null, 2)}`);
        });
        // 4. 데이터베이스 스키마 정보 확인
        console.log('\n=== 4. Areas 테이블 스키마 정보 ===');
        const columns = await database_1.AppDataSource.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'kakao_map_db' 
      AND TABLE_NAME = 'areas'
      ORDER BY ORDINAL_POSITION
    `);
        console.log('테이블 컬럼 정보:');
        columns.forEach((col) => {
            console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (Nullable: ${col.IS_NULLABLE})`);
        });
    }
    catch (error) {
        console.error('데이터베이스 확인 실패:', error);
        if (error instanceof Error) {
            console.error('에러 상세:', error.message);
        }
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
checkAreasStructure();
//# sourceMappingURL=check-areas-structure.js.map