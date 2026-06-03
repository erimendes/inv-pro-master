import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function ensureDatabaseExists() {
  const dbName = process.env.NEW_PROJECT_DB;
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Conectado ao Postgres para verificar bancos...');
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Sucesso: Banco "${dbName}" criado!`);
    } else {
      console.log(`ℹ️ O banco "${dbName}" já existe.`);
    }
  } catch (err: any) {
    console.error("❌ Erro ao criar banco:", err.message);
  } finally {
    await client.end();
  }
}

ensureDatabaseExists();
