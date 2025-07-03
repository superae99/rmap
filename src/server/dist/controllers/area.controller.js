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
exports.uploadTopoJSON = exports.deleteArea = exports.updateArea = exports.createArea = exports.getArea = exports.getAreasWithSalesTerritory = exports.getAreas = void 0;
const database_1 = require("../config/database");
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
const User_1 = require("../models/User");
const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
const salesTerritoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
// 영역 목록 조회
const getAreas = async (req, res) => {
    try {
        const areas = await areaRepository.find({
            order: { createdAt: 'DESC' }
        });
        res.json(areas);
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getAreas = getAreas;
// 영업구역과 연결된 영역 조회 (adm_cd 기반 조인)
const getAreasWithSalesTerritory = async (req, res) => {
    try {
        const { branchFilter, // 지사 필터 (partners와 동일)
        officeFilter, // 지점 필터 (partners와 동일)
        managerFilter // 담당 필터 (partners와 동일)
         } = req.query;
        // 토큰이 있는 경우 인증 시도 (선택적 인증)
        if (req.headers.authorization) {
            try {
                const { authenticate } = await Promise.resolve().then(() => __importStar(require('../middlewares/auth.middleware')));
                await new Promise((resolve, reject) => {
                    authenticate(req, res, (err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
            }
            catch (error) {
                req.user = undefined;
            }
        }
        // areas와 sales_territories를 조인하여 데이터 조회
        const query = areaRepository
            .createQueryBuilder('area')
            .leftJoin(SalesTerritory_1.SalesTerritory, 'territory', 'territory.admCd = area.admCd')
            .select([
            'area.id',
            'area.name',
            'area.coordinates',
            'area.topojson',
            'area.color',
            'area.strokeColor',
            'area.strokeWeight',
            'area.fillOpacity',
            'area.description',
            'area.admCd',
            'area.properties',
            'area.isActive',
            'area.createdAt',
            'area.updatedAt'
        ])
            .addSelect([
            'territory.territoryId',
            'territory.branchName',
            'territory.officeName',
            'territory.managerName',
            'territory.managerEmployeeId',
            'territory.sido',
            'territory.gungu',
            'territory.admNm'
        ])
            .where('1 = 1'); // 모든 영역을 가져오되, 담당자 여부로 활성 상태를 동적 결정
        // 권한별 필터링 적용
        if (req.user) {
            const userPosition = req.user.position || '';
            const userJobTitle = req.user.jobTitle || '';
            const userAccount = req.user.account || '';
            // admin/staff 계정: 필터가 있을 때만 데이터 조회 가능
            if (userAccount === 'admin' || userJobTitle.includes('시스템관리자') ||
                userPosition.includes('스탭') || userJobTitle.includes('스탭')) {
                // 관리자도 최소 1개 이상의 필터가 있어야 함
                if (!branchFilter && !officeFilter && !managerFilter) {
                    // 필터가 없으면 빈 결과 반환
                    query.andWhere('1 = 0'); // 데이터 없음
                }
                else {
                    // 지사 필터 적용
                    if (branchFilter) {
                        query.andWhere('territory.branchName = :branchFilter', { branchFilter });
                    }
                    // 지점 필터 적용
                    if (officeFilter) {
                        query.andWhere('territory.officeName = :officeFilter', { officeFilter });
                    }
                    // 담당 필터 적용
                    if (managerFilter) {
                        query.andWhere('territory.managerEmployeeId = :managerFilter', { managerFilter });
                    }
                }
            }
            // 지점장 계정: 해당 지점 소속만
            else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const currentUser = await userRepository.findOne({
                    where: { employeeId: req.user.employeeId }
                });
                if (currentUser && currentUser.officeName) {
                    query.andWhere('territory.officeName = :userOffice', {
                        userOffice: currentUser.officeName
                    });
                    // 담당 필터가 있다면 추가 적용
                    if (managerFilter) {
                        query.andWhere('territory.managerEmployeeId = :managerFilter', { managerFilter });
                    }
                }
            }
            // 일반 사용자: 자신의 담당 영업구역만
            else {
                query.andWhere('territory.managerEmployeeId = :userEmployeeId', {
                    userEmployeeId: req.user.employeeId
                });
            }
        }
        const areas = await query.getRawMany();
        // 중복 영역 제거 (같은 admCd는 첫 번째 담당자만 사용)
        const uniqueAreas = new Map();
        areas.forEach(row => {
            const areaId = row.area_admCd || row.area_id;
            if (!uniqueAreas.has(areaId)) {
                uniqueAreas.set(areaId, row);
            }
        });
        // 결과를 적절한 형태로 변환
        const formattedAreas = Array.from(uniqueAreas.values()).map(row => {
            // 담당자가 있으면 활성, 없으면 비활성으로 동적 계산
            const hasManager = !!row.territory_territoryId && !!row.territory_managerEmployeeId;
            return {
                id: row.area_id,
                name: row.area_name,
                coordinates: row.area_coordinates,
                topojson: row.area_topojson,
                color: row.area_color,
                strokeColor: row.area_strokeColor,
                strokeWeight: row.area_strokeWeight,
                fillOpacity: row.area_fillOpacity,
                description: row.area_description,
                admCd: row.area_admCd,
                properties: row.area_properties,
                isActive: true, // 모든 영역을 활성으로 표시 (담당자 정보는 salesTerritory에서 확인)
                salesTerritory: row.territory_territoryId ? {
                    territoryId: row.territory_territoryId,
                    branchName: row.territory_branchName,
                    officeName: row.territory_officeName,
                    managerName: row.territory_managerName,
                    managerEmployeeId: row.territory_managerEmployeeId,
                    sido: row.territory_sido,
                    gungu: row.territory_gungu,
                    admNm: row.territory_admNm
                } : null
            };
        });
        // 디버깅: 영역 상태 확인
        // 처음 3개 영역의 담당자 상태 확인
        formattedAreas.slice(0, 3).forEach((area, index) => {
            const managerInfo = area.salesTerritory ? `담당자: ${area.salesTerritory.managerName}` : '담당자 없음';
        });
        res.json(formattedAreas);
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getAreasWithSalesTerritory = getAreasWithSalesTerritory;
// 영역 상세 조회
const getArea = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await areaRepository.findOne({
            where: { id: Number(id) }
        });
        if (!area) {
            return res.status(404).json({ message: '영역을 찾을 수 없습니다.' });
        }
        res.json(area);
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getArea = getArea;
// 영역 생성
const createArea = async (req, res) => {
    try {
        const { name, coordinates, topojson, color, description, properties } = req.body;
        // 필수 필드 검증
        if (!name || (!coordinates && !topojson)) {
            return res.status(400).json({
                message: '영역 이름과 좌표 또는 TopoJSON 데이터가 필요합니다.'
            });
        }
        // 영역 생성
        const area = areaRepository.create({
            name,
            coordinates,
            topojson,
            color: color || '#' + Math.floor(Math.random() * 16777215).toString(16), // 랜덤 색상
            description,
            properties,
            createdBy: req.user?.employeeId
        });
        await areaRepository.save(area);
        res.status(201).json({
            message: '영역이 생성되었습니다.',
            area
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.createArea = createArea;
// 영역 수정
const updateArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, coordinates, topojson, color, description, properties } = req.body;
        const area = await areaRepository.findOne({
            where: { id: Number(id) }
        });
        if (!area) {
            return res.status(404).json({ message: '영역을 찾을 수 없습니다.' });
        }
        // 업데이트
        if (name !== undefined)
            area.name = name;
        if (coordinates !== undefined)
            area.coordinates = coordinates;
        if (topojson !== undefined)
            area.topojson = topojson;
        if (color !== undefined)
            area.color = color;
        if (description !== undefined)
            area.description = description;
        if (properties !== undefined)
            area.properties = properties;
        await areaRepository.save(area);
        res.json({
            message: '영역이 수정되었습니다.',
            area
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.updateArea = updateArea;
// 영역 삭제
const deleteArea = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await areaRepository.findOne({
            where: { id: Number(id) }
        });
        if (!area) {
            return res.status(404).json({ message: '영역을 찾을 수 없습니다.' });
        }
        await areaRepository.remove(area);
        res.json({ message: '영역이 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.deleteArea = deleteArea;
// TopoJSON 파일 업로드 처리
const uploadTopoJSON = async (req, res) => {
    try {
        const { name, topojson, color, description } = req.body;
        if (!name || !topojson) {
            return res.status(400).json({
                message: '영역 이름과 TopoJSON 데이터가 필요합니다.'
            });
        }
        // TopoJSON 유효성 검증
        try {
            const parsed = JSON.parse(JSON.stringify(topojson));
            if (!parsed.type || !parsed.objects) {
                throw new Error('Invalid TopoJSON format');
            }
        }
        catch (e) {
            return res.status(400).json({
                message: '유효하지 않은 TopoJSON 형식입니다.'
            });
        }
        const area = areaRepository.create({
            name,
            topojson,
            color: color || '#3388ff',
            description,
            createdBy: req.user?.employeeId
        });
        await areaRepository.save(area);
        res.status(201).json({
            message: 'TopoJSON 영역이 생성되었습니다.',
            area
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.uploadTopoJSON = uploadTopoJSON;
//# sourceMappingURL=area.controller.js.map