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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("../../../generated/prisma/client");
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateAssetRules(tipo, rackId, posicaoRack, hostFisicoId, currentAssetId) {
        if (tipo === client_1.AtivoTipo.SERVIDOR_FISICO &&
            hostFisicoId) {
            throw new common_1.BadRequestException('Um Servidor Fisico nao pode pertencer a outro ativo.');
        }
        if (tipo === client_1.AtivoTipo.SERVIDOR_VIRTUAL) {
            if (rackId ||
                posicaoRack != null) {
                throw new common_1.BadRequestException('Uma Maquina Virtual nao pode ser associada a Rack fisico.');
            }
            if (!hostFisicoId) {
                throw new common_1.BadRequestException('Uma Maquina Virtual deve possuir um host fisico.');
            }
            if (currentAssetId &&
                hostFisicoId === currentAssetId) {
                throw new common_1.BadRequestException('Um ativo nao pode ser host dele mesmo.');
            }
            const host = await this.prisma.ativo.findUnique({
                where: {
                    id: hostFisicoId,
                },
                select: {
                    id: true,
                    tipo: true,
                },
            });
            if (!host) {
                throw new common_1.NotFoundException(`Host fisico #${hostFisicoId} nao encontrado.`);
            }
            if (host.tipo !==
                client_1.AtivoTipo.SERVIDOR_FISICO) {
                throw new common_1.BadRequestException('Uma VM so pode pertencer a um Servidor Fisico.');
            }
        }
    }
    async create(data) {
        const tipoAtivo = data.tipo;
        await this.validateAssetRules(tipoAtivo, data.rackId, data.posicaoRack, data.hostFisicoId);
        try {
            return await this.prisma.ativo.create({
                data: {
                    patrimonio: data.patrimonio,
                    tipo: tipoAtivo,
                    fabricante: data.fabricante,
                    hardware: data.hardware,
                    modelo: data.modelo,
                    serial: data.serial,
                    hostname: data.hostname,
                    apelido: data.apelido,
                    ipPrincipal: data.ipPrincipal,
                    sistemaOperacional: data.sistemaOperacional,
                    cpu: data.cpu,
                    ram: data.ram,
                    armazenamento: data.armazenamento,
                    status: data.status,
                    emUso: data.emUso,
                    dataCompra: data.dataCompra,
                    valor: data.valor,
                    vmId: data.vmId,
                    observacoes: data.observacoes,
                    posicaoRack: data.posicaoRack,
                    tamanhoU: data.tamanhoU,
                    ...(data.rackId
                        ? {
                            rack: {
                                connect: {
                                    id: data.rackId,
                                },
                            },
                        }
                        : {}),
                    ...(data.hostFisicoId
                        ? {
                            host: {
                                connect: {
                                    id: data.hostFisicoId,
                                },
                            },
                        }
                        : {}),
                },
                include: {
                    rack: true,
                    host: true,
                },
            });
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('Erro interno ao criar ativo.');
        }
    }
    async findAll(tipo) {
        return await this.prisma.ativo.findMany({
            where: {
                tipo: tipo &&
                    tipo !== 'TODOS'
                    ? tipo
                    : undefined,
            },
            orderBy: {
                hostname: 'asc',
            },
            include: {
                rack: true,
                host: {
                    select: {
                        id: true,
                        hostname: true,
                        patrimonio: true,
                    },
                },
                vms: {
                    select: {
                        id: true,
                        hostname: true,
                        patrimonio: true,
                        sistemaOperacional: true,
                        ipPrincipal: true,
                        status: true,
                    },
                },
                aplicacoes: {
                    select: {
                        id: true,
                        nome: true,
                        criticidade: true,
                    },
                },
            },
        });
    }
    async findAvailable() {
        try {
            return await this.prisma.ativo.findMany({
                where: {
                    rackId: null,
                },
                orderBy: {
                    hostname: 'asc',
                },
                include: {
                    host: true,
                },
            });
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('Erro ao acessar tabela de ativos.');
        }
    }
    async findOne(id) {
        const asset = await this.prisma.ativo.findUnique({
            where: { id },
            include: {
                rack: true,
                host: {
                    select: {
                        id: true,
                        hostname: true,
                        patrimonio: true,
                        ipPrincipal: true,
                        sistemaOperacional: true,
                    },
                },
                vms: {
                    orderBy: {
                        hostname: 'asc',
                    },
                    select: {
                        id: true,
                        patrimonio: true,
                        hostname: true,
                        apelido: true,
                        ipPrincipal: true,
                        sistemaOperacional: true,
                        cpu: true,
                        ram: true,
                        armazenamento: true,
                        status: true,
                        emUso: true,
                    },
                },
                aplicacoes: {
                    select: {
                        id: true,
                        nome: true,
                        sigla: true,
                        criticidade: true,
                    },
                },
                configsRede: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Ativo #${id} nao encontrado`);
        }
        return asset;
    }
    async update(id, data) {
        const currentAsset = await this.findOne(id);
        const tipoFinal = data.tipo ||
            currentAsset.tipo;
        const rackIdFinal = data.rackId !== undefined
            ? data.rackId
            : currentAsset.rackId;
        const posicaoRackFinal = data.posicaoRack !== undefined
            ? data.posicaoRack
            : currentAsset.posicaoRack;
        const hostFisicoIdFinal = data.hostFisicoId !== undefined
            ? data.hostFisicoId
            : currentAsset.hostFisicoId;
        await this.validateAssetRules(tipoFinal, rackIdFinal, posicaoRackFinal, hostFisicoIdFinal, id);
        try {
            return await this.prisma.ativo.update({
                where: { id },
                data: {
                    patrimonio: data.patrimonio,
                    tipo: tipoFinal,
                    fabricante: data.fabricante,
                    hardware: data.hardware,
                    modelo: data.modelo,
                    serial: data.serial,
                    hostname: data.hostname,
                    apelido: data.apelido,
                    ipPrincipal: data.ipPrincipal,
                    sistemaOperacional: data.sistemaOperacional,
                    cpu: data.cpu,
                    ram: data.ram,
                    armazenamento: data.armazenamento,
                    status: data.status,
                    emUso: data.emUso,
                    dataCompra: data.dataCompra,
                    valor: data.valor,
                    vmId: data.vmId,
                    observacoes: data.observacoes,
                    posicaoRack: data.posicaoRack != null
                        ? Number(data.posicaoRack)
                        : null,
                    tamanhoU: data.tamanhoU != null
                        ? Number(data.tamanhoU)
                        : null,
                    rack: data.rackId
                        ? {
                            connect: {
                                id: data.rackId,
                            },
                        }
                        : {
                            disconnect: true,
                        },
                    host: data.hostFisicoId
                        ? {
                            connect: {
                                id: data.hostFisicoId,
                            },
                        }
                        : {
                            disconnect: true,
                        },
                },
                include: {
                    rack: true,
                    host: true,
                    vms: true,
                },
            });
        }
        catch (error) {
            console.error(error);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Erro interno ao atualizar ativo.');
        }
    }
    async remove(id) {
        const asset = await this.prisma.ativo.findUnique({
            where: { id },
            include: {
                vms: true,
            },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Ativo #${id} nao encontrado`);
        }
        if (asset.vms.length > 0) {
            throw new common_1.BadRequestException('Nao e possivel remover um servidor host que possui VMs vinculadas.');
        }
        try {
            return await this.prisma.ativo.delete({
                where: { id },
            });
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException(`Erro ao remover ativo #${id}`);
        }
    }
    async updatePosition(id, data) {
        const currentAsset = await this.findOne(id);
        await this.validateAssetRules(currentAsset.tipo, data.rackId, data.posicaoRack, currentAsset.hostFisicoId, id);
        return await this.prisma.ativo.update({
            where: { id },
            data: {
                posicaoRack: data.posicaoRack,
                rack: data.rackId
                    ? {
                        connect: {
                            id: data.rackId,
                        },
                    }
                    : {
                        disconnect: true,
                    },
            },
        });
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map