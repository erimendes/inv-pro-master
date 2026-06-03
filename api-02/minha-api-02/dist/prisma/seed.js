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
const client_1 = require("../generated/prisma/client");
const validation_schema_1 = require("../src/config/env/validation.schema");
const dotenv = __importStar(require("dotenv"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const seedUser_1 = require("./seedUser");
const seedAtivos_1 = require("./seedAtivos");
const seedVMs_1 = require("./seedVMs");
const seedAplicacoes_1 = require("./seedAplicacoes");
dotenv.config();
async function validateBeforeSeed() {
    const { error } = validation_schema_1.validationSchema.validate(process.env, {
        allowUnknown: true,
    });
    if (error) {
        console.error('❌ Erro de configuração no .env');
        throw new Error(`Configuração inválida: ${error.message}`);
    }
    console.log('✅ Ambiente validado com Joi antes do Seed.');
}
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
});
async function main() {
    await validateBeforeSeed();
    console.log('🌱 Iniciando seed...');
    await prisma.$transaction(async (tx) => {
        await (0, seedUser_1.seedUser)(tx);
    });
    await (0, seedAtivos_1.seedAtivos)(prisma);
    await (0, seedVMs_1.seedVMs)(prisma);
    await (0, seedAplicacoes_1.seedAplicacoes)(prisma);
    console.log('🎉 Seed finalizado com sucesso.');
}
main()
    .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Conexões encerradas.');
});
//# sourceMappingURL=seed.js.map