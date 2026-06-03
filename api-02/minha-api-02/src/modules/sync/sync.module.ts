import { Module } from '@nestjs/common';
import { GlpiModule } from '../glpi/glpi.module';
import { InventoryModule } from '../inventory/inventory.module';
import { InventorySyncTask } from './tasks/inventory-sync.task';

@Module({
  imports: [GlpiModule, InventoryModule],
  providers: [InventorySyncTask],
})
export class SyncModule {}
