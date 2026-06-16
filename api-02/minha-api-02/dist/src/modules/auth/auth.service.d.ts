import { UserService } from '../users/user.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LdapService } from './ldap.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userService;
    private readonly prisma;
    private readonly jwt;
    private readonly ldapService;
    constructor(userService: UserService, prisma: PrismaService, jwt: JwtService, ldapService: LdapService);
    register(dto: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    login(credentials: LoginDto, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<{
        id: string;
        username: string;
        name: string | null;
        email: string;
        role: import("../../../generated/prisma/enums").Role;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(sessionId: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
