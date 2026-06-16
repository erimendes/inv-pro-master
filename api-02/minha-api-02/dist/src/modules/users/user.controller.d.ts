import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../../generated/prisma/client';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        username: string;
        email: string;
        role: Role;
        sessionId: string;
    };
}
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    updateMe(req: AuthenticatedRequest, body: UpdateUserDto): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    create(body: CreateUserDto): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    findAll(): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    update(id: string, body: UpdateUserDto): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export {};
