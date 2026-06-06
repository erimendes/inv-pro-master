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
    register(dto: CreateUserDto): Promise<any>;
    login(credentials: LoginDto, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<{
        id: any;
        username: any;
        name: any;
        email: any;
        role: any;
        authProvider: any;
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
