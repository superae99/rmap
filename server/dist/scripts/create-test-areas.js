"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
const testAreas = [
    {
        name: '강남구',
        description: '강남구 영업구역',
        color: '#FF6B6B',
        strokeColor: '#FF0000',
        strokeWeight: 2,
        fillOpacity: 0.3,
        // 강남구 대략적인 경계 좌표 (간단한 사각형)
        coordinates: [
            { lng: 127.01, lat: 37.48 },
            { lng: 127.08, lat: 37.48 },
            { lng: 127.08, lat: 37.52 },
            { lng: 127.01, lat: 37.52 },
            { lng: 127.01, lat: 37.48 }
        ],
        topojson: undefined,
        properties: {
            type: '구',
            population: 540000,
            managerName: '김지점장'
        },
        isActive: true
    },
    {
        name: '서초구',
        description: '서초구 영업구역',
        color: '#4ECDC4',
        strokeColor: '#00BCD4',
        strokeWeight: 2,
        fillOpacity: 0.3,
        // 서초구 대략적인 경계 좌표
        coordinates: [
            { lng: 127.01, lat: 37.46 },
            { lng: 127.08, lat: 37.46 },
            { lng: 127.08, lat: 37.50 },
            { lng: 127.01, lat: 37.50 },
            { lng: 127.01, lat: 37.46 }
        ],
        topojson: null,
        properties: {
            type: '구',
            population: 440000,
            managerName: '김지점장'
        },
        isActive: true
    },
    {
        name: '용산구',
        description: '용산구 영업구역',
        color: '#45B7D1',
        strokeColor: '#2196F3',
        strokeWeight: 2,
        fillOpacity: 0.3,
        // 용산구 대략적인 경계 좌표
        coordinates: [
            { lng: 126.96, lat: 37.52 },
            { lng: 127.01, lat: 37.52 },
            { lng: 127.01, lat: 37.56 },
            { lng: 126.96, lat: 37.56 },
            { lng: 126.96, lat: 37.52 }
        ],
        topojson: null,
        properties: {
            type: '구',
            population: 240000,
            managerName: '김지점장'
        },
        isActive: true
    },
    {
        name: '마포구',
        description: '마포구 영업구역',
        color: '#96CEB4',
        strokeColor: '#4CAF50',
        strokeWeight: 2,
        fillOpacity: 0.3,
        // 마포구 대략적인 경계 좌표
        coordinates: [
            { lng: 126.90, lat: 37.54 },
            { lng: 126.96, lat: 37.54 },
            { lng: 126.96, lat: 37.58 },
            { lng: 126.90, lat: 37.58 },
            { lng: 126.90, lat: 37.54 }
        ],
        topojson: null,
        properties: {
            type: '구',
            population: 380000,
            managerName: '김지점장'
        },
        isActive: true
    },
    {
        name: '송파구',
        description: '송파구 영업구역',
        color: '#FFEAA7',
        strokeColor: '#FFC107',
        strokeWeight: 2,
        fillOpacity: 0.3,
        // 송파구 대략적인 경계 좌표
        coordinates: [
            { lng: 127.08, lat: 37.48 },
            { lng: 127.15, lat: 37.48 },
            { lng: 127.15, lat: 37.52 },
            { lng: 127.08, lat: 37.52 },
            { lng: 127.08, lat: 37.48 }
        ],
        topojson: null,
        properties: {
            type: '구',
            population: 670000,
            managerName: '김지점장'
        },
        isActive: true
    }
];
async function createTestAreas() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('데이터베이스 연결 성공');
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        // 기존 테스트 데이터 삭제
        const testNames = ['강남구', '서초구', '용산구', '마포구', '송파구'];
        for (const name of testNames) {
            await areaRepository.delete({ name });
        }
        // 새 테스트 데이터 생성
        for (const areaData of testAreas) {
            const area = areaRepository.create({
                name: areaData.name,
                description: areaData.description,
                color: areaData.color,
                strokeColor: areaData.strokeColor,
                strokeWeight: areaData.strokeWeight,
                fillOpacity: areaData.fillOpacity,
                coordinates: areaData.coordinates,
                properties: areaData.properties,
                isActive: areaData.isActive
            });
            await areaRepository.save(area);
            console.log(`영역 생성: ${area.name} (${area.color})`);
        }
        console.log('\n✅ 테스트 영역 데이터 생성 완료!');
        console.log(`총 ${testAreas.length}개의 영역이 생성되었습니다.`);
    }
    catch (error) {
        console.error('테스트 데이터 생성 실패:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
createTestAreas();
//# sourceMappingURL=create-test-areas.js.map