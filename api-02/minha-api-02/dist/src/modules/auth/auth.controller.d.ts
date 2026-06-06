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
    register(dto: CreateUserDto): Promise<any>;
    login(body: LoginDto, req: CustomHttpRequest): Promise<{
        id: any;
        username: any;
        name: any;
        email: any;
        role: any;
        authProvider: any;
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
