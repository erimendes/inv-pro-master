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
log "📘 Turbinando Swagger e Módulos de Autenticação em: $(pwd)"

log "📁 Criando estrutura de módulos..."
mkdir -p src/modules/users/dto src/modules/auth/dto src/modules/auth/guards src/modules/auth/strategies
mkdir -p src/config/env
log "📁 Configurando User DTOs..."

DTO_PATH="src/modules/users/dto/create-user.dto.ts"

cat << 'EOF' > src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../generated/prisma/client'; 

export class CreateUserDto {
  @ApiProperty({ example: 'teste01@teste.com' }) 
  @IsEmail() 
  email!: string;

  @ApiProperty({ example: '123456' }) 
  @IsString()
  @IsNotEmpty()
  @MinLength(6) 
  password!: string;

  @ApiProperty({ example: 'João Silva' })
  @IsOptional() 
  @IsString() 
  name?: string;

  @ApiProperty({ 
    enum: Role, 
    example: Role.ADMIN,
    description: 'Nível de acesso do usuário' 
  })
  @IsOptional()
  @IsEnum(Role, { 
    message: 'A role deve ser um dos valores válidos do enum Role' 
  })
  role?: Role;
}
EOF

cat << 'EOF' > src/modules/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'joao.silva@exemplo.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'novaSenha123', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'João Silva Atualizado', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
EOF

mkdir -p src/modules/users/dto
cat << 'EOF' > src/modules/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'usuario@exemplo.com' })
  email: string;

  @ApiProperty({ example: 'João Silva', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty()
  createdAt: Date;
}
EOF

cat << 'EOF' > src/modules/users/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // =========================================
  // CREATE
  // =========================================
  async create(data: CreateUserDto) {
    // 🚀 Ajustado para .client
    const userExists = await this.prisma.client.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashedPassword = await argon2.hash(data.password);

    // 🚀 Ajustado para .client -> Vai criar o Log de Auditoria AUTOMATICAMENTE
    return this.prisma.client.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // =========================================
  // FIND ALL
  // =========================================
  async findAll() {
    // Queries de leitura podem usar o cliente padrão ou o .client (indiferente)
    return this.prisma.client.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // =========================================
  // FIND ONE
  // =========================================
  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // =========================================
  // FIND BY EMAIL
  // =========================================
  async findByEmail(email: string) {
    // Importante para a validação interna do AuthService
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  // =========================================
  // UPDATE
  // =========================================
  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // EMAIL JÁ EXISTE
    if (data.email && data.email !== user.email) {
      const emailExists = await this.prisma.client.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (emailExists) {
        throw new ConflictException('E-mail já está em uso');
      }
    }

    // HASH PASSWORD
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    // 🚀 Ajustado para .client -> Vai atualizar e disparar o Log de alteração AUTOMATICAMENTE
    return this.prisma.client.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // =========================================
  // DELETE
  // =========================================
  async remove(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 🚀 Ajustado para .client -> Se o seu interceptor ler o delete ou update do softdelete, ele pegará aqui
    await this.prisma.client.user.delete({
      where: { id },
    });

    return {
      message: 'Usuário removido com sucesso',
    };
  }
}
EOF

cat << 'EOF' > src/modules/users/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../../generated/prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UserController {
  constructor(
    private readonly service: UserService,
  ) {}

  // =========================================
  // CREATE
  // =========================================
  @Post()
  @ApiOperation({
    summary:
      'Provisionar novo usuário (Admin)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuário criado com sucesso',
  })
  create(
    @Body() body: CreateUserDto,
  ) {
    return this.service.create(body);
  }

  // =========================================
  // LIST
  // =========================================
  @Get()
  @ApiOperation({
    summary:
      'Listar todos os usuários',
  })
  findAll() {
    return this.service.findAll();
  }

  // =========================================
  // DETAILS
  // =========================================
  @Get(':id')
  @ApiOperation({
    summary:
      'Buscar usuário por ID',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.service.findOne(id);
  }

  // =========================================
  // UPDATE USER
  // =========================================
  @Patch(':id')
  @ApiOperation({
    summary:
      'Atualizar usuário por ID',
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.service.update(
      id,
      body,
    );
  }

  // =========================================
  // UPDATE ME
  // =========================================
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Atualizar meu próprio perfil',
  })
  updateMe(
    @Req() req: any,
    @Body() body: UpdateUserDto,
  ) {
    const userId =
      req.user.sub ||
      req.user.userId;

    return this.service.update(
      userId,
      body,
    );
  }

  // =========================================
  // DELETE
  // =========================================
  @Delete(':id')
  @ApiOperation({
    summary:
      'Deletar usuário',
  })
  remove(
    @Param('id') id: string,
  ) {
    return this.service.remove(id);
  }
}
EOF

cat << 'EOF' > src/modules/users/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
EOF



#########################################
# 🏗️ AppModule
#########################################
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/env/configuration';
import { validationSchema } from './config/env/validation.schema';
import { PrismaModule } from './database/prisma.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';

// import { SyncModule } from './modules/sync/sync.module';
// import { AdminModule } from './modules/admin/admin.module';
// import { HardwareModule } from './modules/hardware/hardware.module';
// import { ApplicationsModule } from './modules/applications/applications.module'

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
    AuthModule,
    UserModule,
    // HardwareModule,
    // SyncModule,
    // AdminModule,
    // ApplicationsModule,
  ],
})
export class AppModule {}
EOF

#########################################
# 📄 DTOs DE AUTH (Register, Login, Response)
#########################################

mkdir -p src/modules/auth/dto

cat << 'EOF' > src/modules/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'teste01@teste.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}
EOF

cat << 'EOF' > src/modules/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}
EOF

echo -e "${GREEN}👉 Passo 5: Criando DTO para Refresh Token...${NC}"
cat << 'EOF' > src/modules/auth/dto/refresh-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1Ni...', 
    description: 'O refresh token recebido no login' 
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
EOF

#########################################
# 🎮 AUTH CONTROLLER (Caminhos Corrigidos)
#########################################

echo -e "${GREEN}👉 Passo 4: Configurando Controller...${NC}"
cat << 'EOF' > src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto, @Req() req: any) {
    return this.auth.login(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout da sessão atual' })
  logout(@Req() req: any) {
    return this.auth.logout(req.user.sessionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @ApiOperation({ summary: 'Logout de todos dispositivos' })
  logoutAll(@Req() req: any) {
    return this.auth.logoutAll(req.user.userId);
  }
}
EOF


#########################################
# 🔐 USER CONTROLLER (Protegido e Documentado)
#########################################

# Garante que o guard exista
mkdir -p src/modules/auth/guards
cat << 'EOF' > src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
EOF

#########################################
# 🔐 AUTH SERVICE (Lógica de Login)
#########################################

log "🔑 Criando AuthService..."
#########################################
# PASSO 3: LÓGICA DE NEGÓCIO (SERVICE)
#########################################
echo -e "${GREEN}👉 Passo 3: Configurando AuthService (Argon2 + Sessions)...${NC}"

cat << 'EOF' > src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../../../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private prisma: PrismaService, // Injeta o seu serviço
    private jwt: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    // O UserService cria o usuário (Certifique-se que o UserService também use o this.prisma.client.user.create)
    const user = await this.users.create(dto);

    // 🚀 Mudamos para .client para passar pelo fluxo de log automático
    const session = await this.prisma.client.session.create({
      data: {
        userId: user.id,
        refreshToken: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const tokens = await this.generateTokens(user, session.id);
    const hashedRt = await argon2.hash(tokens.refreshToken);

    await this.prisma.client.session.update({
      where: { id: session.id },
      data: { refreshToken: hashedRt },
    });

    return {
      ...tokens,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async login(data: any, meta: { ip?: string; userAgent?: string }) {
    const user = await this.users.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await argon2.verify(user.password, data.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const session = await this.prisma.client.session.create({
      data: {
        userId: user.id,
        refreshToken: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ip: meta.ip || null,
        userAgent: meta.userAgent || null,
      },
    });

    const tokens = await this.generateTokens(user, session.id);
    const hashedRt = await argon2.hash(tokens.refreshToken);

    await this.prisma.client.session.update({
      where: { id: session.id },
      data: { refreshToken: hashedRt },
    });

    return {
      ...tokens,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const sessions = await this.prisma.client.session.findMany({
        where: { userId: payload.sub, revoked: false },
      });

      for (const session of sessions) {
        const valid = await argon2.verify(session.refreshToken, refreshToken);

        if (valid) {
          const user = await this.users.findByEmail(payload.email);
          if (!user) throw new UnauthorizedException();

          await this.prisma.client.session.update({
            where: { id: session.id },
            data: { revoked: true },
          });

          const newSession = await this.prisma.client.session.create({
            data: {
              userId: user.id,
              refreshToken: '',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });

          const tokens = await this.generateTokens(user, newSession.id);
          const hashedRt = await argon2.hash(tokens.refreshToken);

          await this.prisma.client.session.update({
            where: { id: newSession.id },
            data: { refreshToken: hashedRt },
          });

          return tokens;
        }
      }

      throw new UnauthorizedException('Sessão inválida');
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async logout(sessionId: string) {
    await this.prisma.client.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    });

    return { message: 'Logout realizado com sucesso' };
  }

  // ⚠️ CORRIGIDO: Alterado de 'number' para 'string' para bater com o UUID do banco
  async logoutAll(userId: string) {
    await this.prisma.client.session.updateMany({
      where: { 
        userId: userId, 
        revoked: false 
      },
      data: { revoked: true },
    });

    return { message: 'Logout de todos os dispositivos realizado' };
  }

  private async generateTokens(user: any, sessionId: string | null) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { expiresIn: '15m' }),
      this.jwt.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
EOF

#########################################
# 🛡️ JWT STRATEGY (Validação do Token)
#########################################

log "🛡️ Criando JwtStrategy..."

mkdir -p src/modules/auth/strategies

cat << 'EOF' > src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET não definido no .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
EOF

#########################################
# 📦 AUTH MODULE (Conectando tudo)
#########################################

log "📦 Atualizando AuthModule..."

cat << 'EOF' > src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      global: true,
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
export * from './auth.service';
export * from './auth.controller';
export * from './strategies/jwt.strategy';
EOF

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
# 🚀 MAIN.TS (Persistência e Swagger UI)
#########################################

cat << 'EOF' > src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- AJUSTE 1: Habilitar o CORS (Obrigatório para o React conseguir conectar) ---
  // Isso permite que o frontend na porta 5173 acesse a API na porta 3000
  app.enableCors({
    origin: '*', // Em produção, mude para o domínio real do seu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('API Moderna NestJS')
    .setDescription('NestJS + Prisma (Custom Output) + JWT Auth')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Insira o token JWT',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
EOF

mkdir -p src/common/guards
mkdir -p src/common/decorators

cat << 'EOF' > src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populado pelo JwtStrategy

    if (!user || !user.role) {
      throw new ForbiddenException('Acesso negado: Perfil de usuário não identificado');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado: Requer nível ${requiredRoles.join(' ou ')}`
      );
    }

    return true;
  }
}
EOF

cat << 'EOF' > src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
EOF
