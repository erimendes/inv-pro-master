"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsAdmin = exports.canModifyModule = exports.canViewModule = exports.PERMISSION_MAP = void 0;
exports.PERMISSION_MAP = {
    dashboard: {
        allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'ADMIN_DEV', 'ADMIN_DEVOPS', 'MANAGER_INFRA', 'MANAGER_DEV', 'MANAGER_DEVOPS'],
        writeRoles: ['ADMIN', 'SUPER_ADMIN']
    },
    assets: {
        allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'MANAGER_INFRA', 'ADMIN_DEVOPS'],
        writeRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'ADMIN_DEVOPS']
    },
    racks: {
        allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'MANAGER_INFRA'],
        writeRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA']
    },
    applications: {
        allowedRoles: ['ADMIN', 'ADMIN_INFRA', 'USER', 'ADMIN_DEV', 'MANAGER_DEV', 'ADMIN_DEVOPS', 'MANAGER_DEVOPS'],
        writeRoles: ['ADMIN', 'ADMIN_INFRA', 'ADMIN_DEV', 'ADMIN_DEVOPS']
    },
    users: {
        allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
        writeRoles: ['ADMIN', 'SUPER_ADMIN']
    }
};
const canViewModule = (role, module) => {
    if (!role)
        return false;
    const config = exports.PERMISSION_MAP[module];
    return config ? config.allowedRoles.includes(role.toUpperCase()) : false;
};
exports.canViewModule = canViewModule;
const canModifyModule = (role, module) => {
    if (!role)
        return false;
    const config = exports.PERMISSION_MAP[module];
    return config ? config.writeRoles.includes(role.toUpperCase()) : false;
};
exports.canModifyModule = canModifyModule;
const checkIsAdmin = (role) => {
    if (!role)
        return false;
    return (0, exports.canViewModule)(role, 'dashboard');
};
exports.checkIsAdmin = checkIsAdmin;
//# sourceMappingURL=roles.js.map