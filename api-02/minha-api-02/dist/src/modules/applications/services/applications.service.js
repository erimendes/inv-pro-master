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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { servidoresIds, ...applicationData } = data;
        return this.prisma.aplicacao.create({
            data: {
                ...applicationData,
                servidores: servidoresIds?.length
                    ? {
                        connect: servidoresIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                servidores: true,
            },
        });
    }
    async findAll(categoria, criticidade) {
        return this.prisma.aplicacao.findMany({
            where: {
                categoria: categoria || undefined,
                criticidade: criticidade || undefined,
            },
            include: {
                servidores: true,
            },
            orderBy: {
                nome: 'asc',
            },
        });
    }
    async findOne(id) {
        const app = await this.prisma.aplicacao.findUnique({
            where: { id },
            include: {
                servidores: true,
            },
        });
        if (!app) {
            throw new common_1.NotFoundException(`Aplicação com ID ${id} não encontrada`);
        }
        return app;
    }
    async update(id, data) {
        await this.findOne(id);
        const { servidoresIds, ...applicationData } = data;
        return this.prisma.aplicacao.update({
            where: { id },
            data: {
                ...applicationData,
                ...(servidoresIds !== undefined && {
                    servidores: {
                        set: servidoresIds.map((id) => ({ id })),
                    },
                }),
            },
            include: {
                servidores: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.aplicacao.delete({
            where: { id },
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map