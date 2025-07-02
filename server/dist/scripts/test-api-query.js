"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
async function testApiQuery() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공\n');
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        // 현재 API에서 사용하는 정확한 쿼리 테스트
        console.log('=== API 쿼리 테스트 (올바른 조인 조건) ===');
        // Areas 테이블에는 admCd 컬럼이 직접 있고
        // Sales Territories 테이블에도 admCd 컬럼이 있음
        // 따라서 조인 조건을 수정해야 함
        const correctJoinResult = await areaRepository
            .createQueryBuilder('area')
            .leftJoinAndSelect('sales_territories', 'territory', 'area.admCd = territory.admCd' // JSON_EXTRACT 제거하고 직접 조인
        )
            .where('area.isActive = :isActive', { isActive: true })
            .select([
            'area.id as id',
            'area.name as name',
            'area.description as description',
            'area.color as color',
            'area.coordinates as coordinates',
            'area.properties as properties',
            'area.isActive as isActive',
            'area.admCd as admCd',
            'territory.managerName as salesTerritoryManagerName',
            'territory.managerEmployeeId as salesTerritoryManagerEmployeeId',
            'territory.officeName as salesTerritoryOfficeName',
            'territory.branchName as salesTerritoryBranchName',
            'territory.admCd as territoryAdmCd',
            'territory.admNm as territoryAdmNm'
        ])
            .getRawMany();
        console.log(`올바른 조인 결과 레코드 수: ${correctJoinResult.length}`);
        const matchedAreas = correctJoinResult.filter(area => area.salesTerritoryManagerName != null);
        console.log(`담당자 정보가 있는 영역 수: ${matchedAreas.length}`);
        const unmatchedAreas = correctJoinResult.filter(area => area.salesTerritoryManagerName == null);
        console.log(`담당자 정보가 없는 영역 수: ${unmatchedAreas.length}`);
        // 매칭 결과 샘플 출력
        console.log('\n=== 매칭된 영역 샘플 ===');
        matchedAreas.slice(0, 5).forEach((area, index) => {
            console.log(`${index + 1}. ${area.name}`);
            console.log(`   - Area admCd: ${area.admCd}`);
            console.log(`   - Territory admCd: ${area.territoryAdmCd}`);
            console.log(`   - Territory name: ${area.territoryAdmNm}`);
            console.log(`   - Manager: ${area.salesTerritoryManagerName}`);
            console.log(`   - Office: ${area.salesTerritoryOfficeName}`);
            console.log('---');
        });
        console.log('\n=== 매칭되지 않은 영역 샘플 ===');
        unmatchedAreas.slice(0, 5).forEach((area, index) => {
            console.log(`${index + 1}. ${area.name}`);
            console.log(`   - Area admCd: ${area.admCd}`);
            console.log(`   - 매칭된 Territory: 없음`);
            console.log('---');
        });
        // admCd 매칭 분석
        console.log('\n=== admCd 매칭 분석 ===');
        // Areas의 admCd와 Sales Territories의 admCd 비교
        const areaAdmCds = new Set(correctJoinResult.map(area => area.admCd).filter(admCd => admCd != null));
        const territoryAdmCds = new Set(matchedAreas.map(area => area.territoryAdmCd).filter(admCd => admCd != null));
        console.log(`Areas의 고유 admCd 수: ${areaAdmCds.size}`);
        console.log(`매칭된 Territory admCd 수: ${territoryAdmCds.size}`);
        // 매칭되지 않은 admCd 샘플
        const unmatchedAdmCds = [...areaAdmCds].filter(admCd => !territoryAdmCds.has(admCd));
        console.log(`매칭되지 않은 Area admCd 수: ${unmatchedAdmCds.length}`);
        if (unmatchedAdmCds.length > 0) {
            console.log('\n매칭되지 않은 admCd 샘플 (처음 10개):');
            unmatchedAdmCds.slice(0, 10).forEach((admCd, index) => {
                const areaName = correctJoinResult.find(area => area.admCd === admCd)?.name;
                console.log(`${index + 1}. ${admCd} - ${areaName}`);
            });
        }
    }
    catch (error) {
        console.error('API 쿼리 테스트 실패:', error);
        if (error instanceof Error) {
            console.error('에러 상세:', error.message);
        }
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
testApiQuery();
//# sourceMappingURL=test-api-query.js.map