"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesTerritory = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let SalesTerritory = class SalesTerritory {
    territoryId;
    branchCode;
    branchName;
    officeCode;
    officeName;
    managerEmployeeId;
    managerName;
    sido;
    gungu;
    admCd;
    admNm;
    admNm2;
    createdAt;
    updatedAt;
    isActive;
    manager;
};
exports.SalesTerritory = SalesTerritory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ comment: '영업구역 ID' }),
    __metadata("design:type", Number)
], SalesTerritory.prototype, "territoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, comment: '지사코드' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "branchCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, comment: '지사' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "branchName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, comment: '지점코드' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "officeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, comment: '지점' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "officeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, comment: '담당 사번' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "managerEmployeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, comment: '담당 영업사원' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "managerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '시도' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "sido", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '시군구' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "gungu", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '행정구역코드' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "admCd", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '행정구역명' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "admNm", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '상세행정구역명' }),
    __metadata("design:type", String)
], SalesTerritory.prototype, "admNm2", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일시' }),
    __metadata("design:type", Date)
], SalesTerritory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일시' }),
    __metadata("design:type", Date)
], SalesTerritory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, comment: '활성화 상태' }),
    __metadata("design:type", Boolean)
], SalesTerritory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'manager_employee_id', referencedColumnName: 'employeeId' }),
    __metadata("design:type", User_1.User)
], SalesTerritory.prototype, "manager", void 0);
exports.SalesTerritory = SalesTerritory = __decorate([
    (0, typeorm_1.Entity)('sales_territories'),
    (0, typeorm_1.Index)('idx_territory_branch', ['branchCode']),
    (0, typeorm_1.Index)('idx_territory_office', ['officeCode']),
    (0, typeorm_1.Index)('idx_territory_manager', ['managerEmployeeId']),
    (0, typeorm_1.Index)('idx_territory_sido', ['sido']),
    (0, typeorm_1.Index)('idx_territory_gungu', ['gungu']),
    (0, typeorm_1.Index)('idx_territory_adm_cd', ['admCd'])
], SalesTerritory);
//# sourceMappingURL=SalesTerritory.js.map