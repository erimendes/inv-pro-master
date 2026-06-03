import type { RouteObject } from 'react-router-dom';
import { ApplicationList } from '../pages/ApplicationList.old';
import { ApplicationDetails } from '../pages/ApplicationDetails';
import { ApplicationForm } from '../pages/ApplicationForm';

export const applicationsRoutes: RouteObject[] = [
  {
    path: '/applications',
    element: <ApplicationList />,
  },
  {
    path: '/applications/:id',
    element: <ApplicationDetails />,
  },
  {
    path: '/applications/new',
    element: <ApplicationForm />,
  },
  {
    path: '/applications/edit/:id',
    element: <ApplicationForm />,
  },
];