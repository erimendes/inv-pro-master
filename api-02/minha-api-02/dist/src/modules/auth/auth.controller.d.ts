import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
interface CustomHttpRequest {
    ip: string;
    headers: Record<string, string | string[] | undefined>;
    user?: {
        sub: string;
        sessionId: string;
    };
}
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: CreateUserDto): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
    }>;
    login(body: LoginDto, req: CustomHttpRequest): Promise<{
        id: string;
        username: string;
        name: string | null;
        email: string;
        role: import("../../../generated/prisma/enums").Role;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(body: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: CustomHttpRequest & {
        user: {
            sessionId: string;
        };
    }): Promise<{
        message: string;
    }>;
    logoutAll(req: CustomHttpRequest & {
        user: {
            sub: string;
        };
    }): Promise<{
        message: string;
    }>;
}
export {};
