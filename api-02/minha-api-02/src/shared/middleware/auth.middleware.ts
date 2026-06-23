import { Request, Response, NextFunction } from 'express';
import { canModifyModule, canViewModule, SystemModules } from '../../config/roles'; // Seu arquivo

export const checkPermission = (module: SystemModules, action: 'view' | 'modify') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // O 'req.user' normalmente é injetado por um middleware anterior de JWT
    const userRole = req.user?.role; 

    const hasAccess = action === 'modify' 
      ? canModifyModule(userRole, module) 
      : canViewModule(userRole, module);

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Seu cargo (${userRole}) não tem permissão para esta ação.` 
      });
    }

    next(); // Permissão concedida, vai para o Controller
  };
};