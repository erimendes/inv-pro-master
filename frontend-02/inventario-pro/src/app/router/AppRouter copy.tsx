// src/app/router/AppRouter.tsx

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import RootLayout from '../layouts/RootLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

import RequireAuth from '../../modules/auth/guards/RequireAuth';

import homeRoutes from '../../modules/home/routes/home.routes';

import {
  authRoutes,
} from '../../modules/auth/routes/auth.routes';

import {
  assetsRoutes,
} from '../../modules/assets/routes/assets.routes';

import {
  racksRoutes,
} from '../../modules/racks/routes/racks.routes';

import {
  applicationsRoutes,
} from '../../modules/applications/routes/applications.routes';

import {
  usersRoutes,
} from '../../modules/users/routes/users.routes';

export default function AppRouter() {
  return (
    <Routes>
      {/* ========================================= */}
      {/* AUTH */}
      {/* ========================================= */}

      <Route element={<AuthLayout />}>
        {authRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

      {/* ========================================= */}
      {/* PRIVATE */}
      {/* ========================================= */}

      <Route element={<RequireAuth />}>
        <Route element={<RootLayout />}>
          <Route element={<DashboardLayout />}>

            {/* ========================================= */}
            {/* ADMIN -> ACESSO TOTAL */}
            {/* ========================================= */}

            <Route
              element={
                <RequireAuth
                  allowedRoles={[
                    'ADMIN',
                  ]}
                />
              }
            >
              {[
                ...homeRoutes,
                ...assetsRoutes,
                ...racksRoutes,
                ...usersRoutes,
              ].map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>

            {/* ========================================= */}
            {/* ADMIN + USER -> APPLICATIONS */}
            {/* ========================================= */}

            <Route
              element={
                <RequireAuth
                  allowedRoles={[
                    'ADMIN',
                    'USER',
                  ]}
                />
              }
            >
              {applicationsRoutes.map(
                (route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ),
              )}
            </Route>

          </Route>
        </Route>
      </Route>

      {/* ========================================= */}
      {/* FALLBACK */}
      {/* ========================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

