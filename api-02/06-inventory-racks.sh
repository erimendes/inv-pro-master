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

log "Configurando Módulo Racks"

# Garantir a criação das pastas corretas do módulo
mkdir -p src/modules/racks/dto

cat << 'EOF' > src/modules/racks/dto/create-rack.dto.ts
// src/modules/racks/dto/create-rack.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateRackDto {
  @ApiProperty({
    example: 'Rack CPD 01',
  })
  @IsString()
  nome!: string;

  @ApiPropertyOptional({
    example: 'Sala do Datacenter',
  })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({
    example: 42,
    default: 42,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidade?: number;
}
EOF

cat << 'EOF' > src/modules/racks/dto/update-rack.dto.ts
// src/modules/racks/dto/update-rack.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRackDto } from './create-rack.dto';

export class UpdateRackDto extends PartialType(
  CreateRackDto,
) {}
EOF

cat << 'EOF' > src/modules/racks/racks.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

@Injectable()
export class RacksService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRackDto) {
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

  async findOne(id: string) {
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
      throw new NotFoundException(
        `Rack com ID ${id} nao encontrado.`,
      );
    }

    return rack;
  }

  async update(
    id: string,
    data: UpdateRackDto,
  ) {
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

  async remove(id: string) {
    const rack = await this.findOne(id);

    if (rack.ativos.length > 0) {
      throw new BadRequestException(
        'Nao e possivel remover um rack com ativos vinculados.',
      );
    }

    return this.prisma.rack.delete({
      where: { id },
    });
  }
}
EOF

cat << 'EOF' > src/modules/racks/racks.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RacksService } from './racks.service';

import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

@ApiTags('Racks')
@Controller('racks')
export class RacksController {
  constructor(
    private readonly racksService: RacksService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar rack',
  })
  create(
    @Body()
    createRackDto: CreateRackDto,
  ) {
    return this.racksService.create(
      createRackDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar racks',
  })
  findAll() {
    return this.racksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar rack por ID',
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.racksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar rack',
  })
  update(
    @Param('id')
    id: string,

    @Body()
    body: UpdateRackDto,
  ) {
    return this.racksService.update(
      id,
      body,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover rack',
  })
  remove(
    @Param('id')
    id: string,
  ) {
    return this.racksService.remove(id);
  }
}
EOF

cat << 'EOF' > src/modules/racks/racks.module.ts
import { Module } from '@nestjs/common';
import { RacksController } from './racks.controller';
import { RacksService } from './racks.service';

@Module({
  controllers: [RacksController],
  providers: [RacksService],
  exports: [RacksService],
})
export class RacksModule {}
EOF

echo -e "${GREEN}✅ Módulos e Boilerplates criados com sucesso!${NC}"