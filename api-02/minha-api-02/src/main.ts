import * as dotenv from 'dotenv';
import * as path from 'path';

// Força o Node a buscar o .env na raiz exata da pasta 'minha-api-02'
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Agora sim, quando o AppModule carregar, as variáveis já existem!
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- AJUSTE 1: Habilitar o CORS (Obrigatório para o React conseguir conectar) ---
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('API Moderna NestJS')
    .setDescription('NestJS + Prisma (Custom Output) + JWT Auth')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Insira o token JWT',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // --- ALTERAÇÃO AQUI: Passar '0.0.0.0' para escutar na rede do Docker ---
  await app.listen(3000);
  
  console.log(`🚀 API rodando e aberta para a rede na porta 3000`);
}
bootstrap();