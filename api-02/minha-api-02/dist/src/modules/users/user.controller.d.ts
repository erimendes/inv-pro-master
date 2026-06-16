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
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    create(body: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    update(id: string, body: UpdateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export {};
