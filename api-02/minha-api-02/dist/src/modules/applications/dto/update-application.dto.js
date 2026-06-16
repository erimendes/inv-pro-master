"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplicationDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const create_application_dto_1 = require("./create-application.dto");
class UpdateApplicationDto extends (0, swagger_1.PartialType)(create_application_dto_1.CreateApplicationDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateApplicationDto = UpdateApplicationDto;
//# sourceMappingURL=update-application.dto.js.map