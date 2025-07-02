"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
const checkAreasData = async () => {
    try {
        console.log('🔍 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        const salesTerritoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
        // Areas 테이블 확인
        console.log('\n📋 Areas 테이블 확인...');
        const areas = await areaRepository.find();
        console.log('총 areas 수:', areas.length);
        if (areas.length > 0) {
            console.log('첫 번째 area:', {
                id: areas[0].id,
                name: areas[0].name,
                admCd: areas[0].admCd,
                hasCoordinates: !!areas[0].coordinates,
                coordinatesLength: areas[0].coordinates?.length || 0,
                hasTopojson: !!areas[0].topojson,
                isActive: areas[0].isActive
            });
        }
        // Sales territories 확인
        console.log('\n📋 Sales Territories 테이블 확인...');
        const territories = await salesTerritoryRepository.find({
            take: 5,
            where: { isActive: true }
        });
        console.log('활성 territories 수:', territories.length);
        if (territories.length > 0) {
            console.log('첫 번째 territory:', {
                territoryId: territories[0].territoryId,
                branchName: territories[0].branchName,
                officeName: territories[0].officeName,
                managerName: territories[0].managerName,
                admCd: territories[0].admCd,
                admNm: territories[0].admNm
            });
        }
        // adm_cd가 일치하는 데이터 확인
        console.log('\n🔗 adm_cd 일치 데이터 확인...');
        const query = areaRepository
            .createQueryBuilder('area')
            .leftJoin(SalesTerritory_1.SalesTerritory, 'territory', 'territory.admCd = area.admCd')
            .where('area.isActive = :isActive', { isActive: true })
            .andWhere('territory.admCd IS NOT NULL')
            .take(5);
        const joinedData = await query.getRawMany();
        console.log('조인된 데이터 수:', joinedData.length);
        if (joinedData.length > 0) {
            console.log('첫 번째 조인 결과:', joinedData[0]);
        }
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
};
checkAreasData();
//# sourceMappingURL=check-areas-data.js.map