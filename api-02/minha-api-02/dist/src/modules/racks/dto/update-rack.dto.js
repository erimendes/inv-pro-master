"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRackDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_rack_dto_1 = require("./create-rack.dto");
class UpdateRackDto extends (0, swagger_1.PartialType)(create_rack_dto_1.CreateRackDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateRackDto = UpdateRackDto;
//# sourceMappingURL=update-rack.dto.js.map