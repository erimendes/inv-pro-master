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

interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

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

    // Se for AD, a validação externa ainda acontece no fluxo de Auth
    if (provider === 'AD') {
      const userExistsInAd = await this.ldapService.findUser(dto.username);
      if (!userExistsInAd) {
        throw new BadRequestException(
          'Este usuário não existe no Active Directory da empresa',
        );
      }
    }

    // Delega a criação e validações locais para quem é dono da entidade User
    return this.userService.create(dto);
  }

  async login(
    credentials: LoginCredentials,
    meta: { ip?: string; userAgent?: string },
  ) {
    const identifier = credentials.username || credentials.email;
    if (!identifier || !credentials.password) {
      throw new BadRequestException('Credenciais incompletas');
    }

    const user = await this.userService.findByEmailOrUsername(identifier);

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Usuário não autorizado ou inativo');
    }

    // --- AUTENTICAÇÃO ACTIVE DIRECTORY ---
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
    }

    // --- AUTENTICAÇÃO LOCAL ---
    if (user.authProvider === 'LOCAL') {
      if (!user.password) {
        throw new UnauthorizedException('Usuário sem senha cadastrada');
      }

      const isPasswordValid = await argon2.verify(user.password, credentials.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      await this.prisma.client.user.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() },
      });
    }

    // --- CRIAÇÃO DE SESSÃO ---
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
          const user = await this.userService.findByEmailOrUsername(payload.email);
          if (!user) throw new UnauthorizedException();

          // Revoga sessão antiga e gera uma nova (Refresh Token Rotation)
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