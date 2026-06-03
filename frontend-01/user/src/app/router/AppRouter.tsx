import { useRoutes } from 'react-router-dom';

import { assetsRoutes } from '../../modules/assets/routes';
import { racksRoutes } from '../../modules/racks/routes';

export function AppRouter() {
  return useRoutes([
    ...assetsRoutes,
    ...racksRoutes
  ]);
}