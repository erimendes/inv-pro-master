"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.HypervisorTipo = exports.Criticidade = exports.SistemaCategoria = exports.PowerState = exports.AtivoStatus = exports.AtivoTipo = exports.Role = void 0;
exports.Role = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    SUPER_USER: 'SUPER_USER',
    MANAGER: 'MANAGER'
};
exports.AtivoTipo = {
    LAPTOP: 'LAPTOP',
    DESKTOP: 'DESKTOP',
    SERVIDOR_FISICO: 'SERVIDOR_FISICO',
    SERVIDOR_VIRTUAL: 'SERVIDOR_VIRTUAL',
    SWITCH: 'SWITCH',
    ROTEADOR: 'ROTEADOR',
    STORAGE: 'STORAGE',
    FIREWALL: 'FIREWALL',
    ACCESS_POINT: 'ACCESS_POINT',
    IMPRESSORA: 'IMPRESSORA',
    MONITOR: 'MONITOR',
    NOBREAK: 'NOBREAK'
};
exports.AtivoStatus = {
    DISPONIVEL: 'DISPONIVEL',
    EM_USO: 'EM_USO',
    MANUTENCAO: 'MANUTENCAO',
    DESCARTADO: 'DESCARTADO'
};
exports.PowerState = {
    ON: 'ON',
    OFF: 'OFF',
    SUSPENDED: 'SUSPENDED',
    PAUSED: 'PAUSED'
};
exports.SistemaCategoria = {
    ADMINISTRATIVO: 'ADMINISTRATIVO',
    OPERACIONAL: 'OPERACIONAL',
    MONITORAMENTO: 'MONITORAMENTO',
    DEVOPS: 'DEVOPS',
    SEGURANCA: 'SEGURANCA'
};
exports.Criticidade = {
    BAIXA: 'BAIXA',
    MEDIA: 'MEDIA',
    ALTA: 'ALTA',
    CRITICA: 'CRITICA'
};
exports.HypervisorTipo = {
    VMWARE: 'VMWARE',
    HYPERV: 'HYPERV',
    PROXMOX: 'PROXMOX',
    KVM: 'KVM',
    XEN: 'XEN'
};
exports.AuthProvider = {
    LOCAL: 'LOCAL',
    AD: 'AD'
};
//# sourceMappingURL=enums.js.map