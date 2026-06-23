import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma/client';
import { ROLES_KEY, PERMISSION_MODULE_KEY, PERMISSION_ACTION_KEY } from '../decorators/roles.decorator';
import { canModifyModule, canViewModule, SystemModules } from '../../config/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Será populado pelo JwtAuthGuard correto!

    const module = this.reflector.getAllAndOverride<SystemModules>(PERMISSION_MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const action = this.reflector.getAllAndOverride<'view' | 'modify'>(PERMISSION_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota não tem nenhuma trava, libera
    if (!module) {
      return true;
    }

    if (!user || !user.role) {
      throw new ForbiddenException('Acesso negado: Usuário não identificado para este módulo.');
    }

    // Valida no PERMISSION_MAP
    if (module && action) {
      const userRoleFormatted = String(user.role).toUpperCase();

      const hasAccess = action === 'modify'
        ? canModifyModule(userRoleFormatted, module)
        : canViewModule(userRoleFormatted, module);

      if (!hasAccess) {
        throw new ForbiddenException(
          `Acesso negado: Seu perfil (${user.role}) não tem permissão de ${action === 'modify' ? 'escrita' : 'leitura'} no módulo [${module}].`
        );
      }
      return true;
    }

    return true;
  }
}