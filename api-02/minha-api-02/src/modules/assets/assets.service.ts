// src/modules/assets/assets.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

import {
  AtivoTipo,
  AtivoStatus,
} from '../../../generated/prisma/client';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private async validateAssetRules(
    tipo: AtivoTipo,
    rackId: string | null | undefined,
    posicaoRack: number | null | undefined,
    hostFisicoId: number | null | undefined,
    currentAssetId?: number,
  ): Promise<void> {

    if (
      tipo === AtivoTipo.SERVIDOR_FISICO &&
      hostFisicoId
    ) {
      throw new BadRequestException(
        'Um Servidor Fisico nao pode pertencer a outro ativo.',
      );
    }

    if (
      tipo === AtivoTipo.SERVIDOR_VIRTUAL
    ) {

      if (
        rackId ||
        posicaoRack != null
      ) {
        throw new BadRequestException(
          'Uma Maquina Virtual nao pode ser associada a Rack fisico.',
        );
      }

      if (!hostFisicoId) {
        throw new BadRequestException(
          'Uma Maquina Virtual deve possuir um host fisico.',
        );
      }

      if (
        currentAssetId &&
        hostFisicoId === currentAssetId
      ) {
        throw new BadRequestException(
          'Um ativo nao pode ser host dele mesmo.',
        );
      }

      const host =
        await this.prisma.ativo.findUnique({
          where: {
            id: hostFisicoId,
          },

          select: {
            id: true,
            tipo: true,
          },
        });

      if (!host) {
        throw new NotFoundException(
          `Host fisico #${hostFisicoId} nao encontrado.`,
        );
      }

      if (
        host.tipo !==
        AtivoTipo.SERVIDOR_FISICO
      ) {
        throw new BadRequestException(
          'Uma VM so pode pertencer a um Servidor Fisico.',
        );
      }
    }
  }

  async create(data: CreateAssetDto) {

    const tipoAtivo =
      data.tipo as AtivoTipo;

    await this.validateAssetRules(
      tipoAtivo,
      data.rackId,
      data.posicaoRack,
      data.hostFisicoId,
    );

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

          status:
            data.status as AtivoStatus,

          emUso: data.emUso,

          dataCompra: data.dataCompra,
          valor: data.valor,

          vmId: data.vmId,

          observacoes:
            data.observacoes,

          posicaoRack:
            data.posicaoRack,

          tamanhoU:
            data.tamanhoU,

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

    } catch (error) {

      console.error(error);

      throw new InternalServerErrorException(
        'Erro interno ao criar ativo.',
      );
    }
  }

  async findAll(tipo?: string) {

    return await this.prisma.ativo.findMany({
      where: {
        tipo:
          tipo &&
          tipo !== 'TODOS'
            ? (tipo as AtivoTipo)
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

    } catch (error) {

      console.error(error);

      throw new InternalServerErrorException(
        'Erro ao acessar tabela de ativos.',
      );
    }
  }

  async findOne(id: number) {

    const asset =
      await this.prisma.ativo.findUnique({

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

      throw new NotFoundException(
        `Ativo #${id} nao encontrado`,
      );
    }

    return asset;
  }

  async update(
    id: number,
    data: UpdateAssetDto,
  ) {

    const currentAsset =
      await this.findOne(id);

    const tipoFinal =
      (data.tipo as AtivoTipo) ||
      currentAsset.tipo;

    const rackIdFinal =
      data.rackId !== undefined
        ? data.rackId
        : currentAsset.rackId;

    const posicaoRackFinal =
      data.posicaoRack !== undefined
        ? data.posicaoRack
        : currentAsset.posicaoRack;

    const hostFisicoIdFinal =
      data.hostFisicoId !== undefined
        ? data.hostFisicoId
        : currentAsset.hostFisicoId;

    await this.validateAssetRules(
      tipoFinal,
      rackIdFinal,
      posicaoRackFinal,
      hostFisicoIdFinal,
      id,
    );

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
          status: data.status as AtivoStatus,
          emUso: data.emUso,
          dataCompra: data.dataCompra,
          valor: data.valor,
          vmId: data.vmId,
          observacoes: data.observacoes,
          posicaoRack:
            data.posicaoRack != null
              ? Number(
                  data.posicaoRack,
                )
              : null,

          tamanhoU:
            data.tamanhoU != null
              ? Number(
                  data.tamanhoU,
                )
              : null,

          rack:
            data.rackId
              ? {
                  connect: {
                    id: data.rackId,
                  },
                }
              : {
                  disconnect: true,
                },

          host:
            data.hostFisicoId
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

    } catch (error) {

      console.error(error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro interno ao atualizar ativo.',
      );
    }
  }

  async remove(id: number) {

    const asset =
      await this.prisma.ativo.findUnique({
        where: { id },
        include: {
          vms: true,
        },
      });

    if (!asset) {
      throw new NotFoundException(
        `Ativo #${id} nao encontrado`,
      );
    }

    if (asset.vms.length > 0) {
      throw new BadRequestException(
        'Nao e possivel remover um servidor host que possui VMs vinculadas.',
      );
    }

    try {
      return await this.prisma.ativo.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `Erro ao remover ativo #${id}`,
      );
    }
  }

  async updatePosition(
    id: number,
    data: {
      rackId: string | null;
      posicaoRack: number | null;
    },
  ) {

    const currentAsset =
      await this.findOne(id);

    await this.validateAssetRules(
      currentAsset.tipo,
      data.rackId,
      data.posicaoRack,
      currentAsset.hostFisicoId,
      id,
    );

    return await this.prisma.ativo.update({
      where: { id },
      data: {
        posicaoRack: data.posicaoRack,
        rack:
          data.rackId
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
}
