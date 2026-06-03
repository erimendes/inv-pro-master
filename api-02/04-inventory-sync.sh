#!/usr/bin/env bash
set -euo pipefail

# Configurações de cores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Nome do projeto (Ajuste para bater com a pasta criada no SCRIPT-04)
PROJECT_NAME="${PROJECT_NAME:-minha-api-02}"

log() { echo -e "${BLUE}==> $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# 1. Verificações Iniciais
if [ ! -d "$PROJECT_NAME" ]; then
    error "O diretório '$PROJECT_NAME' não existe. Execute o script de criação primeiro."
fi

cd "$PROJECT_NAME"

log "Instalando @nestjs/schedule ..."
npm install @nestjs/schedule

log "Instalando joi e @types/joi ..."
npm install joi && npm install -D @types/joi

log "Instalando @nestjs/axios e axios ..."
npm install @nestjs/axios axios

# Criação de estrutura de pastas
mkdir -p src/config/env \
         src/modules/glpi/interfaces \
         src/modules/glpi/dto \
         src/modules/inventory/dto \
         src/modules/inventory/repositories \
         src/modules/sync/tasks

#########################################
# 1. CONFIG - Environment & Validation
#########################################
log "Configurando validação de ambiente (Joi)..."

cat <<EOF > src/config/env/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  GLPI_API_URL: Joi.string().uri().required(),
  GLPI_APP_TOKEN: Joi.string().required(),
  GLPI_USER_TOKEN: Joi.string().required(),
});
EOF

cat <<EOF > src/config/env/configuration.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  database: { url: process.env.DATABASE_URL },
  glpi: {
    url: process.env.GLPI_API_URL,
    appToken: process.env.GLPI_APP_TOKEN,
    userToken: process.env.GLPI_USER_TOKEN,
  },
}));
EOF

#########################################
# 2. GLPI - Integration Layer
#########################################
log "Criando integração com GLPI..."

cat <<EOF > src/modules/glpi/glpi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GlpiService {
  private readonly logger = new Logger(GlpiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchInventory() {
    this.logger.log('Buscando ativos do GLPI...');
    // TODO: Implementar lógica de fetch real conforme o modelo do Ativo
    return []; 
  }
}
EOF

cat <<EOF > src/modules/glpi/glpi.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GlpiService } from './glpi.service';

@Module({
  imports: [HttpModule],
  providers: [GlpiService],
  exports: [GlpiService],
})
export class GlpiModule {}
EOF

#########################################
# 4. INVENTORY - Repository (Ajustado ao Novo Schema)
#########################################
log "Configurando domínio de Inventário (Ativos)..."

cat <<EOF > src/modules/inventory/repositories/inventory.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AtivoStatus, AtivoTipo } from '../../../../generated/prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertAtivo(data: any) {
    // O campo serial é @unique no seu Schema, ideal para o upsert
    return this.prisma.ativo.upsert({
      where: { serial: data.serial },
      update: {
        hostname: data.hostname,
        status: data.status as AtivoStatus,
        emUso: data.emUso,
        updatedAt: new Date(),
        // Adicione outros campos que podem mudar no GLPI
        cpu: data.cpu,
        ram: data.ram,
        armazenamento: data.armazenamento,
      },
      create: {
        patrimonio: data.patrimonio,
        serial: data.serial,
        tipo: data.tipo as AtivoTipo,
        fabricante: data.fabricante,
        modelo: data.modelo,
        hostname: data.hostname,
        cpu: data.cpu,
        ram: data.ram,
        armazenamento: data.armazenamento,
        status: (data.status as AtivoStatus) || AtivoStatus.DISPONIVEL,
      },
    });
  }

  // ... (mantenha os imports e o método upsertAtivo e findByTag)

  async findByTag(tag: string) {
    return this.prisma.ativo.findFirst({
      where: { patrimonio: tag },
      include: { 
        configsRede: true, 
        user: true 
      },
    });
  }

  // ADICIONE ESTE MÉTODO ABAIXO:
  async findAll() {
    return this.prisma.ativo.findMany({
      include: {
        configsRede: true,
        user: true,
      },
    });
  }
}
EOF

cat <<EOF > src/modules/inventory/inventory.service.ts
import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryDto } from './dto/inventory.dto'; // Importe o DTO

@Injectable()
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async syncBatch(items: InventoryDto[]) {
    // Usar um loop simples é mais seguro para UPSERTS sequenciais no Prisma
    // e evita o erro de "Too many connections"
    for (const item of items) {
      await this.repository.upsertAtivo(item);
    }
  }

  // MÉTODO PARA A LINHA 15 DO CONTROLLER
  async getByTag(tag: string) {
    return this.repository.findByTag(tag);
  }

  // MÉTODO PARA A LINHA 22 DO CONTROLLER
  async findAll() {
    return this.repository.findAll();
  }
}
EOF

log "Criando Controller de Inventário para o Swagger..."

cat <<EOF > src/modules/inventory/inventory.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {

  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':tag')
  @ApiOperation({ summary: 'Busca um ativo pela Tag Patrimonial' })
  async getByTag(@Param('tag') tag: string) {
    return this.inventoryService.getByTag(tag);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todos os ativos sincronizados' })
  async findAll() {
    return this.inventoryService.findAll();
  }
}
EOF

cat <<EOF > src/modules/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryController } from './inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
EOF

#########################################
# 5. SYNC - Tasks
#########################################
log "Configurando orquestrador de sincronização..."

cat <<EOF > src/modules/sync/tasks/inventory-sync.task.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GlpiService } from '../../glpi/glpi.service';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class InventorySyncTask {
  private readonly logger = new Logger(InventorySyncTask.name);

  constructor(
    private readonly glpiService: GlpiService,
    private readonly inventoryService: InventoryService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSync() {
    this.logger.log('--- Iniciando Sincronização Automática ---');
    const data = await this.glpiService.fetchInventory();
    await this.inventoryService.syncBatch(data);
    this.logger.log('--- Sincronização Finalizada ---');
  }
}
EOF

cat <<EOF > src/modules/sync/sync.module.ts
import { Module } from '@nestjs/common';
import { GlpiModule } from '../glpi/glpi.module';
import { InventoryModule } from '../inventory/inventory.module';
import { InventorySyncTask } from './tasks/inventory-sync.task';

@Module({
  imports: [GlpiModule, InventoryModule],
  providers: [InventorySyncTask],
})
export class SyncModule {}
EOF

#########################################
# 6. APP MODULE
#########################################
log "Finalizando AppModule..."

cat <<EOF > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/env/configuration';
import { validationSchema } from './config/env/validation.schema';
import { PrismaModule } from './database/prisma.module';
import { SyncModule } from './modules/sync/sync.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    InventoryModule,
    SyncModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
EOF

log "Criando DTOs para o módulo de Inventário..."
cat <<EOF > src/modules/inventory/dto/inventory.dto.ts
export class InventoryDto {
  tagPatrimonial!: string;
  numSerie!: string;
  tipo!: string;
  fabricante!: string;
  modelo!: string;
  
  // Para campos opcionais, use o '?'
  hostname?: string;
  status?: string;
  cpu?: string;
  ram?: string;
  discoFisico?: string;
  emUso?: boolean;
}
EOF

log "Criando sync-inventory.dto.ts para o módulo de Inventário..."
cat <<EOF > src/modules/inventory/dto/sync-inventory.dto.ts
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CreateInventoryDto } from './create-inventory.dto';

export class SyncInventoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryDto)
  items!: CreateInventoryDto[];
}
EOF

log "Criando create-inventory.dto.ts para o módulo de Inventário..."
cat <<EOF > src/modules/inventory/dto/create-inventory.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsInt,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AtivoTipo, AtivoStatus } from '../../../../generated/prisma/client';

export class CreateInventoryDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(3, 50)
  tagPatrimonial!: string;

  @IsOptional()
  @IsEnum(AtivoTipo)
  tipo?: AtivoTipo;

  @Transform(({ value }) => value?.trim())
  @IsString()
  fabricante!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  modelo!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  numSerie!: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  discoFisico?: string;

  @IsOptional()
  @IsEnum(AtivoStatus)
  status?: AtivoStatus;

  @IsOptional()
  @IsBoolean()
  emUso?: boolean;

  @IsOptional()
  @IsDateString()
  dataCompra?: string;

  @IsOptional()
  @Type(() => Number)
  valor?: number; // Prisma Decimal → number no DTO

  // Virtualização
  @IsOptional()
  @IsBoolean()
  isVirtualizado?: boolean;

  @IsOptional()
  @IsString()
  hyperVName?: string;

  @IsOptional()
  @IsInt()
  hostFisicoId?: number;

  // Relacionamento com User
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
EOF

log "Criando update-inventory.dto.ts para o módulo de Inventário..."
cat <<EOF > src/modules/inventory/dto/update-inventory.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}
EOF


echo -e "\n${GREEN}✅ ESTRUTURA ATUALIZADA PARA O NOVO SCHEMA!${NC}"