import { Role, AuthProvider } from '../../../../generated/prisma/client';
export declare class CreateUserDto {
    username: string;
    email: string;
    password?: string;
    name?: string;
    role?: Role;
    authProvider?: AuthProvider;
    ativo?: boolean;
}
