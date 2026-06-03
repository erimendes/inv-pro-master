import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: CreateUserDto): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        authProvider: any;
    }>;
    login(body: LoginDto, req: any): Promise<{
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
    logout(req: any): Promise<{
        message: string;
    }>;
    logoutAll(req: any): Promise<{
        message: string;
    }>;
}
