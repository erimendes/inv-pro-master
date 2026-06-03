import AssetListPage from './pages/AssetListPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import AssetEditPage from './pages/AssetEditPage';

export const assetsRoutes = [
  {
    path: '/assets',
    element: <AssetListPage />
  },

  {
    path: '/assets/:id',
    element: <AssetDetailsPage />
  },

  {
    path: '/assets/:id/edit',
    element: <AssetEditPage />
  }
];