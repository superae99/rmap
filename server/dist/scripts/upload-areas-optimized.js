"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DATA_PATH = path.join(__dirname, '../../../data');
function readJsonFile(filename) {
    const filePath = path.join(DATA_PATH, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`파일을 찾을 수 없습니다: ${filePath}`);
        return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}
async function uploadAreas() {
    try {
        console.log('🚀 Areas 테이블 최적화 업로드 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const topojsonData = readJsonFile('areas.json');
        if (!topojsonData) {
            console.error('❌ Areas 데이터 파일을 찾을 수 없습니다.');
            return;
        }
        console.log('📊 TopoJSON 데이터 분석 중...');
        console.log(`- 타입: ${topojsonData.type}`);
        console.log(`- 객체: ${Object.keys(topojsonData.objects).join(', ')}`);
        const mainObjectKey = Object.keys(topojsonData.objects)[0];
        const geometries = topojsonData.objects[mainObjectKey].geometries;
        console.log(`- 총 지역 수: ${geometries.length}개`);
        // arcs 데이터 크기 계산
        const arcsSize = JSON.stringify(topojsonData.arcs).length;
        console.log(`- Arcs 데이터 크기: ${(arcsSize / 1024 / 1024).toFixed(2)}MB`);
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;
        // 서울시 데이터만 우선 업로드
        const seoulGeometries = geometries.filter(g => g.properties.sidonm === '서울특별시');
        console.log(`📍 서울특별시 데이터 처리 시작... (${seoulGeometries.length}개 지역)`);
        // 배치 처리를 위한 설정
        const BATCH_SIZE = 10;
        const areas = [];
        for (const [index, geometry] of seoulGeometries.entries()) {
            try {
                // 디버깅: 첫 번째 데이터 출력
                if (index === 0) {
                    console.log('첫 번째 지역 데이터:', {
                        name: geometry.properties.adm_nm,
                        sidonm: geometry.properties.sidonm,
                        sggnm: geometry.properties.sggnm,
                        adm_cd: geometry.properties.adm_cd
                    });
                }
                // 필수 필드 확인
                const areaName = geometry.properties.adm_nm;
                if (!areaName) {
                    console.log(`⚠️  필수 필드 누락 (행 ${index + 1}): 지역명이 없음`);
                    skipCount++;
                    continue;
                }
                // 좌표 변환 없이 geometry 인덱스만 저장 (최적화)
                const coordinates = [];
                // geometry 인덱스와 필수 정보만 저장 (최적화)
                const optimizedTopojson = {
                    type: 'GeometryReference',
                    geometryIndex: index, // 원본 geometries 배열에서의 인덱스
                    objectKey: mainObjectKey,
                    properties: geometry.properties
                };
                const newArea = areaRepository.create({
                    name: areaName,
                    description: `${geometry.properties.sidonm} ${geometry.properties.sggnm} 행정구역`,
                    color: '#4ECDC4',
                    strokeColor: '#00BCD4',
                    strokeWeight: 2,
                    fillOpacity: 0.3,
                    coordinates: coordinates, // 빈 배열
                    topojson: optimizedTopojson, // 최적화된 참조 데이터
                    properties: {
                        adm_cd: geometry.properties.adm_cd,
                        adm_cd2: geometry.properties.adm_cd2,
                        sido: geometry.properties.sido,
                        sidonm: geometry.properties.sidonm,
                        sgg: geometry.properties.sgg,
                        sggnm: geometry.properties.sggnm
                    },
                    isActive: true
                });
                areas.push(newArea);
                // 배치 저장
                if (areas.length >= BATCH_SIZE || index === seoulGeometries.length - 1) {
                    await areaRepository.save(areas);
                    successCount += areas.length;
                    areas.length = 0; // 배열 초기화
                    console.log(`진행률: ${successCount}/${seoulGeometries.length} (${(successCount / seoulGeometries.length * 100).toFixed(1)}%)`);
                }
            }
            catch (error) {
                console.error(`지역 ${geometry.properties.adm_nm} 업로드 실패:`, error);
                errorCount++;
            }
        }
        console.log(`\n✅ Areas 업로드 완료`);
        console.log(`- 성공: ${successCount}건`);
        console.log(`- 실패: ${errorCount}건`);
        console.log(`- 건너뜀: ${skipCount}건`);
        console.log(`📊 서울특별시 ${successCount}개 행정동 데이터 업로드 완료`);
        // 전체 TopoJSON 데이터를 별도 파일로 저장 (프론트엔드에서 로드)
        const topojsonPath = path.join(__dirname, '../../../client/public/topojson');
        if (!fs.existsSync(topojsonPath)) {
            fs.mkdirSync(topojsonPath, { recursive: true });
        }
        const outputPath = path.join(topojsonPath, 'seoul-areas.json');
        const seoulTopojson = {
            ...topojsonData,
            objects: {
                [mainObjectKey]: {
                    type: topojsonData.objects[mainObjectKey].type,
                    geometries: seoulGeometries
                }
            }
        };
        fs.writeFileSync(outputPath, JSON.stringify(seoulTopojson));
        console.log(`\n📁 서울시 TopoJSON 데이터를 ${outputPath}에 저장했습니다.`);
        console.log(`   프론트엔드에서 이 파일을 로드하여 지도에 표시할 수 있습니다.`);
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadAreas();
//# sourceMappingURL=upload-areas-optimized.js.map