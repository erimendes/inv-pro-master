import {
  PrismaClient,
  Prisma,
  Role,
  AuthProvider,
} from '../generated/prisma/client';

import * as argon2 from 'argon2';

export async function seedUser(
  prisma: PrismaClient | Prisma.TransactionClient,
) {
  console.log('👤 Criando usuários...');

  const users = [
    {
      username: 'joao',
      name: 'João Silva',
      email: 'joao@email.com',
      password: '123456',
      role: Role.USER,
    },
    {
      username: 'maria',
      name: 'Maria Souza',
      email: 'maria@email.com',
      password: '123456',
      role: Role.USER,
    },
    {
      username: 'admin',
      name: 'Administrador',
      email: 'admin@empresa.com',
      password: 'Admin@123',
      role: Role.ADMIN,
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
        authProvider: AuthProvider.LOCAL,
        ativo: true,
      },
    });
  }

  console.log('✅ Usuários criados/atualizados.');
}