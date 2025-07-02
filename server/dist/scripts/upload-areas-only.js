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
        console.log('🚀 Areas 테이블 업로드 시작...');
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
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;
        // 서울시 데이터만 우선 업로드 (전체 데이터가 너무 크므로)
        const seoulGeometries = geometries.filter(g => g.properties.sidonm === '서울특별시');
        console.log(`📍 서울특별시 데이터 처리 시작... (${seoulGeometries.length}개 지역)`);
        for (const [index, geometry] of seoulGeometries.entries()) {
            try {
                // 디버깅: 첫 번째 데이터 출력
                if (successCount === 0 && errorCount === 0) {
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
                // 좌표 변환 없이 TopoJSON만 저장 (프론트엔드에서 처리)
                const coordinates = [];
                // 개별 지역의 TopoJSON 생성
                const individualTopojson = {
                    type: 'Topology',
                    arcs: topojsonData.arcs,
                    transform: topojsonData.transform,
                    objects: {
                        [areaName]: geometry
                    }
                };
                const newArea = areaRepository.create({
                    name: areaName,
                    description: `${geometry.properties.sidonm} ${geometry.properties.sggnm} 행정구역`,
                    color: '#4ECDC4',
                    strokeColor: '#00BCD4',
                    strokeWeight: 2,
                    fillOpacity: 0.3,
                    coordinates: coordinates, // 빈 배열 (프론트엔드에서 TopoJSON 파싱)
                    topojson: individualTopojson, // 개별 지역 TopoJSON
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
                await areaRepository.save(newArea);
                successCount++;
                if (successCount % 50 === 0) {
                    console.log(`진행률: ${successCount}/${seoulGeometries.length} (${(successCount / seoulGeometries.length * 100).toFixed(1)}%)`);
                }
            }
            catch (error) {
                console.error(`지역 ${geometry.properties.adm_nm} 업로드 실패:`, error);
                errorCount++;
            }
        }
        console.log(`✅ Areas 업로드 완료: 성공 ${successCount}건, 실패 ${errorCount}건, 건너뜀 ${skipCount}건`);
        console.log(`📊 서울특별시 ${successCount}개 행정동 데이터 업로드 완료`);
        // 전체 데이터 업로드 옵션 제공
        if (successCount > 0) {
            console.log(`\n💡 서울시 업로드가 성공했습니다. 전체 지역(${geometries.length}개) 업로드를 원하시면`);
            console.log('   스크립트에서 seoulGeometries를 geometries로 변경하세요.');
        }
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadAreas();
//# sourceMappingURL=upload-areas-only.js.map