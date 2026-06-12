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
import { authRoutes } from '../../modules/auth/routes/auth.routes';
import { assetsRoutes } from '../../modules/assets/routes/assets.routes';
import { racksRoutes } from '../../modules/racks/routes/racks.routes';
import { applicationsRoutes } from '../../modules/applications/routes/applications.routes';
import { usersRoutes } from '../../modules/users/routes/users.routes';

// 🔄 Centralizamos as roles que podem acessar as áreas administrativas
const ADMIN_AND_MANAGERS = [
  'ADMIN',
  'SUPER_ADMIN',
  'ADMIN_INFRA',
  'ADMIN_DEV',
  'ADMIN_DEVOPS',
  'MANAGER_INFRA',
  'MANAGER_DEV',
  'MANAGER_DEVOPS'
];

export default function AppRouter() {
  return (
    <Routes>
      {/* ===================================== */}
      {/* AUTH */}
      {/* ===================================== */}

      <Route element={<AuthLayout />}>
        {authRoutes.map(
          (route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ),
        )}
      </Route>

      {/* ===================================== */}
      {/* PRIVATE */}
      {/* ===================================== */}

      <Route element={<RequireAuth />}>
        <Route element={<RootLayout />}>
          <Route element={<DashboardLayout />}>
            {/* ===================================== */}
            {/* HOME - ADMIN + USER */}
            {/* ===================================== */}

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
              {homeRoutes.map(
                (route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ),
              )}
            </Route>

            {/* ===================================== */}
            {/* APPLICATIONS - ADMIN + USER */}
            {/* ===================================== */}

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

            {/* ===================================== */}
            {/* INFRASTRUCTURE & ADMINISTRATIVE PAGES */}
            {/* ===================================== */}

            <Route
              element={
                <RequireAuth
                  // 🔄 CORREÇÃO CRÍTICA: Agora permite que gestores e técnicos passem pela segurança da rota!
                  allowedRoles={ADMIN_AND_MANAGERS}
                />
              }
            >
              {[
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
          </Route>
        </Route>
      </Route>

      {/* ===================================== */}
      {/* UNAUTHORIZED */}
      {/* ===================================== */}

      <Route
        path="/unauthorized"
        element={
          <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-white">
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center">
              <h1 className="mb-3 text-4xl font-black text-red-400">
                Acesso negado
              </h1>

              <p className="text-slate-300">
                Você não possui permissão
                para acessar esta área.
              </p>
            </div>
          </div>
        }
      />

      {/* ===================================== */}
      {/* FALLBACK */}
      {/* ===================================== */}

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