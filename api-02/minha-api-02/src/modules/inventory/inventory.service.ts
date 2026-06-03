import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryDto } from './dto/inventory.dto'; // Importe o DTO

@Injectable()
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async syncBatch(items: InventoryDto[]) {
    // Usar um loop simples é mais seguro para UPSERTS sequenciais no Prisma
    // e evita o erro de "Too many connections"
    for (const item of items) {
      await this.repository.upsertAtivo(item);
    }
  }

  // MÉTODO PARA A LINHA 15 DO CONTROLLER
  async getByTag(tag: string) {
    return this.repository.findByTag(tag);
  }

  // MÉTODO PARA A LINHA 22 DO CONTROLLER
  async findAll() {
    return this.repository.findAll();
  }
}
