"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPermission = exports.Roles = exports.PERMISSION_ACTION_KEY = exports.PERMISSION_MODULE_KEY = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.PERMISSION_MODULE_KEY = 'permission_module';
exports.PERMISSION_ACTION_KEY = 'permission_action';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const CheckPermission = (module, action) => {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.PERMISSION_MODULE_KEY, module), (0, common_1.SetMetadata)(exports.PERMISSION_ACTION_KEY, action));
};
exports.CheckPermission = CheckPermission;
//# sourceMappingURL=roles.decorator.js.map