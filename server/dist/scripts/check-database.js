"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Partner_1 = require("../models/Partner");
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
const User_1 = require("../models/User");
async function checkDatabase() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공\n');
        // 각 테이블의 데이터 개수와 샘플 확인
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        const territoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // 1. Partners 테이블 확인
        console.log('=== PARTNERS 테이블 ===');
        const partnerCount = await partnerRepository.count();
        console.log(`전체 거래처 수: ${partnerCount}`);
        // Channel 컬럼의 고유 값들 확인
        if (partnerCount > 0) {
            console.log('\n--- Channel 컬럼 고유 값 분석 ---');
            const channelData = await partnerRepository
                .createQueryBuilder('partner')
                .select('partner.channel', 'channel')
                .addSelect('COUNT(*)', 'count')
                .groupBy('partner.channel')
                .orderBy('COUNT(*)', 'DESC')
                .getRawMany();
            console.log('RTM 채널별 거래처 수:');
            channelData.forEach((item, index) => {
                console.log(`${index + 1}. "${item.channel}": ${item.count}개`);
            });
            const totalChannels = channelData.length;
            console.log(`\n총 ${totalChannels}개의 서로 다른 채널이 존재합니다.\n`);
            const partners = await partnerRepository.find({ take: 5 });
            console.log('샘플 데이터:');
            partners.forEach((partner, index) => {
                console.log(`${index + 1}. ${partner.partnerCode} - ${partner.partnerName}`);
                console.log(`   간판명: ${partner.signboardName}`);
                console.log(`   주소: ${partner.businessAddress}`);
                console.log(`   위치: ${partner.latitude}, ${partner.longitude}`);
                console.log(`   담당자: ${partner.currentManagerName} (${partner.currentManagerEmployeeId})`);
                console.log(`   채널: ${partner.channel}, 등급: ${partner.partnerGrade}`);
                console.log(`   활성상태: ${partner.isActive}`);
                console.log('---');
            });
        }
        // 2. Areas 테이블 확인
        console.log('\n=== AREAS 테이블 ===');
        const areaCount = await areaRepository.count();
        console.log(`전체 영역 수: ${areaCount}`);
        if (areaCount > 0) {
            const areas = await areaRepository.find({ take: 5 });
            console.log('샘플 데이터:');
            areas.forEach((area, index) => {
                console.log(`${index + 1}. ${area.name}`);
                console.log(`   설명: ${area.description}`);
                console.log(`   색상: ${area.color}`);
                console.log(`   좌표 수: ${area.coordinates?.length || 0}`);
                console.log(`   속성: ${JSON.stringify(area.properties)}`);
                console.log(`   활성상태: ${area.isActive}`);
                console.log('---');
            });
        }
        // 3. Sales Territories 테이블 확인
        console.log('\n=== SALES_TERRITORIES 테이블 ===');
        const territoryCount = await territoryRepository.count();
        console.log(`전체 영업구역 수: ${territoryCount}`);
        if (territoryCount > 0) {
            const territories = await territoryRepository.find({ take: 5 });
            console.log('샘플 데이터:');
            territories.forEach((territory, index) => {
                console.log(`${index + 1}. ${territory.branchName} - ${territory.officeName}`);
                console.log(`   담당자: ${territory.managerName} (${territory.managerEmployeeId})`);
                console.log(`   지역: ${territory.sido} ${territory.gungu}`);
                console.log(`   행정구역: ${territory.admNm} (${territory.admCd})`);
                console.log(`   활성상태: ${territory.isActive}`);
                console.log('---');
            });
        }
        // 4. Users 테이블 확인
        console.log('\n=== USERS 테이블 ===');
        const userCount = await userRepository.count();
        console.log(`전체 사용자 수: ${userCount}`);
        if (userCount > 0) {
            const users = await userRepository.find({ take: 5 });
            console.log('샘플 데이터:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.employeeId} - ${user.employeeName}`);
                console.log(`   계정: ${user.account}`);
                console.log(`   지점: ${user.officeName} (${user.officeCode})`);
                console.log(`   직급: ${user.position}`);
                console.log(`   근무상태: ${user.workStatus}`);
                console.log(`   활성상태: ${user.isActive}`);
                console.log('---');
            });
        }
        // 5. 데이터 일관성 검사
        console.log('\n=== 데이터 일관성 검사 ===');
        // Partners에서 참조하는 manager가 Users에 존재하는지 확인
        const partnersWithInvalidManager = await partnerRepository
            .createQueryBuilder('partner')
            .leftJoin('users', 'user', 'user.employeeId = partner.currentManagerEmployeeId')
            .where('user.employeeId IS NULL')
            .getCount();
        console.log(`담당자가 존재하지 않는 거래처 수: ${partnersWithInvalidManager}`);
        // Sales Territories에서 참조하는 manager가 Users에 존재하는지 확인
        const territoriesWithInvalidManager = await territoryRepository
            .createQueryBuilder('territory')
            .leftJoin('users', 'user', 'user.employeeId = territory.managerEmployeeId')
            .where('user.employeeId IS NULL')
            .getCount();
        console.log(`담당자가 존재하지 않는 영업구역 수: ${territoriesWithInvalidManager}`);
        // Partners에서 좌표 정보가 누락된 경우 확인
        const partnersWithoutLocation = await partnerRepository
            .createQueryBuilder('partner')
            .where('partner.latitude IS NULL OR partner.longitude IS NULL')
            .getCount();
        console.log(`위치 정보가 누락된 거래처 수: ${partnersWithoutLocation}`);
        // Areas에서 좌표 정보가 누락된 경우 확인
        const areasWithoutCoordinates = await areaRepository
            .createQueryBuilder('area')
            .where('area.coordinates IS NULL OR JSON_LENGTH(area.coordinates) = 0')
            .getCount();
        console.log(`좌표 정보가 누락된 영역 수: ${areasWithoutCoordinates}`);
    }
    catch (error) {
        console.error('데이터베이스 확인 실패:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
checkDatabase();
//# sourceMappingURL=check-database.js.map