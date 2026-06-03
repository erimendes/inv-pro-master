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

# 3. ldap.service.ts
npm install ldapts

cat << EOF > src/modules/auth/ldap.service.ts
import { Injectable } from '@nestjs/common';
import { Client } from 'ldapts';

@Injectable()
export class LdapService {
  async authenticate(
    username: string,
    password: string,
  ) {
    const client = new Client({
      url: process.env.LDAP_URL!,
    });

    try {
      await client.bind(
        `${username}@empresa.local`,
        password,
      );

      const { searchEntries } =
        await client.search(
          process.env.LDAP_BASE_DN!,
          {
            scope: 'sub',
            filter: `(sAMAccountName=${username})`,
          },
        );

      await client.unbind();

      return searchEntries[0] ?? null;
    } catch {
      return null;
    }
  }
}
EOF

# 4. auth.module.ts
cat << EOF > src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LdapService } from './ldap.service';

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
  providers: [AuthService, JwtStrategy, LdapService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
export * from './auth.service';
export * from './auth.controller';
export * from './strategies/jwt.strategy';
EOF

# 5. auth.service.ts
cat << EOF > src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../../../generated/prisma/client';
import { LdapService } from './ldap.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private prisma: PrismaService, // Injeta o seu serviço
    private jwt: JwtService,
    private ldapService: LdapService,
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

  async login(
    data: any,
    meta: {
      ip?: string;
      userAgent?: string;
    },
  ) {
    const username =
      data.username ||
      data.email?.split('@')[0];

    //
    // 1 - TENTA ACTIVE DIRECTORY
    //
    const adUser =
      await this.ldapService.authenticate(
        username,
        data.password,
      );

    let user;

    if (adUser) {
      user =
        await this.prisma.client.user.findUnique({
          where: {
            username,
          },
        });

      if (!user) {
        user =
          await this.prisma.client.user.create({
            data: {
              username,
              email:
                String(adUser.mail || ''),
              name:
                String(
                  adUser.displayName || username,
                ),
              role: 'USER',
              authProvider: 'AD',
              ativo: true,
            },
          });
      }
    } else {
      //
      // 2 - TENTA USUÁRIO LOCAL
      //
      user =
        await this.prisma.client.user.findUnique({
          where: {
            username,
          },
        });

      if (!user) {
        throw new UnauthorizedException(
          'Credenciais inválidas',
        );
      }

      if (
        user.authProvider !== 'LOCAL'
      ) {
        throw new UnauthorizedException(
          'Credenciais inválidas',
        );
      }

      const valid =
        await argon2.verify(
          user.password!,
          data.password,
        );

      if (!valid) {
        throw new UnauthorizedException(
          'Credenciais inválidas',
        );
      }
    }

    //
    // 3 - CRIA SESSÃO
    //
    const session =
      await this.prisma.client.session.create({
        data: {
          userId: user.id,
          refreshToken: '',
          expiresAt: new Date(
            Date.now() +
              7 * 24 * 60 * 60 * 1000,
          ),
          ip: meta.ip || null,
          userAgent:
            meta.userAgent || null,
        },
      });

    const tokens =
      await this.generateTokens(
        user,
        session.id,
      );

    const hashedRt =
      await argon2.hash(
        tokens.refreshToken,
      );

    await this.prisma.client.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshToken: hashedRt,
      },
    });

    return {
      ...tokens,
      name: user.name,
      email: user.email,
      role: user.role,
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

  private async generateTokens(
    user: any,
    sessionId: string | null,
  ) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const [accessToken, refreshToken] =
      await Promise.all([
        this.jwt.signAsync(payload, {
          expiresIn: '15m',
        }),
        this.jwt.signAsync(payload, {
          expiresIn: '7d',
        }),
      ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
EOF
