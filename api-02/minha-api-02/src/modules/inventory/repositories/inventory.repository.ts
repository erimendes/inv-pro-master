import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AtivoStatus, AtivoTipo } from '../../../../generated/prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertAtivo(data: any) {
    // O campo serial é @unique no seu Schema, ideal para o upsert
    return this.prisma.ativo.upsert({
      where: { serial: data.serial },
      update: {
        hostname: data.hostname,
        status: data.status as AtivoStatus,
        emUso: data.emUso,
        updatedAt: new Date(),
        // Adicione outros campos que podem mudar no GLPI
        cpu: data.cpu,
        ram: data.ram,
        armazenamento: data.armazenamento,
      },
      create: {
        patrimonio: data.patrimonio,
        serial: data.serial,
        tipo: data.tipo as AtivoTipo,
        fabricante: data.fabricante,
        modelo: data.modelo,
        hostname: data.hostname,
        cpu: data.cpu,
        ram: data.ram,
        armazenamento: data.armazenamento,
        status: (data.status as AtivoStatus) || AtivoStatus.DISPONIVEL,
      },
    });
  }

  // ... (mantenha os imports e o método upsertAtivo e findByTag)

  async findByTag(tag: string) {
    return this.prisma.ativo.findFirst({
      where: { patrimonio: tag },
      include: { 
        configsRede: true, 
        user: true 
      },
    });
  }

  // ADICIONE ESTE MÉTODO ABAIXO:
  async findAll() {
    return this.prisma.ativo.findMany({
      include: {
        configsRede: true,
        user: true,
      },
    });
  }
}