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
import { Prisma } from '../../../generated/prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Estrutura padrão de retorno para não expor a senha por acidente
  private readonly userSelect = {
    id: true,
    username: true,
    email: true,
    name: true,
    role: true,
    departamento: true,
    authProvider: true,
    ativo: true,
    ultimoLogin: true,
    createdAt: true,
  };

  async create(data: CreateUserDto) {
    await this.validateUniqueFields(data.username, data.email);

    let hashedPassword: string | null = null;
    const provider = data.authProvider || 'AD';

    if (provider === 'LOCAL') {
      if (!data.password) {
        throw new BadRequestException('Senha obrigatória para usuários locais');
      }
      hashedPassword = await argon2.hash(data.password);
    }

    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'USER',
        authProvider: provider,
        departamento: data.departamento,
        ativo: data.ativo ?? true,
      },
      select: this.userSelect,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
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
    // 1. Garante que o usuário existe e traz os dados atuais
    const currentUser = await this.findOne(id);

    // Tipagem segura usando as definições geradas pelo Prisma
    const updateData: Prisma.UserUpdateInput = {};

    // 2. Valida e filtra alteração de e-mail único
    if (data.email && data.email !== currentUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new ConflictException('E-mail já está em uso');
      }
      updateData.email = data.email;
    }

    // 3. Valida e filtra alteração de username único
    if (data.username && data.username !== currentUser.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: data.username },
      });
      if (usernameExists) {
        throw new ConflictException('Username já está em uso');
      }
      updateData.username = data.username;
    }

    // 4. Mapeia campos opcionais e estruturados
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.departamento !== undefined) updateData.departamento = data.departamento;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.authProvider !== undefined) updateData.authProvider = data.authProvider;

    // 5. Criptografa nova senha se ela for informada no DTO
    if (data.password) {
      updateData.password = await argon2.hash(String(data.password));
    }

    // Se nenhum dado real mudou, evita uma query desnecessária ao banco
    if (Object.keys(updateData).length === 0) {
      return currentUser;
    }

    try {
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

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }

  async validateUniqueFields(username: string, email: string) {
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