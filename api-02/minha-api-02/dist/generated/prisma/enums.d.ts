export declare const Role: {
    readonly USER: "USER";
    readonly ADMIN: "ADMIN";
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly SUPER_USER: "SUPER_USER";
    readonly MANAGER: "MANAGER";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const AtivoTipo: {
    readonly LAPTOP: "LAPTOP";
    readonly DESKTOP: "DESKTOP";
    readonly SERVIDOR_FISICO: "SERVIDOR_FISICO";
    readonly SERVIDOR_VIRTUAL: "SERVIDOR_VIRTUAL";
    readonly SWITCH: "SWITCH";
    readonly ROTEADOR: "ROTEADOR";
    readonly STORAGE: "STORAGE";
    readonly FIREWALL: "FIREWALL";
    readonly ACCESS_POINT: "ACCESS_POINT";
    readonly IMPRESSORA: "IMPRESSORA";
    readonly MONITOR: "MONITOR";
    readonly NOBREAK: "NOBREAK";
};
export type AtivoTipo = (typeof AtivoTipo)[keyof typeof AtivoTipo];
export declare const AtivoStatus: {
    readonly DISPONIVEL: "DISPONIVEL";
    readonly EM_USO: "EM_USO";
    readonly MANUTENCAO: "MANUTENCAO";
    readonly DESCARTADO: "DESCARTADO";
};
export type AtivoStatus = (typeof AtivoStatus)[keyof typeof AtivoStatus];
export declare const PowerState: {
    readonly ON: "ON";
    readonly OFF: "OFF";
    readonly SUSPENDED: "SUSPENDED";
    readonly PAUSED: "PAUSED";
};
export type PowerState = (typeof PowerState)[keyof typeof PowerState];
export declare const SistemaCategoria: {
    readonly ADMINISTRATIVO: "ADMINISTRATIVO";
    readonly OPERACIONAL: "OPERACIONAL";
    readonly MONITORAMENTO: "MONITORAMENTO";
    readonly DEVOPS: "DEVOPS";
    readonly SEGURANCA: "SEGURANCA";
};
export type SistemaCategoria = (typeof SistemaCategoria)[keyof typeof SistemaCategoria];
export declare const Criticidade: {
    readonly BAIXA: "BAIXA";
    readonly MEDIA: "MEDIA";
    readonly ALTA: "ALTA";
    readonly CRITICA: "CRITICA";
};
export type Criticidade = (typeof Criticidade)[keyof typeof Criticidade];
export declare const HypervisorTipo: {
    readonly VMWARE: "VMWARE";
    readonly HYPERV: "HYPERV";
    readonly PROXMOX: "PROXMOX";
    readonly KVM: "KVM";
    readonly XEN: "XEN";
};
export type HypervisorTipo = (typeof HypervisorTipo)[keyof typeof HypervisorTipo];
export declare const AuthProvider: {
    readonly LOCAL: "LOCAL";
    readonly AD: "AD";
};
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
