import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly userSelect;
    create(data: CreateUserDto): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
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
        role: import("../../../generated/prisma/enums").Role;
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
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    findByEmailOrUsername(identifier: string): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        username: string;
        email: string;
        password: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    } | null>;
    update(id: string, data: UpdateUserDto): Promise<{
        ativo: boolean;
        name: string | null;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateUniqueFields(username: string, email: string): Promise<void>;
}
