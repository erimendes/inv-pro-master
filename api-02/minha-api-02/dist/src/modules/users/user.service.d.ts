import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly userSelect;
    create(data: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
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
        role: import("../../../generated/prisma/enums").Role;
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
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    findByEmailOrUsername(identifier: string): Promise<{
        id: string;
        username: string;
        email: string;
        password: string | null;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null>;
    update(id: string, data: UpdateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        ativo: boolean;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateUniqueFields(username: string, email: string): Promise<void>;
}
