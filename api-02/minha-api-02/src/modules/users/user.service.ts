// src/modules/users/user.service.ts
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
  constructor(private readonly prisma: PrismaService) {}

  // Centraliza a seleção padrão para evitar repetição de código (DRY)
  private readonly userSelect = {
    id: true,
    username: true,
    email: true,
    name: true,
    role: true,
    authProvider: true,
    createdAt: true,
  };

  async create(data: CreateUserDto) {
    await this.validateUniqueFields(data.username, data.email);

    let hashedPassword = '';
    const provider = data.authProvider || 'AD';

    if (provider === 'LOCAL') {
      if (!data.password) {
        throw new BadRequestException('Senha obrigatória para usuários locais');
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

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmailOrUsername(identifier: string) {
    return this.prisma.client.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ],
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);

    if (data.email && data.email !== user.email) {
      const emailExists = await this.prisma.client.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new ConflictException('E-mail já está em uso');
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

  async remove(id: string) {
    await this.findOne(id); // Garante que lança 404 se não existir

    await this.prisma.client.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }

  // Método auxiliar reutilizável para validação de duplicidade
  async validateUniqueFields(username: string, email: string) {
    const userExists = await this.prisma.client.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      throw new ConflictException('E-mail ou Username já cadastrado');
    }
  }
}