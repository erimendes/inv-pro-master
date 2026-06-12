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
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
    }>;
    create(body: CreateUserDto): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
    }>;
    findAll(): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
    }[]>;
    findOne(id: string): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
    }>;
    update(id: string, body: UpdateUserDto): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: Role;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export {};
