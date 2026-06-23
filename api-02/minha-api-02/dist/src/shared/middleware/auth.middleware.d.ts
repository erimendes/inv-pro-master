import { Request, Response, NextFunction } from 'express';
import { SystemModules } from '../../config/roles';
export declare const checkPermission: (module: SystemModules, action: "view" | "modify") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
