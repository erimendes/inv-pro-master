// src/modules/assets/routes/assets.routes.tsx

import AssetsListPage from '../pages/AssetsListPage';
import AssetFormPage from '../pages/AssetFormPage';
import AssetDetailsPage from '../pages/AssetDetailsPage';

export const assetsRoutes = [
  {
    path: '/assets',
    element: <AssetsListPage />,
  },

  {
    path: '/assets/new',
    element: <AssetFormPage />,
  },

  // DETALHES
  {
    path: '/assets/:id',
    element: <AssetDetailsPage />,
  },

  // EDIÇÃO
  {
    path: '/assets/:id/edit',
    element: <AssetFormPage />,
  },
];