import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly userSelect;
    create(data: CreateUserDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    findByEmailOrUsername(identifier: string): Promise<any>;
    update(id: string, data: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateUniqueFields(username: string, email: string): Promise<void>;
}
