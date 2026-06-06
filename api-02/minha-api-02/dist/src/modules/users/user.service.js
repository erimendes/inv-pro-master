"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const argon2 = __importStar(require("argon2"));
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    userSelect = {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        authProvider: true,
        createdAt: true,
    };
    async create(data) {
        await this.validateUniqueFields(data.username, data.email);
        let hashedPassword = '';
        const provider = data.authProvider || 'AD';
        if (provider === 'LOCAL') {
            if (!data.password) {
                throw new common_1.BadRequestException('Senha obrigatória para usuários locais');
            }
            hashedPassword = await argon2.hash(data.password);
        }
        return this.prisma.client.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role || 'USER',
                authProvider: provider,
                ativo: data.ativo ?? true,
            },
            select: this.userSelect,
        });
    }
    async findAll() {
        return this.prisma.client.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: this.userSelect,
        });
    }
    async findOne(id) {
        const user = await this.prisma.client.user.findUnique({
            where: { id },
            select: this.userSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async findByEmailOrUsername(identifier) {
        return this.prisma.client.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ],
            },
        });
    }
    async update(id, data) {
        const user = await this.findOne(id);
        if (data.email && data.email !== user.email) {
            const emailExists = await this.prisma.client.user.findUnique({
                where: { email: data.email },
            });
            if (emailExists) {
                throw new common_1.ConflictException('E-mail já está em uso');
            }
        }
        if (data.password) {
            data.password = await argon2.hash(data.password);
        }
        return this.prisma.client.user.update({
            where: { id },
            data,
            select: this.userSelect,
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.client.user.delete({
            where: { id },
        });
        return { message: 'Usuário removido com sucesso' };
    }
    async validateUniqueFields(username, email) {
        const userExists = await this.prisma.client.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (userExists) {
            throw new common_1.ConflictException('E-mail ou Username já cadastrado');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map