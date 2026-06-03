import { GlpiService } from '../../glpi/glpi.service';
import { InventoryService } from '../../inventory/inventory.service';
export declare class InventorySyncTask {
    private readonly glpiService;
    private readonly inventoryService;
    private readonly logger;
    constructor(glpiService: GlpiService, inventoryService: InventoryService);
    handleSync(): Promise<void>;
}
