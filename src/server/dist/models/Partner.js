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
exports.Partner = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Partner = class Partner {
    partnerCode;
    partnerName;
    signboardName;
    officeName;
    officeCode;
    currentManagerEmployeeId;
    currentManagerName;
    previousManagerEmployeeId;
    previousManagerName;
    managerChangedDate;
    managerChangeReason;
    channel;
    rtmChannel;
    partnerGrade;
    managementGrade;
    businessNumber;
    ownerName;
    postalCode;
    businessAddress;
    latitude;
    longitude;
    createdAt;
    updatedAt;
    isActive;
    currentManager;
    previousManager;
};
exports.Partner = Partner;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 20, comment: '거래처코드' }),
    __metadata("design:type", String)
], Partner.prototype, "partnerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, comment: '거래처명' }),
    __metadata("design:type", String)
], Partner.prototype, "partnerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '간판명' }),
    __metadata("design:type", String)
], Partner.prototype, "signboardName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '지점' }),
    __metadata("design:type", String)
], Partner.prototype, "officeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '지점코드' }),
    __metadata("design:type", String)
], Partner.prototype, "officeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, comment: '현재 담당 사번' }),
    __metadata("design:type", String)
], Partner.prototype, "currentManagerEmployeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, comment: '현재 담당 영업사원' }),
    __metadata("design:type", String)
], Partner.prototype, "currentManagerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '변경 담당 사번' }),
    __metadata("design:type", String)
], Partner.prototype, "previousManagerEmployeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '변경 담당 영업사원' }),
    __metadata("design:type", String)
], Partner.prototype, "previousManagerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, comment: '담당자 변경일' }),
    __metadata("design:type", Date)
], Partner.prototype, "managerChangedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true, comment: '담당자 변경 사유' }),
    __metadata("design:type", String)
], Partner.prototype, "managerChangeReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '채널' }),
    __metadata("design:type", String)
], Partner.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: 'RTM채널' }),
    __metadata("design:type", String)
], Partner.prototype, "rtmChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true, comment: '거래처등급' }),
    __metadata("design:type", String)
], Partner.prototype, "partnerGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '거래처관리등급' }),
    __metadata("design:type", String)
], Partner.prototype, "managementGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '사업자번호' }),
    __metadata("design:type", String)
], Partner.prototype, "businessNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '대표자성명(점주 성명)' }),
    __metadata("design:type", String)
], Partner.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true, comment: '우편번호(사업자기준)' }),
    __metadata("design:type", String)
], Partner.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '기본주소(사업자기준)' }),
    __metadata("design:type", String)
], Partner.prototype, "businessAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 13, nullable: true, comment: '위도' }),
    __metadata("design:type", Number)
], Partner.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 16, scale: 13, nullable: true, comment: '경도' }),
    __metadata("design:type", Number)
], Partner.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일시' }),
    __metadata("design:type", Date)
], Partner.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일시' }),
    __metadata("design:type", Date)
], Partner.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, comment: '활성화 상태' }),
    __metadata("design:type", Boolean)
], Partner.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'current_manager_employee_id', referencedColumnName: 'employeeId' }),
    __metadata("design:type", User_1.User)
], Partner.prototype, "currentManager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'previous_manager_employee_id', referencedColumnName: 'employeeId' }),
    __metadata("design:type", User_1.User
    // SalesTerritory와의 관계는 제거 (순환 참조 방지)
    // office_code는 있지만 직접적인 관계는 설정하지 않음
    )
], Partner.prototype, "previousManager", void 0);
exports.Partner = Partner = __decorate([
    (0, typeorm_1.Entity)('partners'),
    (0, typeorm_1.Index)('idx_partner_office', ['officeCode']),
    (0, typeorm_1.Index)('idx_partner_current_manager', ['currentManagerEmployeeId']),
    (0, typeorm_1.Index)('idx_partner_previous_manager', ['previousManagerEmployeeId']),
    (0, typeorm_1.Index)('idx_partner_grade', ['partnerGrade']),
    (0, typeorm_1.Index)('idx_partner_channel', ['channel']),
    (0, typeorm_1.Index)('idx_partner_management_grade', ['managementGrade']),
    (0, typeorm_1.Index)('idx_partner_business_number', ['businessNumber']),
    (0, typeorm_1.Index)('idx_partner_location', ['latitude', 'longitude']),
    (0, typeorm_1.Index)('idx_partner_postal_code', ['postalCode']),
    (0, typeorm_1.Index)('idx_partner_manager_changed_date', ['managerChangedDate'])
], Partner);
//# sourceMappingURL=Partner.js.map