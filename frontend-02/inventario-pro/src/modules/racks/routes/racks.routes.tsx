import RacksListPage from '../pages/RacksListPage';

import RackFormPage from '../pages/RackFormPage';

import RackDetailsPage from '../pages/RackDetailsPage';

import RackIncludeAssetsPage from '../pages/RackIncludeAssetsPage';

export const racksRoutes = [
  {
    path: '/racks',
    element: <RacksListPage />,
  },

  {
    path: '/racks/new',
    element: <RackFormPage />,
  },

  {
    path: '/racks/:id',
    element: <RackDetailsPage />,
  },

  // NOVA ROTA
  {
    path: '/racks/:id/include-assets',
    element: <RackIncludeAssetsPage />,
  },

  {
    path: '/racks/:id/edit',
    element: <RackFormPage />,
  },
];