// src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LdapService } from './ldap.service';
import { LoginDto } from './dto/login.dto'; // Usando o DTO atualizado do passo anterior

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly ldapService: LdapService,
  ) {}

  async register(dto: CreateUserDto) {
    const provider = dto.authProvider || 'AD';

    if (provider === 'AD') {
      const userExistsInAd = await this.ldapService.findUser(dto.username);
      if (!userExistsInAd) {
        throw new BadRequestException(
          'Este usuário não existe no Active Directory da empresa',
        );
      }
    }

    return this.userService.create(dto);
  }

  async login(
    credentials: LoginDto,
    meta: { ip?: string; userAgent?: string },
  ) {
    const identifier = credentials.username || credentials.email;
    if (!identifier || !credentials.password) {
      throw new BadRequestException('Credenciais incompletas');
    }

    // Busca o usuário no banco local (aceita username ou email)
    const user = await this.userService.findByEmailOrUsername(identifier);

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Usuário não autorizado ou inativo');
    }

    // -----------------------------------------------------------------
    // ESTRATÉGIA DE AUTENTICAÇÃO (AD vs LOCAL)
    // -----------------------------------------------------------------
    if (user.authProvider === 'AD') {
      const adUser = await this.ldapService.authenticate(
        user.username,
        credentials.password,
      );

      if (!adUser) {
        throw new UnauthorizedException('Credenciais inválidas no Active Directory');
      }

      await this.prisma.client.user.update({
        where: { id: user.id },
        data: {
          ultimoLogin: new Date(),
          name: String(adUser.displayName || user.name || user.username),
          email: String(adUser.mail || user.email),
        },
      });
    } else if (user.authProvider === 'LOCAL') {
      if (!user.password) {
        throw new UnauthorizedException('Usuário local configurado sem senha');
      }

      const isPasswordValid = await argon2.verify(user.password, credentials.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      await this.prisma.client.user.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() },
      });
    } else {
      throw new UnauthorizedException('Provedor de autenticação inválido');
    }

    // -----------------------------------------------------------------
    // GERENCIAMENTO DE SESSÃO OTIMIZADO
    // -----------------------------------------------------------------
    // Geramos um ID UUID v4 manualmente para evitar a query dupla (Create + Update)
    const crypto = await import('crypto');
    const sessionId = crypto.randomUUID();

    const tokens = await this.generateTokens(user, sessionId);
    const hashedRt = await argon2.hash(tokens.refreshToken);

    // Salva de uma vez só no banco de dados com o Refresh Token já hasheado
    await this.prisma.client.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken: hashedRt,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ip: meta.ip || null,
        userAgent: meta.userAgent || null,
      },
    });

    return {
      ...tokens,
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
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
        const isValid = await argon2.verify(session.refreshToken, refreshToken);

        if (isValid) {
          // CORREÇÃO CRÍTICA: Buscar pelo ID do payload (sub), nunca pelo e-mail
          const user = await this.prisma.client.user.findUnique({
            where: { id: payload.sub },
          });
          
          if (!user || !user.ativo) throw new UnauthorizedException();

          // Revoga a sessão antiga (Refresh Token Rotation)
          await this.prisma.client.session.update({
            where: { id: session.id },
            data: { revoked: true },
          });

          // Cria a nova sessão otimizada sem queries duplicadas
          const crypto = await import('crypto');
          const newSessionId = crypto.randomUUID();

          const tokens = await this.generateTokens(user, newSessionId);
          const hashedRt = await argon2.hash(tokens.refreshToken);

          await this.prisma.client.session.create({
            data: {
              id: newSessionId,
              userId: user.id,
              refreshToken: hashedRt,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
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

  async logoutAll(userId: string) {
    await this.prisma.client.session.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    return { message: 'Logout de todos os dispositivos realizado' };
  }

  private async generateTokens(user: any, sessionId: string | null) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { expiresIn: '15m' }),
      this.jwt.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }
}