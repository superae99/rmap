"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
async function loadGeoJSONToDatabase() {
    try {
        console.log('🗺️ 데이터베이스 연결 중...');
        await database_1.AppDataSource.initialize();
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        // GeoJSON 파일 읽기
        console.log('📁 GeoJSON 파일 로딩 중...');
        const geojsonPath = path_1.default.join(__dirname, '../../../data/HangJeongDong_ver20250401.geojson');
        if (!fs_1.default.existsSync(geojsonPath)) {
            throw new Error(`GeoJSON 파일을 찾을 수 없습니다: ${geojsonPath}`);
        }
        const geojsonData = JSON.parse(fs_1.default.readFileSync(geojsonPath, 'utf-8'));
        console.log(`✅ ${geojsonData.features.length}개 지역 데이터 로드 완료`);
        console.log('🗃️ 기존 영역 데이터 삭제 중...');
        await areaRepository.clear();
        console.log('💾 새 영역 데이터 저장 중...');
        let savedCount = 0;
        for (const feature of geojsonData.features) {
            const { properties, geometry } = feature;
            // 좌표 데이터 처리 (첫 번째 폴리곤의 외곽선만 사용)
            let coordinates = [];
            if (geometry.type === 'Polygon') {
                coordinates = geometry.coordinates[0] || [];
            }
            else if (geometry.type === 'MultiPolygon') {
                coordinates = geometry.coordinates[0]?.[0] || [];
            }
            // 좌표 형식 변환 (lng, lat -> {lat, lng} for Area model)
            const kakaoCoordinates = coordinates.map(coord => ({
                lat: coord[1], // lat
                lng: coord[0] // lng
            }));
            const area = new Area_1.Area();
            area.name = properties.adm_nm || '';
            area.admCd = properties.adm_cd || '';
            area.coordinates = kakaoCoordinates;
            area.properties = properties;
            area.topojson = null; // GeoJSON이므로 topojson은 null
            area.isActive = true;
            await areaRepository.save(area);
            savedCount++;
            // 진행률 표시
            if (savedCount % 100 === 0) {
                console.log(`💾 ${savedCount}/${geojsonData.features.length} 저장 완료...`);
            }
        }
        console.log(`✅ 총 ${savedCount}개 영역 데이터 저장 완료`);
        // 통계 정보 출력
        const totalAreas = await areaRepository.count();
        const areasWithCoordinates = await areaRepository
            .createQueryBuilder('area')
            .where('area.coordinates IS NOT NULL')
            .andWhere('area.coordinates != ""')
            .andWhere('area.coordinates != "[]"')
            .getCount();
        console.log(`📊 데이터베이스 통계:`);
        console.log(`   - 전체 영역: ${totalAreas}개`);
        console.log(`   - 좌표 있는 영역: ${areasWithCoordinates}개`);
    }
    catch (error) {
        console.error('❌ GeoJSON 로드 실패:', error);
        process.exit(1);
    }
    finally {
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
            console.log('🔌 데이터베이스 연결 종료');
        }
    }
}
// 스크립트 실행
if (require.main === module) {
    loadGeoJSONToDatabase();
}
exports.default = loadGeoJSONToDatabase;
//# sourceMappingURL=load-geojson-to-database.js.map