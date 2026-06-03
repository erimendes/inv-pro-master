// src/app/router/route.types.ts
import type { ReactNode } from 'react';
import { assetsRoutes } from '../../modules/assets/routes/assets.routes';
import { authRoutes } from '../../modules/auth/routes/auth.routes';
import { racksRoutes } from '../../modules/racks/routes/racks.routes';
import { applicationsRoutes } from '../../modules/applications/routes/applications.routes';
import { usersRoutes } from '../../modules/users/routes/users.routes';

export interface RouteObject {
  path?: string; // 💡 Ajustado para aceitar opcional se alinhar com react-router-dom
  element: ReactNode;
}

// 💡 Correção da restrição do tipo para aceitar o RouteObject do react-router-dom
type ExtractPaths<T extends readonly any[]> = Extract<T[number]['path'], string>;

export type AppRoute =
  | ExtractPaths<typeof authRoutes>
  | ExtractPaths<typeof assetsRoutes>
  | ExtractPaths<typeof racksRoutes>
  | ExtractPaths<typeof applicationsRoutes>
  | ExtractPaths<typeof usersRoutes>;

export const appRoutes: any[] = [
  ...authRoutes,
  ...assetsRoutes,
  ...racksRoutes,
  ...applicationsRoutes,
  ...usersRoutes,
];