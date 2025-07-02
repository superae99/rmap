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
        console.log('🚀 전국 Areas 데이터 업로드 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const topojsonData = readJsonFile('areas.json');
        if (!topojsonData) {
            console.error('❌ Areas 데이터 파일을 찾을 수 없습니다.');
            return;
        }
        console.log('📊 TopoJSON 데이터 분석 중...');
        const mainObjectKey = Object.keys(topojsonData.objects)[0];
        const geometries = topojsonData.objects[mainObjectKey].geometries;
        console.log(`- 총 지역 수: ${geometries.length}개`);
        // 시도별로 그룹화
        const sidoGroups = geometries.reduce((acc, geo, index) => {
            const sido = geo.properties.sidonm;
            if (!acc[sido])
                acc[sido] = [];
            acc[sido].push({ geometry: geo, index });
            return acc;
        }, {});
        console.log('\n📍 시도별 데이터:');
        Object.entries(sidoGroups).forEach(([sido, items]) => {
            console.log(`- ${sido}: ${items.length}개`);
        });
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        // 기존 서울 데이터 확인
        const existingSeoulCount = await areaRepository.count({
            where: { description: '서울특별시 % 행정구역' }
        });
        if (existingSeoulCount > 0) {
            console.log(`\n⚠️  서울특별시 데이터 ${existingSeoulCount}개가 이미 존재합니다. 중복 방지를 위해 서울은 건너뜁니다.`);
        }
        let totalSuccess = 0;
        let totalError = 0;
        let totalSkip = 0;
        // 시도별로 순차 처리
        const sidoOrder = [
            '경기도', '경상북도', '경상남도', '전라남도', '전북특별자치도',
            '충청남도', '부산광역시', '강원특별자치도', '인천광역시',
            '충청북도', '대구광역시', '광주광역시', '대전광역시',
            '울산광역시', '제주특별자치도', '세종특별자치시'
        ];
        if (existingSeoulCount === 0) {
            sidoOrder.unshift('서울특별시'); // 서울 데이터가 없으면 맨 앞에 추가
        }
        for (const sido of sidoOrder) {
            if (!sidoGroups[sido])
                continue;
            console.log(`\n🏛️  ${sido} 처리 시작... (${sidoGroups[sido].length}개 지역)`);
            const BATCH_SIZE = 20;
            const areas = [];
            let sidoSuccess = 0;
            let sidoError = 0;
            let sidoSkip = 0;
            for (const item of sidoGroups[sido]) {
                try {
                    const { geometry, index } = item;
                    const areaName = geometry.properties.adm_nm;
                    if (!areaName) {
                        sidoSkip++;
                        totalSkip++;
                        continue;
                    }
                    // 색상 설정 (시도별로 다른 색상)
                    const colorMap = {
                        '서울특별시': '#FF6B6B',
                        '경기도': '#4ECDC4',
                        '인천광역시': '#45B7D1',
                        '강원특별자치도': '#96CEB4',
                        '충청북도': '#FECA57',
                        '충청남도': '#48DBFB',
                        '대전광역시': '#FF9FF3',
                        '세종특별자치시': '#54A0FF',
                        '전라북도': '#FD79A8',
                        '전북특별자치도': '#FD79A8',
                        '전라남도': '#A0E7E5',
                        '광주광역시': '#55A3FF',
                        '경상북도': '#FF6B9D',
                        '경상남도': '#C44569',
                        '대구광역시': '#F38181',
                        '울산광역시': '#AA96DA',
                        '부산광역시': '#8785A2',
                        '제주특별자치도': '#FC5C65'
                    };
                    const color = colorMap[sido] || '#4ECDC4';
                    const optimizedTopojson = {
                        type: 'GeometryReference',
                        geometryIndex: index,
                        objectKey: mainObjectKey,
                        properties: geometry.properties
                    };
                    const newArea = areaRepository.create({
                        name: areaName,
                        description: `${geometry.properties.sidonm} ${geometry.properties.sggnm} 행정구역`,
                        color: color,
                        strokeColor: '#2C3E50',
                        strokeWeight: 1.5,
                        fillOpacity: 0.3,
                        coordinates: [],
                        topojson: optimizedTopojson,
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
                    if (areas.length >= BATCH_SIZE ||
                        sidoGroups[sido].indexOf(item) === sidoGroups[sido].length - 1) {
                        await areaRepository.save(areas);
                        sidoSuccess += areas.length;
                        totalSuccess += areas.length;
                        areas.length = 0;
                        process.stdout.write(`\r  진행률: ${sidoSuccess}/${sidoGroups[sido].length} (${(sidoSuccess / sidoGroups[sido].length * 100).toFixed(1)}%)`);
                    }
                }
                catch (error) {
                    console.error(`\n  ❌ ${item.geometry.properties.adm_nm} 업로드 실패:`, error);
                    sidoError++;
                    totalError++;
                }
            }
            console.log(`\n  ✅ ${sido} 완료: 성공 ${sidoSuccess}건, 실패 ${sidoError}건, 건너뜀 ${sidoSkip}건`);
        }
        console.log('\n' + '='.repeat(70));
        console.log('📊 전체 업로드 결과');
        console.log('='.repeat(70));
        console.log(`✅ 성공: ${totalSuccess}건`);
        console.log(`❌ 실패: ${totalError}건`);
        console.log(`⏭️  건너뜀: ${totalSkip}건`);
        console.log(`📍 총계: ${totalSuccess + totalError + totalSkip}건`);
        // 전체 TopoJSON 파일을 public 폴더에 저장
        const topojsonPath = path.join(__dirname, '../../../client/public/topojson');
        if (!fs.existsSync(topojsonPath)) {
            fs.mkdirSync(topojsonPath, { recursive: true });
        }
        const outputPath = path.join(topojsonPath, 'korea-areas.json');
        fs.writeFileSync(outputPath, JSON.stringify(topojsonData));
        console.log(`\n📁 전국 TopoJSON 데이터를 ${outputPath}에 저장했습니다.`);
        // 최종 DB 상태 확인
        const finalCount = await areaRepository.count();
        console.log(`\n🏁 최종 Areas 테이블 레코드 수: ${finalCount}개`);
    }
    catch (error) {
        console.error('❌ 업로드 중 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
uploadAreas();
//# sourceMappingURL=upload-areas-all.js.map