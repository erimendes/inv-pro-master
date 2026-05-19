#!/usr/bin/env bash

set -Eeuo pipefail

# ==============================================================================
# COLORS
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ==============================================================================
# HELPERS
# ==============================================================================

log() {
  echo -e "${BLUE}➜${NC} $1"
}

success() {
  echo -e "${GREEN}✔${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✖${NC} $1"
}

trap 'error "Erro fatal disparado na linha $LINENO do script"' ERR

# ==============================================================================
# VALIDATE DEPENDENCIES
# ==============================================================================

check_dependencies() {
  local deps=("node" "npm" "npx")

  for dep in "${deps[@]}"; do
    if ! command -v "$dep" &>/dev/null; then
      error "$dep não foi encontrado no sistema. Por favor, instale-o antes de continuar."
      exit 1
    fi
  done

  success "Dependências do sistema OK"
}

# ==============================================================================
# CREATE STRUCTURE
# ==============================================================================

create_structure() {
  mkdir -p src/config
  mkdir -p src/shared/errors
  mkdir -p src/shared/utils
  mkdir -p src/shared/lib
  mkdir -p src/shared/infra/http/middlewares

  local modules=("assets" "applications" "users")

  for module in "${modules[@]}"; do
    mkdir -p "src/modules/${module}/core/entities"
    mkdir -p "src/modules/${module}/core/services"
    mkdir -p "src/modules/${module}/core/use-cases"
    mkdir -p "src/modules/${module}/infra/database/repositories"
    mkdir -p "src/modules/${module}/infra/http/controllers"
    mkdir -p "src/modules/${module}/infra/http/dtos"
  done

  mkdir -p tests/unit
  mkdir -p tests/integration

  success "Estrutura de pastas modular criada"
}

# ==============================================================================
# INIT PROJECT
# ==============================================================================

init_project() {
  npm init -y >/dev/null 2>&1
  success "Package.json inicializado"
}

# ==============================================================================
# INSTALL DEPENDENCIES (Atualizado com os drivers exigidos pelo Prisma 7)
# ==============================================================================

install_dependencies() {
  log "Instalando dependências de produção do ecossistema Fastify e Prisma 7..."

  npm install \
    fastify \
    zod \
    dotenv \
    @prisma/client \
    @prisma/adapter-pg \
    pg \
    bcryptjs \
    @fastify/jwt \
    @fastify/helmet \
    @fastify/rate-limit \
    @fastify/swagger \
    @fastify/swagger-ui \
    zod-to-json-schema \
    fastify-type-provider-zod

  log "Instalando ferramentas de desenvolvimento (TypeScript, Drivers, Testes)..."

  npm install -D \
    typescript \
    tsx \
    prisma \
    @types/node \
    @types/pg \
    @types/bcryptjs \
    eslint \
    prettier \
    vitest \
    tsup \
    husky \
    lint-staged \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin

  success "Todas as dependências foram instaladas"
}

# ==============================================================================
# CONFIG TSCONFIG (Modificado para ESM moderno)
# ==============================================================================

create_tsconfig() {
cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
EOF
  success "tsconfig.json configurado"
}

# ==============================================================================
# PACKAGE.JSON SCRIPTS
# ==============================================================================

configure_package_json() {
node <<EOF
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json'));

pkg.type = "module"; // Habilita suporte nativo a ES Modules (import/export)

pkg.scripts = {
  dev: 'tsx watch src/server.ts',
  build: 'tsup src --format esm --dts',
  start: 'node dist/server.js',
  test: 'vitest run',
  lint: 'eslint . --ext .ts',
  format: 'prettier --write .',
  prisma: 'prisma'
};

pkg['lint-staged'] = {
  '*.ts': ['eslint --fix', 'prettier --write']
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
EOF
  success "package.json customizado com os scripts de automação"
}

# ==============================================================================
# CREATE ENV
# ==============================================================================

create_env() {
cat > .env <<EOF
PORT=3333
JWT_SECRET="supersecret_development_key_change_in_production"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
EOF

cat > .env.example <<EOF
PORT=3333
JWT_SECRET=your_secret_key
DATABASE_URL="postgresql://username:password@localhost:5432/database?schema=public"
EOF
  success "Arquivos de ambiente .env criados"
}

# ==============================================================================
# CREATE GITIGNORE
# ==============================================================================

create_gitignore() {
cat > .gitignore <<EOF
node_modules
dist
.env
coverage
*.log
EOF
}

# ==============================================================================
# CREATE PRISMA (Atualizado conforme sua nova especificação Prisma 7)
# ==============================================================================

create_prisma() {
#   npx prisma init >/dev/null 2>&1 || true
npx prisma init --output ../src/generated/prisma

cat > prisma/schema.prisma <<EOF
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// 🔴 1. Criamos a lista de permissões válidas no banco
enum Role {
  USER
  ADMIN
  MANAGER
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER) // 🔴 2. Adicionamos a coluna com valor padrão USER
  createdAt DateTime @default(now())
}
EOF

  success "Esquema base e arquivo prisma.config.ts do Prisma 7 configurados"
}

# ==============================================================================
# CREATE APPERROR
# ==============================================================================

create_app_error() {
cat > src/shared/errors/AppError.ts <<EOF
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
EOF
}

# ==============================================================================
# CREATE ENV VALIDATION
# ==============================================================================

create_env_validator() {
cat > src/config/env.ts <<EOF
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string()
});

export const env = envSchema.parse(process.env);
EOF
}

# ==============================================================================
# CREATE PRISMA CLIENT (Atualizado com a propriedade datasourceUrl do Prisma 7)
# ==============================================================================

create_prisma_client() {
cat > src/shared/lib/prisma.ts <<EOF
import 'dotenv/config';

import { Pool } from 'pg';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/client.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter
});
EOF
}

# ==============================================================================
# CREATE MIDDLEWARES
# ==============================================================================

create_middlewares() {
cat > src/shared/infra/http/middlewares/verify-jwt.ts <<EOF
import { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyJWT(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      message: 'Unauthorized'
    });
  }
}
EOF
}

# ==============================================================================
# CREATE USER ENTITY
# ==============================================================================

create_user_entity() {
cat > src/modules/users/core/entities/User.ts <<EOF
export class User {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  createdAt!: Date;
}
EOF
}

# ==============================================================================
# CREATE CREATE USER SERVICE (Ajustado import do Prisma Client do diretório customizado)
# ==============================================================================
create_user_service() {
cat > src/modules/users/core/services/CreateUserService.ts <<EOF
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../shared/lib/prisma.js';
import { Role } from '../../../../generated/prisma/client.js';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: Role; // 👈 Precisa estar aqui
}

export class CreateUserService {
  async execute(data: CreateUserRequest) {
    const passwordHash = await bcrypt.hash(data.password, 6);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: data.role // 🔴 ESSA LINHA É CRUCIAL. Se ela esquecer de passar data.role, o Prisma usa o default(USER)
      }
    });

    return { user };
  }
}
EOF

cat > src/modules/users/core/services/ListUsersService.ts <<EOF
import { prisma } from '../../../../shared/lib/prisma.js';

export class ListUsersService {
  async execute() {
    // Busca todos os usuários, mas omite o campo 'password' por segurança
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return users;
  }
}
EOF
}

# ==============================================================================
# CREATE AUTHENTICATE USER
# ==============================================================================

create_auth_usecase() {
cat > src/modules/users/core/use-cases/AuthenticateUser.ts <<EOF
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../shared/lib/prisma.js';
import { AppError } from '../../../../shared/errors/AppError.js';

interface AuthenticateRequest {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  async execute(data: AuthenticateRequest) {
    // 1. Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    // 2. Segurança: Se não achar, joga erro genérico para evitar dar pistas a hackers
    if (!user) {
      throw new AppError('Invalid credentials', 400);
    }

    // 3. Compara a senha digitada com o hash do banco
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 400);
    }

    // 4. Retorna o usuário validado (o token será gerado no controller pelo Fastify)
    return { user };
  }
}
EOF
}

# ==============================================================================
# CREATE AUTH CONTROLLER
# ==============================================================================
create_auth_controller() {
cat > src/modules/users/infra/http/controllers/AuthController.ts <<EOF
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticateUserUseCase } from '../../../core/use-cases/AuthenticateUser.js';

export class AuthController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as any;

    const authenticateUser = new AuthenticateUserUseCase();
    const { user } = await authenticateUser.execute({ email, password });

    // Gera o token JWT nativo do Fastify usando o ID do usuário como 'sub'
    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
          expiresIn: '1d' // Token expira em 1 dia
        }
      }
    );

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  }
}
EOF
}

# ==============================================================================
# CREATE USER CONTROLLER
# ==============================================================================

create_user_controller() {
cat > src/modules/users/infra/http/controllers/UserController.ts <<EOF
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserService } from '../../../core/services/CreateUserService.js';
import { ListUsersService } from '../../../core/services/ListUsersService.js';

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    // 🔴 Certifique-se de pegar o corpo completo da requisição
    const body = request.body as any;
    
    const service = new CreateUserService();
    
    // Passamos o 'body' inteiro (que agora inclui o campo role)
    const result = await service.execute(body);

    return reply.status(201).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const service = new ListUsersService();
    const users = await service.execute();
    
    return reply.send(users);
  }
}
EOF
}

# ==============================================================================
# CREATE USER ROUTES
# ==============================================================================

create_user_routes() {
cat > src/modules/users/infra/http/users.routes.ts <<EOF
import { FastifyInstance } from 'fastify';
import { UserController } from './controllers/UserController.js';
import { AuthController } from './controllers/AuthController.js';

const controller = new UserController();
const authController = new AuthController();

export async function usersRoutes(app: FastifyInstance) {
  
  const createUserSchema = {
    description: 'Cadastro de um novo usuário na plataforma',
    tags: ['users'],
    body: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', description: 'Nome completo', examples: ['João Silva'] },
        email: { type: 'string', format: 'email', description: 'E-mail', examples: ['joao@empresa.com'] },
        password: { type: 'string', minLength: 6, description: 'Senha', examples: ['senha123'] },
        role: { 
          type: 'string', 
          enum: ['USER', 'ADMIN', 'MANAGER'], // 🔴 Restringe os valores aceitos na API
          description: 'Papel do usuário no sistema (Padrão: USER)',
          examples: ['ADMIN'] 
        }
      }
    },
    response: {
      201: {
        description: 'Usuário criado com sucesso',
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' } // 🔴 Retorna a role no JSON de resposta
            }
          }
        }
      }
    }
  };

  app.post('/', { schema: createUserSchema }, controller.create);
  app.get('/', controller.list);
  app.post('/login', authController.handle); 
}
EOF
}

# ==============================================================================
# CREATE ASSET ROUTES
# ==============================================================================

create_asset_routes() {
cat > src/modules/assets/infra/http/assets.routes.ts <<EOF
import { FastifyInstance } from 'fastify';

export async function assetsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return [{ id: '1', name: 'Dell PowerEdge R750' }];
  });
}
EOF
}

# ==============================================================================
# CREATE APPLICATION ROUTES
# ==============================================================================

create_application_routes() {
cat > src/modules/applications/infra/http/apps.routes.ts <<EOF
import { FastifyInstance } from 'fastify';

export async function appsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return [{ id: '1', name: 'ERP Core Application' }];
  });
}
EOF
}

# ==============================================================================
# CREATE CENTRAL ROUTES
# ==============================================================================

create_routes() {
cat > src/shared/infra/http/routes.ts <<EOF
import { FastifyInstance } from 'fastify';
import { usersRoutes } from '../../../modules/users/infra/http/users.routes.js';
import { assetsRoutes } from '../../../modules/assets/infra/http/assets.routes.js';
import { appsRoutes } from '../../../modules/applications/infra/http/apps.routes.js';

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: '/users' });
  app.register(assetsRoutes, { prefix: '/assets' });
  app.register(appsRoutes, { prefix: '/applications' });
}
EOF
}

# ==============================================================================
# CREATE SERVER
# ==============================================================================

create_server() {
cat > src/server.ts <<EOF
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';

import { validatorCompiler, serializerCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';

import { env } from './config/env.js';
import { appRoutes } from './shared/infra/http/routes.js';
import { AppError } from './shared/errors/AppError.js';

const app = fastify({
  logger: true
});

app.register(helmet);

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

app.register(jwt, {
  secret: env.JWT_SECRET
});

app.register(swagger, {
  swagger: {
    info: {
      title: 'Enterprise Architecture API',
      version: '1.0.0'
    }
  }
});

app.register(swaggerUI, {
  routePrefix: '/docs'
});

app.get('/', async () => {
  return {
    status: 'ok',
    message: 'Enterprise API Running 🚀'
  };
});

app.get('/health', async () => {
  return {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
});

app.register(appRoutes);

app.setErrorHandler((error, request, reply) => {

  console.error("🚨 ERRO DETECTADO CAPTURADO:", error);

  if (error instanceof AppError) {

    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message
    });

  }

  request.log.error(error);

  return reply.status(500).send({
    status: 'error',
    error: 'Internal Server Error'
  });

});

const start = async () => {

  try {

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0'
    });

    console.log(
      
    );

  } catch (err) {

    app.log.error(err);

    process.exit(1);

  }

};

start();
EOF
}

# ==============================================================================
# DOCKER
# ==============================================================================

create_docker() {
cat > Dockerfile <<EOF
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./

EXPOSE 3333
CMD ["npm", "run", "start"]
EOF

cat > docker-compose.yml <<EOF
services:
  postgres:
    image: postgres:16-alpine
    container_name: enterprise-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    container_name: enterprise-api
    ports:
      - "3333:3333"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/app?schema=public"

volumes:
  pgdata:
EOF
}

# ==============================================================================
# ESLINT
# ==============================================================================

create_eslint() {
cat > .eslintrc.json <<EOF
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off"
  }
}
EOF
}

# ==============================================================================
# PRETTIER
# ==============================================================================

create_prettier() {
cat > .prettierrc <<EOF
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
EOF
}

# ==============================================================================
# GITHUB ACTIONS
# ==============================================================================

create_github_actions() {
  mkdir -p .github/workflows

cat > .github/workflows/ci.yml <<EOF
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: app
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma Migrations / Generate
        run: npx prisma generate
        env:
          DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/app?schema=public"

      - name: Run Linter
        run: npm run lint

      - name: Build project
        run: npm run build
EOF
}

# ==============================================================================
# HUSKY
# ==============================================================================

setup_husky() {
  npx husky init >/dev/null 2>&1 || true
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
  check_dependencies
  create_structure
  init_project
  install_dependencies
  create_tsconfig
  configure_package_json
  create_env
  create_gitignore
  create_prisma
  create_app_error
  create_env_validator
  create_user_service
  create_prisma_client
  create_middlewares
  create_user_entity
  # create_user_usecase
  create_auth_usecase
  create_auth_controller
  create_user_controller
  create_user_routes
  create_asset_routes
  create_application_routes
  create_routes
  create_server
  create_docker
  create_eslint
  create_prettier
  create_github_actions
  setup_husky

  success "Projeto Enterprise escalável gerado com absoluto sucesso! 🚀"
  echo ""
  echo "Próximos passos para rodar:"
  echo "---------------------------"
  echo "1. Ative o banco de dados local:"
  echo "   docker compose up -d postgres"
  echo ""
  echo "2. Execute o client generator do Prisma:"
  echo "   npx prisma generate"
  echo ""
  echo "3. Inicie o servidor em modo watch (desenvolvimento):"
  echo "   npm run dev"
  echo "---------------------------"
  echo ""
}

main
