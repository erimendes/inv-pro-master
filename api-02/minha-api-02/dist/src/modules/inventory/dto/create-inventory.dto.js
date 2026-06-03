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
exports.CreateInventoryDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("../../../../generated/prisma/client");
class CreateInventoryDto {
    tagPatrimonial;
    tipo;
    fabricante;
    modelo;
    numSerie;
    hostname;
    cpu;
    ram;
    discoFisico;
    status;
    emUso;
    dataCompra;
    valor;
    isVirtualizado;
    hyperVName;
    hostFisicoId;
    userId;
    observacoes;
    static _OPENAPI_METADATA_FACTORY() {
        return { tagPatrimonial: { required: true, type: () => String, minLength: 3, maxLength: 50 }, tipo: { required: false, enum: ["LAPTOP", "DESKTOP", "SERVIDOR_FISICO", "SERVIDOR_VIRTUAL", "SWITCH", "ROTEADOR", "STORAGE", "FIREWALL", "ACCESS_POINT", "IMPRESSORA", "MONITOR", "NOBREAK"] }, fabricante: { required: true, type: () => String }, modelo: { required: true, type: () => String }, numSerie: { required: true, type: () => String }, hostname: { required: false, type: () => String }, cpu: { required: false, type: () => String }, ram: { required: false, type: () => String }, discoFisico: { required: false, type: () => String }, status: { required: false, enum: ["DISPONIVEL", "EM_USO", "MANUTENCAO", "DESCARTADO"] }, emUso: { required: false, type: () => Boolean }, dataCompra: { required: false, type: () => String }, valor: { required: false, type: () => Number }, isVirtualizado: { required: false, type: () => Boolean }, hyperVName: { required: false, type: () => String }, hostFisicoId: { required: false, type: () => Number }, userId: { required: false, type: () => String }, observacoes: { required: false, type: () => String } };
    }
}
exports.CreateInventoryDto = CreateInventoryDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 50),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "tagPatrimonial", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AtivoTipo),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "tipo", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "fabricante", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "modelo", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "numSerie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "hostname", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "cpu", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "ram", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "discoFisico", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AtivoStatus),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateInventoryDto.prototype, "emUso", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "dataCompra", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInventoryDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateInventoryDto.prototype, "isVirtualizado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "hyperVName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateInventoryDto.prototype, "hostFisicoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "observacoes", void 0);
//# sourceMappingURL=create-inventory.dto.js.map