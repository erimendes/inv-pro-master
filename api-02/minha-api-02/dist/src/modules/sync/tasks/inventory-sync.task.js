"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InventorySyncTask_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySyncTask = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const glpi_service_1 = require("../../glpi/glpi.service");
const inventory_service_1 = require("../../inventory/inventory.service");
let InventorySyncTask = InventorySyncTask_1 = class InventorySyncTask {
    glpiService;
    inventoryService;
    logger = new common_1.Logger(InventorySyncTask_1.name);
    constructor(glpiService, inventoryService) {
        this.glpiService = glpiService;
        this.inventoryService = inventoryService;
    }
    async handleSync() {
        this.logger.log('--- Iniciando Sincronização Automática ---');
        const data = await this.glpiService.fetchInventory();
        await this.inventoryService.syncBatch(data);
        this.logger.log('--- Sincronização Finalizada ---');
    }
};
exports.InventorySyncTask = InventorySyncTask;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventorySyncTask.prototype, "handleSync", null);
exports.InventorySyncTask = InventorySyncTask = InventorySyncTask_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [glpi_service_1.GlpiService,
        inventory_service_1.InventoryService])
], InventorySyncTask);
//# sourceMappingURL=inventory-sync.task.js.map