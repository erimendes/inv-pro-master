import { PrismaClient } from '../generated/prisma/client';
import { validationSchema } from '../src/config/env/validation.schema';

import * as dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { seedUser } from './seedUser';
import { seedAtivos } from './seedAtivos';
import { seedVMs } from './seedVMs';
import { seedAplicacoes } from './seedAplicacoes'

// ----------------------------------------------------
// ENV
// ----------------------------------------------------

dotenv.config();

// ----------------------------------------------------
// VALIDAÇÃO DO AMBIENTE
// ----------------------------------------------------

async function validateBeforeSeed() {
  const { error } = validationSchema.validate(process.env, {
    allowUnknown: true,
  });

  if (error) {
    console.error('❌ Erro de configuração no .env');
    throw new Error(`Configuração inválida: ${error.message}`);
  }

  console.log('✅ Ambiente validado com Joi antes do Seed.');
}

// ----------------------------------------------------
// DATABASE
// ----------------------------------------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// ----------------------------------------------------
// MAIN
// ----------------------------------------------------

async function main() {
  await validateBeforeSeed();

  console.log('🌱 Iniciando seed...');

  // pequenos dados
  await prisma.$transaction(async (tx) => {
    await seedUser(tx);
  });

  // grandes imports
  await seedAtivos(prisma);
  await seedVMs(prisma);
  await seedAplicacoes(prisma);

  console.log('🎉 Seed finalizado com sucesso.');
}

// ----------------------------------------------------
// EXECUTION
// ----------------------------------------------------

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