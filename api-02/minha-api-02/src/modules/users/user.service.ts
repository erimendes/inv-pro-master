// src/modules/users/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  // 🔄 CORREÇÃO: Removido o "readonly" da injeção se necessário, mantendo o padrão do resto do app
  constructor(private prisma: PrismaService) {}

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

    // 🔄 CORREÇÃO: Alinhado para "this.prisma.user" (sem o .client)
    return this.prisma.user.create({
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
    // 🔄 CORREÇÃO: Alinhado para "this.prisma.user"
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
    // 🔄 CORREÇÃO: Alinhado para "this.prisma.user"
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmailOrUsername(identifier: string) {
    // 🔄 CORREÇÃO: Alinhado para "this.prisma.user"
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ],
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    // 1. Busca o usuário atual usando o método corrigido
    const user = await this.findOne(id);

    const updateData: any = {};
    const inputData = data as any;

    // 2. Filtra o e-mail se ele mudou de fato
    if (inputData.email && inputData.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: inputData.email },
      });
      if (emailExists) {
        throw new ConflictException('E-mail já está em uso');
      }
      updateData.email = inputData.email;
    }

    // 3. Filtra o username se ele mudou de fato
    if (inputData.username && inputData.username !== user.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: inputData.username },
      });
      if (usernameExists) {
        throw new ConflictException('Username já está em uso');
      }
      updateData.username = inputData.username;
    }

    // 4. Copia os outros campos comuns opcionais
    if (inputData.name) updateData.name = inputData.name;
    if (inputData.role) updateData.role = inputData.role;
    if (inputData.ativo !== undefined) updateData.ativo = inputData.ativo;

    // 5. Criptografa a nova senha se informada
    if (data.password) {
      updateData.password = await argon2.hash(String(data.password));
    }

    // Se nada mudou, retorna o usuário do findOne direto para poupar query
    if (Object.keys(updateData).length === 0) {
      return user;
    }

    try {
      // 🔄 CORREÇÃO: Atualização direta usando a instância limpa do Prisma
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: this.userSelect,
      });
    } catch (error) {
      console.error('Erro no update de usuário:', error);
      throw new InternalServerErrorException('Erro interno ao salvar alterações do usuário.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    // 🔄 CORREÇÃO: Alinhado para "this.prisma.user"
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }

  async validateUniqueFields(username: string, email: string) {
    // 🔄 CORREÇÃO: Alinhado para "this.prisma.user"
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userExists) {
      throw new ConflictException('E-mail ou Username já cadastrado');
    }
  }
}