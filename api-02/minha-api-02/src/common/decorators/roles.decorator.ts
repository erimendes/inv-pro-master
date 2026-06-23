// src/common/decorators/roles.decorator.ts
import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client';
import { SystemModules } from '../../config/roles'; // 👈 Certifique-se de que o caminho aponta para o seu arquivo de constantes

// Chaves de metadados para o NestJS identificar o que foi injetado na rota
export const ROLES_KEY = 'roles';
export const PERMISSION_MODULE_KEY = 'permission_module';
export const PERMISSION_ACTION_KEY = 'permission_action';

/**
 * 🔒 DECORATOR ANTIGO (Baseado em Roles brutas)
 * Mantido para retrocompatibilidade
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * 🎯 NOVO DECORATOR (Baseado em Módulos e Permissões)
 * Use este para ler as regras do seu PERMISSION_MAP
 * @param module O módulo do sistema ('dashboard', 'assets', 'racks', etc)
 * @param action O tipo de acesso ('view' para leitura ou 'modify' para escrita)
 */
export const CheckPermission = (module: SystemModules, action: 'view' | 'modify') => {
  return applyDecorators(
    SetMetadata(PERMISSION_MODULE_KEY, module),
    SetMetadata(PERMISSION_ACTION_KEY, action),
  );
};