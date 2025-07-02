"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Partner_1 = require("../models/Partner");
const User_1 = require("../models/User");
async function testBranchFiltering() {
    try {
        console.log('🧪 지점장 권한별 마커 필터링 테스트 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        // 수도권1지사 지점장 계정 가져오기
        const testUser = await userRepository.findOne({
            where: { employeeId: '20001484' } // 구형석 지점장
        });
        if (!testUser) {
            console.error('❌ 테스트 사용자를 찾을 수 없습니다.');
            return;
        }
        console.log(`\n👤 테스트 사용자: ${testUser.employeeName} (${testUser.branchName})`);
        // 전체 거래처 수 확인
        const totalPartners = await partnerRepository.count({ where: { isActive: true } });
        console.log(`📊 전체 활성 거래처 수: ${totalPartners}개`);
        // 수도권1지사 관련 지점들의 거래처 수 확인
        const sudogwon1OfficePattern = '(주류강남지점|주류강동지점|주류마포지점|주류중랑지점|주류종로지점)';
        const filteredPartners = await partnerRepository
            .createQueryBuilder('partner')
            .where('partner.isActive = :isActive', { isActive: true })
            .andWhere('partner.officeName REGEXP :officePattern', {
            officePattern: sudogwon1OfficePattern
        })
            .getMany();
        console.log(`🎯 수도권1지사 관련 거래처 수: ${filteredPartners.length}개`);
        console.log(`📈 필터링 비율: ${((filteredPartners.length / totalPartners) * 100).toFixed(2)}%`);
        // 실제 지점명들 확인
        const officeNames = [...new Set(filteredPartners.map(p => p.officeName).filter(Boolean))];
        console.log(`\n🏢 실제 존재하는 수도권1지사 지점들:`);
        officeNames.forEach(office => {
            const count = filteredPartners.filter(p => p.officeName === office).length;
            console.log(`   - ${office}: ${count}개 거래처`);
        });
        // 샘플 거래처 몇 개 출력
        console.log(`\n📋 샘플 거래처 (처음 5개):`);
        filteredPartners.slice(0, 5).forEach((partner, index) => {
            console.log(`   ${index + 1}. ${partner.partnerName} (${partner.officeName})`);
            console.log(`      주소: ${partner.businessAddress || '주소 정보 없음'}`);
        });
        // 필터링 로직 테스트 - 실제 컨트롤러에서 사용하는 조건과 동일한지 확인
        console.log(`\n🔍 필터링 패턴: ${sudogwon1OfficePattern}`);
        console.log(`✅ 지점장 ${testUser.employeeName}은 ${filteredPartners.length}개의 거래처만 볼 수 있습니다.`);
    }
    catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
testBranchFiltering();
//# sourceMappingURL=test-branch-filtering.js.map