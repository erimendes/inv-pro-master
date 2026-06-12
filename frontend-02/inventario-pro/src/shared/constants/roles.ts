// src/shared/constants/roles.ts

// 🔄 CORREÇÃO CRÍTICA: Adicionado o "export" antes de "type" para o RequireAuth conseguir ler!
export type SystemModules = 'dashboard' | 'assets' | 'racks' | 'applications' | 'users';

// src/shared/constants/roles.ts

export const PERMISSION_MAP: Record<SystemModules, { allowedRoles: string[]; writeRoles: string[] }> = {
  dashboard: {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'ADMIN_DEV', 'ADMIN_DEVOPS', 'MANAGER_INFRA', 'MANAGER_DEV', 'MANAGER_DEVOPS'],
    writeRoles:   ['ADMIN', 'SUPER_ADMIN']
  },
  assets: {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'MANAGER_INFRA'], // 👁️ Ambos ENXERGAM a tela
    writeRoles:   ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA'] // ✍️ Apenas ADMIN_INFRA (e globais) podem CRIAR, EDITAR e EXCLUIR
  },
  racks: {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA', 'MANAGER_INFRA'], // 👁️ Ambos ENXERGAM a tela
    writeRoles:   ['ADMIN', 'SUPER_ADMIN', 'ADMIN_INFRA'] // ✍️ Apenas ADMIN_INFRA (e globais) podem editar racks
  },
  applications: {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'USER', 'ADMIN_DEV', 'MANAGER_DEV', 'ADMIN_DEVOPS', 'MANAGER_DEVOPS'],
    writeRoles:   ['ADMIN', 'SUPER_ADMIN', 'ADMIN_DEV', 'ADMIN_DEVOPS']
  },
  users: {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    writeRoles:   ['ADMIN', 'SUPER_ADMIN']
  }
};

/**
 * Verifica se a role do usuário pode VER (Acesso de Leitura) uma determinada tela
 */
export const canViewModule = (role: string | undefined, module: SystemModules): boolean => {
  if (!role) return false;
  const config = PERMISSION_MAP[module];
  return config ? config.allowedRoles.includes(role.toUpperCase()) : false;
};

/**
 * Verifica se a role do usuário pode ALTERAR (Criar, Editar, Excluir) dados em uma tela
 */
export const canModifyModule = (role: string | undefined, module: SystemModules): boolean => {
  if (!role) return false;
  const config = PERMISSION_MAP[module];
  return config ? config.writeRoles.includes(role.toUpperCase()) : false;
};

/**
 * Atalho para manter compatibilidade com componentes que usam a função antiga
 */
export const checkIsAdmin = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return canViewModule(role, 'dashboard');
};