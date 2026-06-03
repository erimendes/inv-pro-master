import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // =========================================
  // CREATE
  // =========================================
  async create(data: CreateUserDto) {
    // Busca por e-mail ou username para evitar duplicidade na raiz
    const userExists = await this.prisma.client.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      },
    });

    if (userExists) {
      throw new ConflictException('E-mail ou Username já cadastrado');
    }

    let hashedPassword = '';

    if (data.authProvider === 'LOCAL') {
      if (!data.password) {
        throw new BadRequestException(
          'Senha obrigatória para usuários locais',
        );
      }

      hashedPassword = await argon2.hash(data.password);
    }

    return this.prisma.client.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // =========================================
  // FIND ALL
  // =========================================
  async findAll() {
    return this.prisma.client.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // =========================================
  // FIND ONE
  // =========================================
  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // =========================================
  // FIND BY EMAIL
  // =========================================
  async findByEmail(email: string) {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  // =========================================
  // UPDATE
  // =========================================
  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validação de e-mail duplicado
    if (data.email && data.email !== user.email) {
      const emailExists = await this.prisma.client.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictException('E-mail já está em uso');
      }
    }

    // Hash de senha se enviada na atualização
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    return this.prisma.client.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // =========================================
  // DELETE
  // =========================================
  async remove(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.client.user.delete({
      where: { id },
    });

    return {
      message: 'Usuário removido com sucesso',
    };
  }
}