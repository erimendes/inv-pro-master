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
exports.CreateAssetDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("../../../../generated/prisma/client");
class CreateAssetDto {
    patrimonio;
    tipo;
    fabricante;
    hardware;
    modelo;
    serial;
    hostname;
    apelido;
    descricao;
    tag;
    ipPrincipal;
    sistemaOperacional;
    versaoSO;
    cpu;
    nucleosCPU;
    threadsCPU;
    ram;
    armazenamento;
    gpu;
    macAddress;
    status;
    powerState;
    criticidade;
    emUso;
    monitorado;
    dataCompra;
    garantiaFim;
    valor;
    fornecedor;
    observacoes;
    isVirtualizado;
    hypervisor;
    vmId;
    cluster;
    datacenter;
    hostFisicoId;
    userId;
    rackId;
    posicaoRack;
    tamanhoU;
    glpiId;
    static _OPENAPI_METADATA_FACTORY() {
        return { patrimonio: { required: false, type: () => String }, tipo: { required: true, enum: ["LAPTOP", "DESKTOP", "SERVIDOR_FISICO", "SERVIDOR_VIRTUAL", "SWITCH", "ROTEADOR", "STORAGE", "FIREWALL", "ACCESS_POINT", "IMPRESSORA", "MONITOR", "NOBREAK"] }, fabricante: { required: false, type: () => String }, hardware: { required: false, type: () => String }, modelo: { required: false, type: () => String }, serial: { required: false, type: () => String }, hostname: { required: false, type: () => String }, apelido: { required: false, type: () => String }, descricao: { required: false, type: () => String }, tag: { required: false, type: () => String }, ipPrincipal: { required: false, type: () => String }, sistemaOperacional: { required: false, type: () => String }, versaoSO: { required: false, type: () => String }, cpu: { required: false, type: () => String }, nucleosCPU: { required: false, type: () => Number }, threadsCPU: { required: false, type: () => Number }, ram: { required: false, type: () => String }, armazenamento: { required: false, type: () => String }, gpu: { required: false, type: () => String }, macAddress: { required: false, type: () => String }, status: { required: false, enum: ["DISPONIVEL", "EM_USO", "MANUTENCAO", "DESCARTADO"] }, powerState: { required: false, enum: ["ON", "OFF", "SUSPENDED", "PAUSED"] }, criticidade: { required: false, enum: ["BAIXA", "MEDIA", "ALTA", "CRITICA"] }, emUso: { required: false, type: () => Boolean }, monitorado: { required: false, type: () => Boolean }, dataCompra: { required: false, type: () => String }, garantiaFim: { required: false, type: () => String }, valor: { required: false, type: () => Number }, fornecedor: { required: false, type: () => String }, observacoes: { required: false, type: () => String }, isVirtualizado: { required: false, type: () => Boolean }, hypervisor: { required: false, enum: ["VMWARE", "HYPERV", "PROXMOX", "KVM", "XEN"] }, vmId: { required: false, type: () => String }, cluster: { required: false, type: () => String }, datacenter: { required: false, type: () => String }, hostFisicoId: { required: false, type: () => Number }, userId: { required: false, type: () => String }, rackId: { required: false, type: () => String }, posicaoRack: { required: false, type: () => Number, minimum: 1 }, tamanhoU: { required: false, type: () => Number, minimum: 1 }, glpiId: { required: false, type: () => Number } };
    }
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "patrimonio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.AtivoTipo,
        example: client_1.AtivoTipo.SERVIDOR_FISICO,
    }),
    (0, class_validator_1.IsEnum)(client_1.AtivoTipo),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "fabricante", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "hardware", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "modelo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "serial", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "hostname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "apelido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "ipPrincipal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "sistemaOperacional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "versaoSO", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "cpu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "nucleosCPU", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "threadsCPU", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "ram", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "armazenamento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "gpu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "macAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.AtivoStatus,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AtivoStatus),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.PowerState,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PowerState),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "powerState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.Criticidade,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Criticidade),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "criticidade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssetDto.prototype, "emUso", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssetDto.prototype, "monitorado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "dataCompra", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "garantiaFim", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "valor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "fornecedor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "observacoes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssetDto.prototype, "isVirtualizado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.HypervisorTipo,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.HypervisorTipo),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "hypervisor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "vmId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "cluster", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "datacenter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "hostFisicoId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "rackId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "posicaoRack", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "tamanhoU", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "glpiId", void 0);
//# sourceMappingURL=create-asset.dto.js.map