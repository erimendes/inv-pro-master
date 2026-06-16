import { Role, AuthProvider } from '../../../../generated/prisma/client';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    departamento?: string;
    role?: Role;
    authProvider?: AuthProvider;
    ativo?: boolean;
}
