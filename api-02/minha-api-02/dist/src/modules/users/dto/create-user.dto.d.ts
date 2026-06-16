import { Role, AuthProvider } from '../../../../generated/prisma/client';
export declare class CreateUserDto {
    username: string;
    email: string;
    password?: string;
    name?: string;
    departamento?: string;
    role?: Role;
    authProvider?: AuthProvider;
    ativo?: boolean;
}
