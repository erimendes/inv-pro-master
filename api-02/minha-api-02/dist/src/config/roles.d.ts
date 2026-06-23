export type SystemModules = 'dashboard' | 'assets' | 'racks' | 'applications' | 'users';
export declare const PERMISSION_MAP: Record<SystemModules, {
    allowedRoles: string[];
    writeRoles: string[];
}>;
export declare const canViewModule: (role: string | undefined, module: SystemModules) => boolean;
export declare const canModifyModule: (role: string | undefined, module: SystemModules) => boolean;
export declare const checkIsAdmin: (role: string | undefined | null) => boolean;
