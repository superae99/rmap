"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
async function checkAreasTerritoriesJoin() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공\n');
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        const territoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
        // 1. Areas 테이블의 전체 레코드 수
        console.log('=== 1. AREAS 테이블 전체 레코드 수 ===');
        const totalAreaCount = await areaRepository.count();
        console.log(`전체 영역 수: ${totalAreaCount}`);
        // 2. Sales Territories 테이블의 전체 레코드 수
        console.log('\n=== 2. SALES_TERRITORIES 테이블 전체 레코드 수 ===');
        const totalTerritoryCount = await territoryRepository.count();
        console.log(`전체 영업구역 수: ${totalTerritoryCount}`);
        // 3. admCd를 기준으로 매칭되는 areas-sales_territories 조인 결과 수
        console.log('\n=== 3. admCd 매칭 조인 결과 ===');
        // Areas에서 properties.admCd 값들 확인
        const areasWithAdmCd = await areaRepository
            .createQueryBuilder('area')
            .where("JSON_EXTRACT(area.properties, '$.admCd') IS NOT NULL")
            .getMany();
        console.log(`admCd가 있는 영역 수: ${areasWithAdmCd.length}`);
        // 샘플 admCd 값들 출력
        console.log('Areas 테이블의 admCd 샘플:');
        areasWithAdmCd.slice(0, 5).forEach((area, index) => {
            const admCd = area.properties?.admCd;
            console.log(`${index + 1}. ${area.name}: admCd = ${admCd}`);
        });
        // Sales Territories의 admCd 값들 확인
        const territoriesWithAdmCd = await territoryRepository
            .createQueryBuilder('territory')
            .where('territory.admCd IS NOT NULL')
            .getMany();
        console.log(`\nadmCd가 있는 영업구역 수: ${territoriesWithAdmCd.length}`);
        // 샘플 admCd 값들 출력
        console.log('Sales Territories 테이블의 admCd 샘플:');
        territoriesWithAdmCd.slice(0, 5).forEach((territory, index) => {
            console.log(`${index + 1}. ${territory.admNm}: admCd = ${territory.admCd}`);
        });
        // 4. Areas와 Sales Territories의 admCd 매칭 확인
        console.log('\n=== 4. admCd 매칭 분석 ===');
        // Areas의 모든 admCd 값들 수집 (중복 제거)
        const areaAdmCds = new Set(areasWithAdmCd
            .map(area => area.properties?.admCd)
            .filter(admCd => admCd != null));
        // Sales Territories의 모든 admCd 값들 수집 (중복 제거)
        const territoryAdmCds = new Set(territoriesWithAdmCd
            .map(territory => territory.admCd)
            .filter(admCd => admCd != null));
        console.log(`Areas 테이블의 고유 admCd 수: ${areaAdmCds.size}`);
        console.log(`Sales Territories 테이블의 고유 admCd 수: ${territoryAdmCds.size}`);
        // 교집합 찾기 (매칭되는 admCd들)
        const matchingAdmCds = [...areaAdmCds].filter(admCd => territoryAdmCds.has(admCd));
        console.log(`매칭되는 고유 admCd 수: ${matchingAdmCds.length}`);
        // Areas에만 있는 admCd들
        const areaOnlyAdmCds = [...areaAdmCds].filter(admCd => !territoryAdmCds.has(admCd));
        console.log(`Areas에만 있는 admCd 수: ${areaOnlyAdmCds.length}`);
        // Sales Territories에만 있는 admCd들
        const territoryOnlyAdmCds = [...territoryAdmCds].filter(admCd => !areaAdmCds.has(admCd));
        console.log(`Sales Territories에만 있는 admCd 수: ${territoryOnlyAdmCds.length}`);
        // 5. 실제 조인 쿼리 실행 (API와 동일한 로직)
        console.log('\n=== 5. 실제 조인 결과 (API 로직 시뮬레이션) ===');
        const joinResult = await areaRepository
            .createQueryBuilder('area')
            .leftJoinAndSelect('sales_territories', 'territory', "JSON_EXTRACT(area.properties, '$.admCd') = territory.admCd")
            .where('area.isActive = :isActive', { isActive: true })
            .getRawMany();
        console.log(`조인 결과 레코드 수: ${joinResult.length}`);
        // 매칭된 영역들의 정보
        const matchedAreas = joinResult.filter(row => row.territory_admCd != null);
        console.log(`Sales Territory와 매칭된 영역 수: ${matchedAreas.length}`);
        // 매칭되지 않은 영역들
        const unmatchedAreas = joinResult.filter(row => row.territory_admCd == null);
        console.log(`Sales Territory와 매칭되지 않은 영역 수: ${unmatchedAreas.length}`);
        // 6. 샘플 매칭 결과 출력
        console.log('\n=== 6. 매칭 결과 샘플 ===');
        if (matchedAreas.length > 0) {
            console.log('매칭된 영역 샘플:');
            matchedAreas.slice(0, 3).forEach((row, index) => {
                console.log(`${index + 1}. Area: ${row.area_name}`);
                console.log(`   - Area admCd: ${JSON.parse(row.area_properties || '{}').admCd}`);
                console.log(`   - Territory admCd: ${row.territory_admCd}`);
                console.log(`   - Territory name: ${row.territory_admNm}`);
                console.log(`   - Manager: ${row.territory_managerName}`);
                console.log('---');
            });
        }
        if (unmatchedAreas.length > 0) {
            console.log('\n매칭되지 않은 영역 샘플:');
            unmatchedAreas.slice(0, 3).forEach((row, index) => {
                console.log(`${index + 1}. Area: ${row.area_name}`);
                console.log(`   - Area admCd: ${JSON.parse(row.area_properties || '{}').admCd}`);
                console.log(`   - 매칭된 Territory: 없음`);
                console.log('---');
            });
        }
        // 7. API 응답 형태로 변환한 결과 확인
        console.log('\n=== 7. API 응답 형태 확인 ===');
        const apiResponse = await areaRepository
            .createQueryBuilder('area')
            .leftJoinAndSelect('sales_territories', 'territory', "JSON_EXTRACT(area.properties, '$.admCd') = territory.admCd")
            .where('area.isActive = :isActive', { isActive: true })
            .select([
            'area.id as id',
            'area.name as name',
            'area.description as description',
            'area.color as color',
            'area.coordinates as coordinates',
            'area.properties as properties',
            'area.isActive as isActive',
            'territory.managerName as salesTerritoryManagerName',
            'territory.managerEmployeeId as salesTerritoryManagerEmployeeId',
            'territory.officeName as salesTerritoryOfficeName',
            'territory.branchName as salesTerritoryBranchName'
        ])
            .getRawMany();
        console.log(`API 응답에서 반환될 영역 수: ${apiResponse.length}`);
        const areasWithManager = apiResponse.filter(area => area.salesTerritoryManagerName != null);
        console.log(`담당자 정보가 있는 영역 수: ${areasWithManager.length}`);
        const areasWithoutManager = apiResponse.filter(area => area.salesTerritoryManagerName == null);
        console.log(`담당자 정보가 없는 영역 수: ${areasWithoutManager.length}`);
    }
    catch (error) {
        console.error('데이터베이스 확인 실패:', error);
        if (error instanceof Error) {
            console.error('에러 상세:', error.message);
            console.error('스택 트레이스:', error.stack);
        }
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
checkAreasTerritoriesJoin();
//# sourceMappingURL=check-areas-territories-join.js.map