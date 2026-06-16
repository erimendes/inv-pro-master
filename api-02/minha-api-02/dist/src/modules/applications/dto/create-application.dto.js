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
exports.CreateApplicationDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("../../../../generated/prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CreateApplicationDto {
    nome;
    sigla;
    descricao;
    categoria;
    criticidade;
    businessOwner;
    responsavelTecnico;
    contatoFuncional;
    fornecedor;
    janelaOperacao;
    backupInfo;
    procedimentoRecup;
    pontoUnicoFalha;
    tecnologiaPrincipal;
    databaseInfo;
    integracoes;
    servidoresIds;
    static _OPENAPI_METADATA_FACTORY() {
        return { nome: { required: true, type: () => String }, sigla: { required: false, type: () => String }, descricao: { required: false, type: () => String }, categoria: { required: false, enum: ["ADMINISTRATIVO", "OPERACIONAL", "MONITORAMENTO", "DEVOPS", "SEGURANCA"] }, criticidade: { required: false, enum: ["BAIXA", "MEDIA", "ALTA", "CRITICA"] }, businessOwner: { required: false, type: () => String }, responsavelTecnico: { required: false, type: () => String }, contatoFuncional: { required: false, type: () => String }, fornecedor: { required: false, type: () => String }, janelaOperacao: { required: false, type: () => String }, backupInfo: { required: false, type: () => String }, procedimentoRecup: { required: false, type: () => String }, pontoUnicoFalha: { required: false, type: () => String }, tecnologiaPrincipal: { required: false, type: () => String }, databaseInfo: { required: false, type: () => String }, integracoes: { required: false, type: () => String }, servidoresIds: { required: false, type: () => [Number] } };
    }
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "sigla", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.SistemaCategoria,
        example: client_1.SistemaCategoria.OPERACIONAL,
    }),
    (0, class_validator_1.IsEnum)(client_1.SistemaCategoria),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.Criticidade,
        example: client_1.Criticidade.ALTA,
    }),
    (0, class_validator_1.IsEnum)(client_1.Criticidade),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "criticidade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "businessOwner", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "responsavelTecnico", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "contatoFuncional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "fornecedor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "janelaOperacao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "backupInfo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "procedimentoRecup", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "pontoUnicoFalha", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "tecnologiaPrincipal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "databaseInfo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "integracoes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [Number],
        description: 'IDs dos servidores vinculados',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateApplicationDto.prototype, "servidoresIds", void 0);
//# sourceMappingURL=create-application.dto.js.map