import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GlpiService } from '../../glpi/glpi.service';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class InventorySyncTask {
  private readonly logger = new Logger(InventorySyncTask.name);

  constructor(
    private readonly glpiService: GlpiService,
    private readonly inventoryService: InventoryService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSync() {
    this.logger.log('--- Iniciando Sincronização Automática ---');
    const data = await this.glpiService.fetchInventory();
    await this.inventoryService.syncBatch(data);
    this.logger.log('--- Sincronização Finalizada ---');
  }
}
