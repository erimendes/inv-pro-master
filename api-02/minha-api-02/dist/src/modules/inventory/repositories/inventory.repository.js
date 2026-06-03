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
exports.InventoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("../../../../generated/prisma/client");
let InventoryRepository = class InventoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertAtivo(data) {
        return this.prisma.ativo.upsert({
            where: { serial: data.serial },
            update: {
                hostname: data.hostname,
                status: data.status,
                emUso: data.emUso,
                updatedAt: new Date(),
                cpu: data.cpu,
                ram: data.ram,
                armazenamento: data.armazenamento,
            },
            create: {
                patrimonio: data.patrimonio,
                serial: data.serial,
                tipo: data.tipo,
                fabricante: data.fabricante,
                modelo: data.modelo,
                hostname: data.hostname,
                cpu: data.cpu,
                ram: data.ram,
                armazenamento: data.armazenamento,
                status: data.status || client_1.AtivoStatus.DISPONIVEL,
            },
        });
    }
    async findByTag(tag) {
        return this.prisma.ativo.findFirst({
            where: { patrimonio: tag },
            include: {
                configsRede: true,
                user: true
            },
        });
    }
    async findAll() {
        return this.prisma.ativo.findMany({
            include: {
                configsRede: true,
                user: true,
            },
        });
    }
};
exports.InventoryRepository = InventoryRepository;
exports.InventoryRepository = InventoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryRepository);
//# sourceMappingURL=inventory.repository.js.map