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
exports.RacksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let RacksService = class RacksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.rack.create({
            data: {
                nome: data.nome,
                localizacao: data.localizacao,
                capacidade: data.capacidade ?? 42,
            },
        });
    }
    async findAll() {
        return this.prisma.rack.findMany({
            include: {
                ativos: {
                    orderBy: {
                        posicaoRack: 'asc',
                    },
                },
            },
            orderBy: {
                nome: 'asc',
            },
        });
    }
    async findOne(id) {
        const rack = await this.prisma.rack.findUnique({
            where: { id },
            include: {
                ativos: {
                    orderBy: {
                        posicaoRack: 'asc',
                    },
                },
            },
        });
        if (!rack) {
            throw new common_1.NotFoundException(`Rack com ID ${id} nao encontrado.`);
        }
        return rack;
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.rack.update({
            where: { id },
            data: {
                ...(data.nome !== undefined && {
                    nome: data.nome,
                }),
                ...(data.localizacao !== undefined && {
                    localizacao: data.localizacao,
                }),
                ...(data.capacidade !== undefined && {
                    capacidade: data.capacidade,
                }),
            },
        });
    }
    async remove(id) {
        const rack = await this.findOne(id);
        if (rack.ativos.length > 0) {
            throw new common_1.BadRequestException('Nao e possivel remover um rack com ativos vinculados.');
        }
        return this.prisma.rack.delete({
            where: { id },
        });
    }
};
exports.RacksService = RacksService;
exports.RacksService = RacksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RacksService);
//# sourceMappingURL=racks.service.js.map