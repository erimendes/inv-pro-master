import { Injectable, NotFoundException } from '@nestjs/common';
import { Criticidade, SistemaCategoria } from '../../../generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateApplicationDto) {
    const { servidoresIds, ...applicationData } = data;

    return this.prisma.aplicacao.create({
      data: {
        ...applicationData,
        servidores: servidoresIds?.length
          ? {
              connect: servidoresIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        servidores: true,
      },
    });
  }

  async findAll(categoria?: SistemaCategoria, criticidade?: Criticidade) {
    return this.prisma.aplicacao.findMany({
      where: {
        categoria: categoria || undefined,
        criticidade: criticidade || undefined,
      },
      include: {
        servidores: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const app = await this.prisma.aplicacao.findUnique({
      where: { id },
      include: {
        servidores: true,
      },
    });

    if (!app) {
      throw new NotFoundException(`Aplicação com ID ${id} não encontrada`);
    }

    return app;
  }

  async update(id: number, data: UpdateApplicationDto) {
    // Garante que a aplicação existe antes de atualizar
    await this.findOne(id);

    const { servidoresIds, ...applicationData } = data;

    return this.prisma.aplicacao.update({
      where: { id },
      data: {
        // 💡 O spread passa todas as propriedades preenchidas diretamente de forma limpa
        ...applicationData,
        
        // 💡 Atualiza os servidores limpando os antigos e definindo a nova lista do front
        ...(servidoresIds !== undefined && {
          servidores: {
            set: servidoresIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        servidores: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.aplicacao.delete({
      where: { id },
    });
  }
}