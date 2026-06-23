import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly userSelect;
    create(data: CreateUserDto): Promise<{
        ativo: boolean;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    findAll(): Promise<{
        ativo: boolean;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        ativo: boolean;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
    }>;
    findByEmailOrUsername(identifier: string): Promise<{
        ativo: boolean;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        password: string | null;
        name: string | null;
        authProvider: import("../../../generated/prisma/enums").AuthProvider;
        role: import("../../../generated/prisma/enums").Role;
        departamento: string | null;
        ultimoLogin: Date | null;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null>;
    update(id: string, data: UpdateUserDto): Promise<{
        ativo: boolean;
        id: string;
        createdAt: Date;
        username: string;
        email: string;
        name: string | null;
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
