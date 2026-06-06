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
    updateMe(req: AuthenticatedRequest, body: UpdateUserDto): Promise<any>;
    create(body: CreateUserDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, body: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export {};
