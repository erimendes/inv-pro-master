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
import { LoginDto } from './dto/login.dto';

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

    // 1. Busca se o usuário já tem algum registro no banco local
    let user = await this.userService.findByEmailOrUsername(identifier);

    // Se o usuário existir localmente e estiver inativo, barra imediatamente
    if (user && !user.ativo) {
      throw new UnauthorizedException('Usuário inativo no sistema.');
    }

    // -----------------------------------------------------------------
    // CENÁRIO A: USUÁRIO NÃO EXISTE NO BANCO OU É DO AD
    // -----------------------------------------------------------------
    if (!user || user.authProvider === 'AD') {
      
      // Se não achou no banco, precisamos do username para mandar pro AD.
      // Caso ele tenha digitado o email no primeiro login, usamos a parte antes do @ como palpite de username,
      // ou exigimos o username puro. O ideal para o AD é o username (ex: joao.silva).
      const adUsername = user ? user.username : identifier.split('@')[0];

      // Tenta autenticar diretamente no Servidor do Active Directory
      const adUser = await this.ldapService.authenticate(
        adUsername,
        credentials.password,
      );

      // Se o AD rejeitar as credenciais
      if (!adUser) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }

      if (!user) {
        // MÁGICA DO JUST-IN-TIME PROVISIONING:
        // O AD autenticou, mas o usuário não existe no banco local. Criamos ele agora!
        user = await this.prisma.client.user.create({
          data: {
            username: adUsername,
            email: String(adUser.mail || `${adUsername}@empresa.com`),
            password: '', // Sem senha local
            name: String(adUser.displayName || adUsername),
            role: 'USER', // Perfil padrão para novos usuários do AD
            authProvider: 'AD',
            ativo: true,
            ultimoLogin: new Date(),
          },
        });
      } else {
        // Se ele já existia no banco local como AD, apenas atualizamos os dados dele
        user = await this.prisma.client.user.update({
          where: { id: user.id },
          data: {
            ultimoLogin: new Date(),
            name: String(adUser.displayName || user.name || user.username),
            email: String(adUser.mail || user.email),
          },
        });
      }
    } 
    // -----------------------------------------------------------------
    // CENÁRIO B: USUÁRIO EXISTE E É AUTENTICADO LOCALMENTE
    // -----------------------------------------------------------------
    else if (user.authProvider === 'LOCAL') {
      if (!user.password) {
        throw new UnauthorizedException('Usuário local configurado sem senha.');
      }

      const isPasswordValid = await argon2.verify(user.password, credentials.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }

      user = await this.prisma.client.user.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() },
      });
    } else {
      throw new UnauthorizedException('Provedor de autenticação inválido.');
    }

    // -----------------------------------------------------------------
    // GERENCIAMENTO DE SESSÃO (Mantido idêntico e otimizado)
    // -----------------------------------------------------------------
    const crypto = await import('crypto');
    const sessionId = crypto.randomUUID();

    const tokens = await this.generateTokens(user, sessionId);
    const hashedRt = await argon2.hash(tokens.refreshToken);

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