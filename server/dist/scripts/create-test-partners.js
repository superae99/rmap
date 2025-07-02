"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Partner_1 = require("../models/Partner");
const testPartners = [
    {
        partnerCode: 'P001',
        partnerName: '강남맥주',
        signboardName: '강남맥주 본점',
        officeName: '강남지점',
        officeCode: 'O001',
        currentManagerEmployeeId: 'manager',
        currentManagerName: '김지점장',
        channel: '업소',
        partnerGrade: 'A',
        managementGrade: 'A',
        businessNumber: '123-45-67890',
        ownerName: '홍길동',
        businessAddress: '서울특별시 강남구 테헤란로 123',
        latitude: 37.5005,
        longitude: 127.0363,
        isActive: true
    },
    {
        partnerCode: 'P002',
        partnerName: '이태원포차',
        signboardName: '이태원포차',
        officeName: '용산지점',
        officeCode: 'O002',
        currentManagerEmployeeId: 'manager',
        currentManagerName: '김지점장',
        channel: '업소',
        partnerGrade: 'B',
        managementGrade: 'B',
        businessNumber: '234-56-78901',
        ownerName: '김철수',
        businessAddress: '서울특별시 용산구 이태원로 456',
        latitude: 37.5347,
        longitude: 126.9945,
        isActive: true
    },
    {
        partnerCode: 'P003',
        partnerName: 'GS25 서초점',
        signboardName: 'GS25 서초중앙점',
        officeName: '서초지점',
        officeCode: 'O003',
        currentManagerEmployeeId: 'manager',
        currentManagerName: '김지점장',
        channel: '매장',
        partnerGrade: 'A',
        managementGrade: 'A',
        businessNumber: '345-67-89012',
        ownerName: '박영희',
        businessAddress: '서울특별시 서초구 서초대로 789',
        latitude: 37.4837,
        longitude: 127.0324,
        isActive: true
    },
    {
        partnerCode: 'P004',
        partnerName: 'CU 역삼점',
        signboardName: 'CU 역삼중앙점',
        officeName: '강남지점',
        officeCode: 'O001',
        currentManagerEmployeeId: 'manager',
        currentManagerName: '김지점장',
        channel: '매장',
        partnerGrade: 'B',
        managementGrade: 'A',
        businessNumber: '456-78-90123',
        ownerName: '이민수',
        businessAddress: '서울특별시 강남구 역삼로 321',
        latitude: 37.4979,
        longitude: 127.0276,
        isActive: true
    },
    {
        partnerCode: 'P005',
        partnerName: '홍대치킨',
        signboardName: '홍대치킨 본점',
        officeName: '마포지점',
        officeCode: 'O004',
        currentManagerEmployeeId: 'manager',
        currentManagerName: '김지점장',
        channel: '업소',
        partnerGrade: 'C',
        managementGrade: 'B',
        businessNumber: '567-89-01234',
        ownerName: '최영수',
        businessAddress: '서울특별시 마포구 홍익로 111',
        latitude: 37.5563,
        longitude: 126.9219,
        isActive: true
    },
    {
        partnerCode: 'P006',
        partnerName: '송파도매마트',
        signboardName: '송파도매마트',
        officeName: '송파지점',
        officeCode: 'O005',
        currentManagerEmployeeId: 'manager',
        currentManagerName: '김지점장',
        channel: '기타',
        partnerGrade: 'A',
        managementGrade: 'A',
        businessNumber: '678-90-12345',
        ownerName: '정미경',
        businessAddress: '서울특별시 송파구 송파대로 222',
        latitude: 37.5145,
        longitude: 127.1050,
        isActive: true
    }
];
async function createTestPartners() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('데이터베이스 연결 성공');
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        // 기존 테스트 데이터 삭제
        const testCodes = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006'];
        for (const code of testCodes) {
            await partnerRepository.delete({ partnerCode: code });
        }
        // 새 테스트 데이터 생성
        for (const partnerData of testPartners) {
            const partner = partnerRepository.create(partnerData);
            await partnerRepository.save(partner);
            console.log(`거래처 생성: ${partner.partnerName} (${partner.partnerCode})`);
        }
        console.log('\n✅ 테스트 거래처 데이터 생성 완료!');
        console.log(`총 ${testPartners.length}개의 거래처가 생성되었습니다.`);
    }
    catch (error) {
        console.error('테스트 데이터 생성 실패:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
createTestPartners();
//# sourceMappingURL=create-test-partners.js.map