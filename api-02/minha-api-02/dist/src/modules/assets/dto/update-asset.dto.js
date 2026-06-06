"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssetDto = void 0;
const openapi = require("@nestjs/swagger");
const create_asset_dto_1 = require("./create-asset.dto");
const mapped_types_1 = require("@nestjs/mapped-types");
class UpdateAssetDto extends (0, mapped_types_1.PartialType)(create_asset_dto_1.CreateAssetDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateAssetDto = UpdateAssetDto;
//# sourceMappingURL=update-asset.dto.js.map