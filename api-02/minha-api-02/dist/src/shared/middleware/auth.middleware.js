"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const roles_1 = require("../../config/roles");
const checkPermission = (module, action) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        const hasAccess = action === 'modify'
            ? (0, roles_1.canModifyModule)(userRole, module)
            : (0, roles_1.canViewModule)(userRole, module);
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Seu cargo (${userRole}) não tem permissão para esta ação.`
            });
        }
        next();
    };
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=auth.middleware.js.map