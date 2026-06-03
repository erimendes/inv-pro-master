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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUser = seedUser;
const client_1 = require("../generated/prisma/client");
const argon2 = __importStar(require("argon2"));
async function seedUser(prisma) {
    console.log('👤 Criando usuários...');
    const users = [
        {
            username: 'joao',
            name: 'João Silva',
            email: 'joao@email.com',
            password: '123456',
            role: client_1.Role.USER,
        },
        {
            username: 'maria',
            name: 'Maria Souza',
            email: 'maria@email.com',
            password: '123456',
            role: client_1.Role.USER,
        },
        {
            username: 'admin',
            name: 'Administrador',
            email: 'admin@empresa.com',
            password: 'Admin@123',
            role: client_1.Role.ADMIN,
        },
    ];
    for (const user of users) {
        const hash = await argon2.hash(user.password);
        await prisma.user.upsert({
            where: {
                email: user.email,
            },
            update: {
                name: user.name,
                username: user.username,
                role: user.role,
            },
            create: {
                username: user.username,
                name: user.name,
                email: user.email,
                password: hash,
                role: user.role,
                authProvider: client_1.AuthProvider.LOCAL,
                ativo: true,
            },
        });
    }
    console.log('✅ Usuários criados/atualizados.');
}
//# sourceMappingURL=seedUser.js.map