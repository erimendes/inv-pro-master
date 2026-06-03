import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {

  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':tag')
  @ApiOperation({ summary: 'Busca um ativo pela Tag Patrimonial' })
  async getByTag(@Param('tag') tag: string) {
    return this.inventoryService.getByTag(tag);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todos os ativos sincronizados' })
  async findAll() {
    return this.inventoryService.findAll();
  }
}
