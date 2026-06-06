"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../users/user.service");
const prisma_service_1 = require("../../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const ldap_service_1 = require("./ldap.service");
let AuthService = class AuthService {
    userService;
    prisma;
    jwt;
    ldapService;
    constructor(userService, prisma, jwt, ldapService) {
        this.userService = userService;
        this.prisma = prisma;
        this.jwt = jwt;
        this.ldapService = ldapService;
    }
    async register(dto) {
        const provider = dto.authProvider || 'AD';
        if (provider === 'AD') {
            const userExistsInAd = await this.ldapService.findUser(dto.username);
            if (!userExistsInAd) {
                throw new common_1.BadRequestException('Este usuário não existe no Active Directory da empresa');
            }
        }
        return this.userService.create(dto);
    }
    async login(credentials, meta) {
        const identifier = credentials.username || credentials.email;
        if (!identifier || !credentials.password) {
            throw new common_1.BadRequestException('Credenciais incompletas');
        }
        const user = await this.userService.findByEmailOrUsername(identifier);
        if (!user || !user.ativo) {
            throw new common_1.UnauthorizedException('Usuário não autorizado ou inativo');
        }
        if (user.authProvider === 'AD') {
            const adUser = await this.ldapService.authenticate(user.username, credentials.password);
            if (!adUser) {
                throw new common_1.UnauthorizedException('Credenciais inválidas no Active Directory');
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
        else if (user.authProvider === 'LOCAL') {
            if (!user.password) {
                throw new common_1.UnauthorizedException('Usuário local configurado sem senha');
            }
            const isPasswordValid = await argon2.verify(user.password, credentials.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
            await this.prisma.client.user.update({
                where: { id: user.id },
                data: { ultimoLogin: new Date() },
            });
        }
        else {
            throw new common_1.UnauthorizedException('Provedor de autenticação inválido');
        }
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
    async refresh(refreshToken) {
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
                    const user = await this.prisma.client.user.findUnique({
                        where: { id: payload.sub },
                    });
                    if (!user || !user.ativo)
                        throw new common_1.UnauthorizedException();
                    await this.prisma.client.session.update({
                        where: { id: session.id },
                        data: { revoked: true },
                    });
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
            throw new common_1.UnauthorizedException('Sessão inválida');
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido ou expirado');
        }
    }
    async logout(sessionId) {
        await this.prisma.client.session.update({
            where: { id: sessionId },
            data: { revoked: true },
        });
        return { message: 'Logout realizado com sucesso' };
    }
    async logoutAll(userId) {
        await this.prisma.client.session.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
        return { message: 'Logout de todos os dispositivos realizado' };
    }
    async generateTokens(user, sessionId) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService,
        ldap_service_1.LdapService])
], AuthService);
//# sourceMappingURL=auth.service.js.map