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
exports.Area = void 0;
const typeorm_1 = require("typeorm");
let Area = class Area {
    id;
    name;
    coordinates;
    topojson;
    color;
    strokeColor;
    strokeWeight;
    fillOpacity;
    description;
    admCd;
    properties;
    isActive;
    createdBy;
    createdAt;
    updatedAt;
};
exports.Area = Area;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Area.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Area.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Area.prototype, "coordinates", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Area.prototype, "topojson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Area.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Area.prototype, "strokeColor", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Area.prototype, "strokeWeight", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Area.prototype, "fillOpacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Area.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '행정구역코드' }),
    __metadata("design:type", String)
], Area.prototype, "admCd", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Area.prototype, "properties", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Area.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: '생성자 사번' }),
    __metadata("design:type", String)
], Area.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Area.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Area.prototype, "updatedAt", void 0);
exports.Area = Area = __decorate([
    (0, typeorm_1.Entity)('areas')
], Area);
//# sourceMappingURL=Area.js.map