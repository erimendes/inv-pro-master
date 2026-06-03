"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryDto = void 0;
const openapi = require("@nestjs/swagger");
class InventoryDto {
    tagPatrimonial;
    numSerie;
    tipo;
    fabricante;
    modelo;
    hostname;
    status;
    cpu;
    ram;
    discoFisico;
    emUso;
    static _OPENAPI_METADATA_FACTORY() {
        return { tagPatrimonial: { required: true, type: () => String }, numSerie: { required: true, type: () => String }, tipo: { required: true, type: () => String }, fabricante: { required: true, type: () => String }, modelo: { required: true, type: () => String }, hostname: { required: false, type: () => String }, status: { required: false, type: () => String }, cpu: { required: false, type: () => String }, ram: { required: false, type: () => String }, discoFisico: { required: false, type: () => String }, emUso: { required: false, type: () => Boolean } };
    }
}
exports.InventoryDto = InventoryDto;
//# sourceMappingURL=inventory.dto.js.map