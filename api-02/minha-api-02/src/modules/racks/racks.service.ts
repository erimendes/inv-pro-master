import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

@Injectable()
export class RacksService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRackDto) {
    return this.prisma.rack.create({
      data: {
        nome: data.nome,
        localizacao: data.localizacao,
        capacidade: data.capacidade ?? 42,
      },
    });
  }

  async findAll() {
    return this.prisma.rack.findMany({
      include: {
        ativos: {
          orderBy: {
            posicaoRack: 'asc',
          },
        },
      },

      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: { id },

      include: {
        ativos: {
          orderBy: {
            posicaoRack: 'asc',
          },
        },
      },
    });

    if (!rack) {
      throw new NotFoundException(
        `Rack com ID ${id} nao encontrado.`,
      );
    }

    return rack;
  }

  async update(
    id: string,
    data: UpdateRackDto,
  ) {
    await this.findOne(id);

    return this.prisma.rack.update({
      where: { id },

      data: {
        ...(data.nome !== undefined && {
          nome: data.nome,
        }),

        ...(data.localizacao !== undefined && {
          localizacao: data.localizacao,
        }),

        ...(data.capacidade !== undefined && {
          capacidade: data.capacidade,
        }),
      },
    });
  }

  async remove(id: string) {
    const rack = await this.findOne(id);

    if (rack.ativos.length > 0) {
      throw new BadRequestException(
        'Nao e possivel remover um rack com ativos vinculados.',
      );
    }

    return this.prisma.rack.delete({
      where: { id },
    });
  }
}
