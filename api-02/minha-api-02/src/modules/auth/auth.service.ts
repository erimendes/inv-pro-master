import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LdapService } from './ldap.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private ldapService: LdapService,
  ) {}

  async register(dto: CreateUserDto) {
    // 1. Verifica se já existe no banco de dados local
    const existing = await this.prisma.client.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { email: dto.email },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Usuário ou E-mail já cadastrado localmente');
    }

    let password = '';
    const provider = dto.authProvider || 'AD';

    // 2. Fluxo se for LOCAL: Senha obrigatória + Hash
    if (provider === 'LOCAL') {
      if (!dto.password) {
        throw new ConflictException(
          'Senha obrigatória para usuário LOCAL',
        );
      }
      password = await argon2.hash(dto.password);
    }

    // 3. Fluxo se for AD: Valida se existe no AD (SEM pedir ou usar senha)
    if (provider === 'AD') {
      const userExistsInAd = await this.ldapService.findUser(dto.username);

      if (!userExistsInAd) {
        throw new BadRequestException(
          'Este usuário não existe no Active Directory da empresa',
        );
      }
    }

    // 4. Salva no banco local (se for AD, a senha vai em branco '')
    const user = await this.prisma.client.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password, 
        name: dto.name,
        role: dto.role || 'USER',
        authProvider: provider,
        ativo: dto.ativo ?? true,
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
    };
  }

  async login(
    data: any,
    meta: {
      ip?: string;
      userAgent?: string;
    },
  ) {
    const user =
      await this.prisma.client.user.findFirst({
        where: {
          OR: [
            {
              username: data.username,
            },
            {
              email: data.email,
            },
          ],
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não autorizado',
      );
    }

    if (!user.ativo) {
      throw new UnauthorizedException(
        'Usuário inativo',
      );
    }

    //
    // AUTENTICAÇÃO ACTIVE DIRECTORY
    //
    if (user.authProvider === 'AD') {
      const adUser =
        await this.ldapService.authenticate(
          user.username,
          data.password,
        );

      if (!adUser) {
        throw new UnauthorizedException(
          'Credenciais inválidas no Active Directory',
        );
      }

      // Atualiza informações vindas do AD
      await this.prisma.client.user.update({
        where: {
          id: user.id,
        },
        data: {
          ultimoLogin: new Date(),
          name:
            String(
              adUser.displayName ||
              user.name ||
              user.username,
            ),
          email:
            String(
              adUser.mail ||
              user.email,
            ),
        },
      });
    }

    //
    // AUTENTICAÇÃO LOCAL
    //
    if (user.authProvider === 'LOCAL') {
      if (!user.password) {
        throw new UnauthorizedException(
          'Usuário sem senha cadastrada',
        );
      }

      const valid =
        await argon2.verify(
          user.password,
          data.password,
        );

      if (!valid) {
        throw new UnauthorizedException(
          'Credenciais inválidas',
        );
      }

      await this.prisma.client.user.update({
        where: {
          id: user.id,
        },
        data: {
          ultimoLogin: new Date(),
        },
      });
    }

    //
    // CRIA SESSÃO
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
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider:
        user.authProvider,
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
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { expiresIn: '15m' }),
      this.jwt.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}