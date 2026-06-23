import { Role } from '../../../generated/prisma/client';
import { SystemModules } from '../../config/roles';
export declare const ROLES_KEY = "roles";
export declare const PERMISSION_MODULE_KEY = "permission_module";
export declare const PERMISSION_ACTION_KEY = "permission_action";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const CheckPermission: (module: SystemModules, action: "view" | "modify") => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
