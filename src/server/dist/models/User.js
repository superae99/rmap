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
exports.User = exports.FieldType = void 0;
const typeorm_1 = require("typeorm");
var FieldType;
(function (FieldType) {
    FieldType["STAFF"] = "\uC2A4\uD0ED";
    FieldType["FIELD"] = "\uD544\uB4DC";
})(FieldType || (exports.FieldType = FieldType = {}));
let User = class User {
    employeeId;
    employeeName;
    headquartersCode;
    headquartersName;
    divisionCode;
    divisionName;
    branchCode;
    branchName;
    officeName;
    officeCode;
    position;
    jobTitle;
    assignment;
    jobRole;
    fieldType;
    account;
    password;
    employmentType;
    workStatus;
    createdAt;
    updatedAt;
    lastLogin;
    isActive;
    passwordChangedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 20, comment: '직원 ID' }),
    __metadata("design:type", String)
], User.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, comment: '성명' }),
    __metadata("design:type", String)
], User.prototype, "employeeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '본부코드' }),
    __metadata("design:type", String)
], User.prototype, "headquartersCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '본부' }),
    __metadata("design:type", String)
], User.prototype, "headquartersName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '부문코드' }),
    __metadata("design:type", String)
], User.prototype, "divisionCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '부문' }),
    __metadata("design:type", String)
], User.prototype, "divisionName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '지사코드' }),
    __metadata("design:type", String)
], User.prototype, "branchCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '지사' }),
    __metadata("design:type", String)
], User.prototype, "branchName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, comment: '지점' }),
    __metadata("design:type", String)
], User.prototype, "officeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '지점코드' }),
    __metadata("design:type", String)
], User.prototype, "officeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '직급' }),
    __metadata("design:type", String)
], User.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '직책' }),
    __metadata("design:type", String)
], User.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '발령' }),
    __metadata("design:type", String)
], User.prototype, "assignment", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, comment: '직무' }),
    __metadata("design:type", String)
], User.prototype, "jobRole", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FieldType,
        nullable: true,
        comment: '스탭/필드'
    }),
    __metadata("design:type", String)
], User.prototype, "fieldType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true, comment: '계정' }),
    __metadata("design:type", String)
], User.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, comment: '비밀번호' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '고용구분' }),
    __metadata("design:type", String)
], User.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '근무상태' }),
    __metadata("design:type", String)
], User.prototype, "workStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일시' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일시' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, comment: '마지막 로그인' }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, comment: '활성화 상태' }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, comment: '비밀번호 변경일시' }),
    __metadata("design:type", Date)
], User.prototype, "passwordChangedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)('idx_user_account', ['account']),
    (0, typeorm_1.Index)('idx_user_headquarters', ['headquartersCode']),
    (0, typeorm_1.Index)('idx_user_division', ['divisionCode']),
    (0, typeorm_1.Index)('idx_user_branch', ['branchCode']),
    (0, typeorm_1.Index)('idx_user_office', ['officeCode']),
    (0, typeorm_1.Index)('idx_user_position', ['position']),
    (0, typeorm_1.Index)('idx_user_work_status', ['workStatus']),
    (0, typeorm_1.Index)('idx_user_field_type', ['fieldType'])
], User);
//# sourceMappingURL=User.js.map