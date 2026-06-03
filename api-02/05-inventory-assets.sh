#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-minha-api-02}"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}==> $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Garantir que estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    log "Iniciando estrutura Enterprise para: $PROJECT_NAME"
    mkdir -p "$PROJECT_NAME"
    cd "$PROJECT_NAME"
fi

log "Configurando Módulo Assets"

mkdir -p src/modules/assets/dto

cat << 'EOF' > src/modules/assets/dto/create-asset.dto.ts
// src/modules/assets/dto/create-asset.dto.ts

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  AtivoTipo,
  AtivoStatus,
  PowerState,
  Criticidade,
  HypervisorTipo,
} from '../../../../generated/prisma/client';

export class CreateAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patrimonio?: string;

  @ApiProperty({
    enum: AtivoTipo,
    example: AtivoTipo.SERVIDOR_FISICO,
  })
  @IsEnum(AtivoTipo)
  tipo!: AtivoTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabricante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hardware?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hostname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apelido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sistemaOperacional?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  versaoSO?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  nucleosCPU?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  threadsCPU?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  armazenamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gpu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({
    enum: AtivoStatus,
  })
  @IsOptional()
  @IsEnum(AtivoStatus)
  status?: AtivoStatus;

  @ApiPropertyOptional({
    enum: PowerState,
  })
  @IsOptional()
  @IsEnum(PowerState)
  powerState?: PowerState;

  @ApiPropertyOptional({
    enum: Criticidade,
  })
  @IsOptional()
  @IsEnum(Criticidade)
  criticidade?: Criticidade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emUso?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monitorado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataCompra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  garantiaFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fornecedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  //////////////////////////////////////////////////////
  // Virtualização
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVirtualizado?: boolean;

  @ApiPropertyOptional({
    enum: HypervisorTipo,
  })
  @IsOptional()
  @IsEnum(HypervisorTipo)
  hypervisor?: HypervisorTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vmId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cluster?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  datacenter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  hostFisicoId?: number;

  //////////////////////////////////////////////////////
  // Relacionamentos
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rackId?: string;

  //////////////////////////////////////////////////////
  // Rack
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  posicaoRack?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  tamanhoU?: number;

  //////////////////////////////////////////////////////
  // GLPI
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  glpiId?: number;
}
EOF

cat << 'EOF' > src/modules/assets/dto/update-asset.dto.ts
// src/modules/assets/dto/update-asset.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateAssetDto extends PartialType(
  CreateAssetDto,
) {}
EOF

cat << 'EOF' > src/modules/assets/assets.service.ts
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
EOF

cat << 'EOF' > src/modules/assets/assets.controller.ts
// src/modules/assets/assets.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  BadRequestException,
  Put,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { IsOptional, IsString, IsInt, Min } from 'class-validator';

import { AssetsService } from './assets.service';

import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

class UpdateAssetPositionDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  rackId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  posicaoRack?: number | null;
}

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
  ) {}

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
  ) {
    return this.assetsService.findAll(
      tipo,
    );
  }

  @Get('available')
  findAvailable() {
    return this.assetsService.findAvailable();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.assetsService.findOne(
      Number(id),
    );
  }

  @Post()
  create(
    @Body()
    createAssetDto: CreateAssetDto,
  ) {
    return this.assetsService.create(
      createAssetDto,
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar Ativo',
  })
  @ApiBody({
    type: UpdateAssetDto,
  })
  update(
    @Param('id') id: string,

    @Body()
    body: UpdateAssetDto,
  ) {
    return this.assetsService.update(
      Number(id),
      body,
    );
  }

  @Patch(':id')
  partialUpdate(
    @Param('id') id: string,

    @Body()
    updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(
      Number(id),
      updateAssetDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.assetsService.remove(
      Number(id),
    );
  }

  @Patch(':id/position')
  @ApiOperation({
    summary: 'Atualizar Posicao do Ativo no Rack',
  })
  updatePosition(
    @Param('id') id: string,

    @Body()
    updateDto: UpdateAssetPositionDto,
  ) {
    if (!id) {
      throw new BadRequestException(
        'O ID do ativo e obrigatorio na URL',
      );
    }

    return this.assetsService.updatePosition(
      Number(id),
      {
        rackId: updateDto.rackId ?? null,
        posicaoRack: updateDto.posicaoRack ?? null,
      },
    );
  }
}
EOF

cat << 'EOF' > src/modules/assets/assets.module.ts
import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
EOF

echo -e "${GREEN}✅ Módulo Assets criado com sucesso!${NC}"