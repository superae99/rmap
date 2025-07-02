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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Partner_1 = require("../models/Partner");
const Area_1 = require("../models/Area");
const SalesTerritory_1 = require("../models/SalesTerritory");
const fs = __importStar(require("fs"));
const XLSX = __importStar(require("xlsx"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function uploadProductionData() {
    try {
        await database_1.AppDataSource.initialize();
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
        const areaRepository = database_1.AppDataSource.getRepository(Area_1.Area);
        const salesTerritoryRepository = database_1.AppDataSource.getRepository(SalesTerritory_1.SalesTerritory);
        // 1. 사용자 데이터 업로드
        const usersFilePath = '/app/data/users.xlsx';
        if (fs.existsSync(usersFilePath)) {
            const workbook = XLSX.readFile(usersFilePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const usersData = XLSX.utils.sheet_to_json(worksheet);
            for (const userData of usersData) {
                const hashedPassword = await bcryptjs_1.default.hash(userData.password || 'password123', 10);
                const user = userRepository.create({
                    employeeId: userData.employeeId,
                    account: userData.account,
                    password: hashedPassword,
                    employeeName: userData.employeeName,
                    position: userData.position,
                    jobTitle: userData.jobTitle,
                    branchName: userData.branchName,
                    isActive: userData.isActive !== false
                });
                await userRepository.save(user);
            }
        }
        // 2. 거래처 데이터 업로드
        const partnersFilePath = '/app/data/partners.xlsx';
        if (fs.existsSync(partnersFilePath)) {
            const workbook = XLSX.readFile(partnersFilePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const partnersData = XLSX.utils.sheet_to_json(worksheet);
            for (const partnerData of partnersData) {
                const partner = partnerRepository.create({
                    partnerCode: partnerData.partnerCode,
                    partnerName: partnerData.partnerName,
                    signboardName: partnerData.signboardName,
                    officeName: partnerData.officeName,
                    officeCode: partnerData.officeCode,
                    currentManagerEmployeeId: partnerData.currentManagerEmployeeId,
                    currentManagerName: partnerData.currentManagerName,
                    previousManagerEmployeeId: partnerData.previousManagerEmployeeId,
                    previousManagerName: partnerData.previousManagerName,
                    managerChangedDate: partnerData.managerChangedDate,
                    managerChangeReason: partnerData.managerChangeReason,
                    channel: partnerData.channel,
                    rtmChannel: partnerData.rtmChannel,
                    partnerGrade: partnerData.partnerGrade,
                    managementGrade: partnerData.managementGrade,
                    businessNumber: partnerData.businessNumber,
                    ownerName: partnerData.ownerName,
                    postalCode: partnerData.postalCode,
                    businessAddress: partnerData.businessAddress,
                    latitude: partnerData.latitude,
                    longitude: partnerData.longitude,
                    isActive: partnerData.isActive !== false
                });
                await partnerRepository.save(partner);
            }
        }
        // 3. 영업 상권 데이터 업로드
        const salesTerritoriesFilePath = '/app/data/sales_territories.xlsx';
        if (fs.existsSync(salesTerritoriesFilePath)) {
            const workbook = XLSX.readFile(salesTerritoriesFilePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const salesTerritoriesData = XLSX.utils.sheet_to_json(worksheet);
            for (const territoryData of salesTerritoriesData) {
                const territory = salesTerritoryRepository.create({
                    branchCode: territoryData.branchCode,
                    branchName: territoryData.branchName,
                    officeCode: territoryData.officeCode,
                    officeName: territoryData.officeName,
                    managerEmployeeId: territoryData.managerEmployeeId,
                    managerName: territoryData.managerName,
                    sido: territoryData.sido,
                    gungu: territoryData.gungu,
                    admCd: territoryData.admCd,
                    admNm: territoryData.admNm,
                    admNm2: territoryData.admNm2,
                    isActive: territoryData.isActive !== false
                });
                await salesTerritoryRepository.save(territory);
            }
        }
        // 4. 상권 데이터 업로드
        const areasFilePath = '/app/data/areas.json';
        if (fs.existsSync(areasFilePath)) {
            const areasData = JSON.parse(fs.readFileSync(areasFilePath, 'utf-8'));
            for (const areaData of areasData) {
                const area = areaRepository.create({
                    name: areaData.name,
                    description: areaData.description,
                    coordinates: areaData.coordinates,
                    topojson: areaData.topojson,
                    color: areaData.color,
                    strokeColor: areaData.strokeColor,
                    strokeWeight: areaData.strokeWeight,
                    fillOpacity: areaData.fillOpacity,
                    admCd: areaData.admCd,
                    properties: areaData.properties,
                    createdBy: areaData.createdBy,
                    isActive: areaData.isActive !== false
                });
                await areaRepository.save(area);
            }
        }
    }
    catch (error) {
    }
    finally {
        if (database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.destroy();
        }
    }
}
uploadProductionData();
//# sourceMappingURL=upload-production-data.js.map