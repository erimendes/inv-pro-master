#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="minha-api-02"

# Cores e Estilos
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}==> $1${NC}"; }

echo -e "${BLUE}🚀 INICIANDO SETUP: $PROJECT_NAME${NC}"

# 1. Criação do Projeto
npx @nestjs/cli@latest new "$PROJECT_NAME" --package-manager npm --skip-git
cd "$PROJECT_NAME"

# 2. Instalação de Dependências
log "Instalando dependências principais..."
npm install @nestjs/config @nestjs/jwt @nestjs/passport class-validator class-transformer passport passport-jwt bcrypt argon2
npm install -D @types/passport-jwt @types/bcrypt ts-node
npm install joi
npm install --save-dev @types/joi
log "Instalando Prisma e drivers..."
npm install @prisma/client pg
npm install -D prisma @types/pg

npm install csv-parser
npm install -D tsx
log "Instalando npm i @prisma/adapter-pg para compatibilidade com Prisma Client v5..."
npm install -D @prisma/adapter-pg

npm install class-validator class-transformer
npm install @nestjs/schedule
log "Instalando Swagger..."
npm install @nestjs/swagger swagger-ui-express

log "Iniciando Prisma..."
npx prisma init --datasource-provider postgresql

#########################################
# 📄 Configuração do .env
#########################################
log "📄 Configurando .env..."
cat << 'EOF' > .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_MAIN_DATABASE=postgres
NEW_PROJECT_DB=minha_api_02

POSTGRES_USER=postgres
POSTGRES_PW=postgres
POSTGRES_DB=minha_api_02

PGADMIN_MAIL=admin@local.com
PGADMIN_PW=changeit

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minha_api_02?schema=public"

JWT_SECRET="super-secret"

# Configurações do GLPI (O que o erro pediu)
GLPI_API_URL="https://seu-glpi.com/apirest.php"
GLPI_APP_TOKEN="seu_app_token_aqui"
GLPI_USER_TOKEN="seu_user_token_aqui"

LDAP_URL=ldap://ad.seudominio.local
LDAP_DOMAIN=seudominio.local
LDAP_BASE_DN=DC=seudominio,DC=local
EOF

#########################################
# 🛠️ Script para criar banco se não existir
#########################################
log "📁 Criando script para criação de banco em src/scripts..."
mkdir -p scripts
cat << 'EOF' > scripts/sync-criar-banco.ts
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function ensureDatabaseExists() {
  const dbName = process.env.NEW_PROJECT_DB;
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Conectado ao Postgres para verificar bancos...');
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Sucesso: Banco "${dbName}" criado!`);
    } else {
      console.log(`ℹ️ O banco "${dbName}" já existe.`);
    }
  } catch (err: any) {
    console.error("❌ Erro ao criar banco:", err.message);
  } finally {
    await client.end();
  }
}

ensureDatabaseExists();
EOF

# Adiciona script no package.json
sed -i 's/"scripts": {/"scripts": {\n    "db:create": "ts-node scripts\/sync-criar-banco.ts",/' package.json

cat << 'EOF' > nest-cli.json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      { "include": "generated/**/*", "watchAssets": true }
    ],
    "plugins": ["@nestjs/swagger"] 
  }
}
EOF

#########################################
# 🧱 Database Module
#########################################
mkdir -p src/database
cat << 'EOF' > src/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  
  // Propriedade que seus outros Services vão consumir
  public client: any;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    
    // Inicializa o PrismaClient base
    super({ adapter });

    // Armazenamos a referência da instância da classe base externa
    const baseClient = this;

    // Aplicamos a extensão global de auditoria
    this.client = this.$extends({
      query: {
        $allModels: {
          // Captura qualquer operação de criação
          async create({ model, args, query }) {
            const result = await query(args);

            // Evita loop infinito se a query for o próprio AuditLog
            if (model === 'AuditLog') return result;

            // 🚀 CORRIGIDO: Usamos o cliente base salvo externamente para evitar o 'undefined'
            (baseClient as any).auditLog.create({
              data: {
                action: 'CREATE',
                module: model.toUpperCase(),
                entityId: (result as any).id ? String((result as any).id) : null,
                newData: result as any, // Salva o JSON do objeto criado
                userId: (args.data as any).userId || null,
              },
            }).catch((err: any) => console.error('Erro ao gravar AuditLog automático:', err));

            return result;
          },

          // Captura qualquer operação de atualização
          async update({ model, args, query }) {
            const isSoftDelete = args.data && (args.data as any).deletedAt !== undefined;
            const actionType = isSoftDelete ? 'DELETE' : 'UPDATE';

            const result = await query(args);

            if (model === 'AuditLog') return result;

            // 🚀 CORRIGIDO: Usamos o cliente base salvo externamente
            (baseClient as any).auditLog.create({
              data: {
                action: actionType,
                module: model.toUpperCase(),
                entityId: (result as any).id ? String((result as any).id) : null,
                newData: result as any,
              },
            }).catch((err: any) => console.error('Erro ao gravar AuditLog automático:', err));

            return result;
          },
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexão com o banco estabelecida.');
    } catch (err) {
      this.logger.error('Falha ao conectar no banco:', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
EOF

cat << 'EOF' > src/database/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
EOF



#########################################
# 🚀 main.ts
#########################################
cat << 'EOF' > src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('API Moderna NestJS')
    .setDescription('Arquitetura Moderna com Auto-DB Create')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
EOF

# # Ajuste do nest-cli.json para incluir assets gerados
# cat << 'EOF' > nest-cli.json
# {
#   "collection": "@nestjs/schematics",
#   "sourceRoot": "src",
#   "compilerOptions": {
#     "deleteOutDir": true,
#     "assets": [
#       { "include": "generated/**/*", "watchAssets": true }
#     ]
#   }
# }
# EOF

# Ajuste do tsconfig.json para suportar paths e módulos ES2023
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}
EOF

# # Ajuste do prisma.config.js para usar dotenv e env()
# echo "ajustando prisma.config.js para usar dotenv e env()..."
# cat << 'EOF' > prisma.config.js
# import "dotenv/config";
# import { defineConfig, env } from "prisma/config";

# export default defineConfig({
#   schema: "prisma/schema.prisma",
#   migrations: {
#     path: "prisma/migrations",
#   },
#   datasource: {
#     url: env("DATABASE_URL"),
#   },
# });
# EOF

cat << 'EOF' > prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

///////////////////////////////////////////////////////////
// AUTH / USERS
///////////////////////////////////////////////////////////

model User {
  id               String            @id @default(uuid())

  email            String            @unique
  password         String

  name             String?

  role             Role              @default(USER)

  departamento     String?

  ultimoLogin      DateTime?

  ativo            Boolean           @default(true)

  sessions         Session[]
  auditLogs        AuditLog[]

  ativos           Ativo[]

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  deletedAt        DateTime?

  @@index([email])
  @@index([role])
}

model Session {
  id               String            @id @default(uuid())

  refreshToken     String            @unique

  userId           String

  user             User              @relation(fields: [userId],references: [id],onDelete: Cascade)

  userAgent        String?
  ip               String?

  revoked          Boolean           @default(false)

  expiresAt        DateTime

  createdAt        DateTime          @default(now())

  @@index([userId])
}

model AuditLog {
  id               String            @id @default(uuid())

  action           String

  module           String?

  entityId         String?

  oldData          Json?
  newData          Json?

  userId           String?

  user             User?             @relation(fields: [userId],references: [id],onDelete: SetNull)

  ip               String?

  createdAt        DateTime          @default(now())

  @@index([userId])
  @@index([module])
}

///////////////////////////////////////////////////////////
// RACKS
///////////////////////////////////////////////////////////

model Rack {
  id               String            @id @default(uuid())

  nome             String            @unique

  localizacao      String?

  corredor         String?

  capacidade       Int               @default(42)

  observacoes      String?           @db.Text

  ativos           Ativo[]           @relation("RackAtivos")

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  deletedAt        DateTime?

  @@index([nome])
}

///////////////////////////////////////////////////////////
// INVENTÁRIO
///////////////////////////////////////////////////////////

model Ativo {
  id                    Int                  @id @default(autoincrement())

  patrimonio            String?

  tipo                  AtivoTipo           @default(LAPTOP)

  fabricante            String?
  hardware              String?
  modelo                String?

  serial                String?             @unique

  hostname              String?             @unique

  apelido               String?

  descricao             String?             @db.Text

  tag                   String?

  ipPrincipal           String?

  sistemaOperacional    String?

  versaoSO              String?

  cpu                   String?

  nucleosCPU            Int?

  threadsCPU            Int?

  ram                   String?

  armazenamento         String?

  gpu                   String?

  macAddress            String?

  status                AtivoStatus         @default(DISPONIVEL)

  powerState            PowerState?

  criticidade           Criticidade         @default(MEDIA)

  emUso                 Boolean             @default(true)

  monitorado            Boolean             @default(true)

  dataCompra            DateTime?

  garantiaFim           DateTime?

  valor                 Decimal?            @db.Decimal(10, 2)

  fornecedor            String?

  observacoes           String?             @db.Text

  /////////////////////////////////////////////////////////
  // VIRTUALIZAÇÃO
  /////////////////////////////////////////////////////////

  isVirtualizado        Boolean             @default(false)

  hypervisor            HypervisorTipo?

  vmId                  String?

  cluster               String?

  datacenter            String?

  hostFisicoId          Int?

  host                  Ativo?              @relation("HostVms",fields: [hostFisicoId],references: [id],onDelete: SetNull)

  vms                   Ativo[]             @relation("HostVms")

  /////////////////////////////////////////////////////////
  // REDE
  /////////////////////////////////////////////////////////

  configsRede           ConfigRede[]

  /////////////////////////////////////////////////////////
  // USUÁRIO
  /////////////////////////////////////////////////////////

  userId                String?

  user                  User?               @relation(fields: [userId],references: [id],onDelete: SetNull)

  /////////////////////////////////////////////////////////
  // RACK
  /////////////////////////////////////////////////////////

  rackId                String?

  rack                  Rack?               @relation("RackAtivos",fields: [rackId],references: [id],onDelete: SetNull)

  posicaoRack           Int?

  tamanhoU              Int?

  /////////////////////////////////////////////////////////
  // APLICAÇÕES
  /////////////////////////////////////////////////////////

  aplicacoes            Aplicacao[]         @relation("AppServidores")

  /////////////////////////////////////////////////////////
  // GLPI
  /////////////////////////////////////////////////////////

  glpiId                Int?

  glpiLastSync          DateTime?

  /////////////////////////////////////////////////////////
  // TIMESTAMPS
  /////////////////////////////////////////////////////////

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  deletedAt             DateTime?

  /////////////////////////////////////////////////////////
  // INDEXES
  /////////////////////////////////////////////////////////

  @@index([hostname])
  @@index([serial])
  @@index([tipo])
  @@index([status])
  @@index([powerState])
  @@index([rackId])
  @@index([hostFisicoId])
  @@index([userId])
  @@index([glpiId])
}

///////////////////////////////////////////////////////////
// REDE
///////////////////////////////////////////////////////////

model ConfigRede {
  id                    Int                 @id @default(autoincrement())

  ipAddress             String?

  macAddress            String?             @unique

  gateway               String?

  mascara               String?

  dns                   String?

  vlan                  Int?

  interface             String?

  velocidade            String?

  portasUTP             Int?

  portasFibra           Int?

  storageConectado      String?

  discoStorage          String?

  ativoId               Int

  ativo                 Ativo               @relation(fields: [ativoId],references: [id],onDelete: Cascade)

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@index([ipAddress])
  @@index([ativoId])
}

///////////////////////////////////////////////////////////
// APLICAÇÕES
///////////////////////////////////////////////////////////

model Aplicacao {
  id                    Int                 @id @default(autoincrement())

  nome                  String

  sigla                 String?             @unique

  descricao             String?             @db.Text

  categoria             SistemaCategoria    @default(OPERACIONAL)

  criticidade           Criticidade         @default(MEDIA)

  businessOwner         String?

  responsavelTecnico    String?

  contatoFuncional      String?

  fornecedor            String?

  url                   String?

  repositorio           String?

  documentacao          String?

  janelaOperacao        String?

  backupInfo            String?

  procedimentoRecup     String?             @db.Text

  pontoUnicoFalha       String?             @db.Text

  tecnologiaPrincipal   String?

  databaseInfo          String?

  integracoes           String?             @db.Text

  servidores            Ativo[]             @relation("AppServidores")

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  deletedAt             DateTime?

  @@index([nome])
  @@index([categoria])
}

///////////////////////////////////////////////////////////
// ENUMS
///////////////////////////////////////////////////////////

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
  SUPER_USER
  MANAGER
}

enum AtivoTipo {
  LAPTOP
  DESKTOP
  SERVIDOR_FISICO
  SERVIDOR_VIRTUAL
  SWITCH
  ROTEADOR
  STORAGE
  FIREWALL
  ACCESS_POINT
  IMPRESSORA
  MONITOR
  NOBREAK
}

enum AtivoStatus {
  DISPONIVEL
  EM_USO
  MANUTENCAO
  DESCARTADO
}

enum PowerState {
  ON
  OFF
  SUSPENDED
  PAUSED
}

enum SistemaCategoria {
  ADMINISTRATIVO
  OPERACIONAL
  MONITORAMENTO
  DEVOPS
  SEGURANCA
}

enum Criticidade {
  BAIXA
  MEDIA
  ALTA
  CRITICA
}

enum HypervisorTipo {
  VMWARE
  HYPERV
  PROXMOX
  KVM
  XEN
}
EOF



# 6. Finalização
log "⚙️ Executando criação de banco..."
npm run db:create
npx prisma generate

log "✅ Ambiente pronto! Execute 'npm run start:dev' para começar."
echo -e "\n${BLUE}✅ TUDO PRONTO!${NC}"