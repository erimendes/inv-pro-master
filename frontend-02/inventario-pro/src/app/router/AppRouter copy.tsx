// src/app/router/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
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

export default function AppRouter() {
  return (
    <Routes>
      {/* PÚBLICO / AUTH */}
      <Route element={<AuthLayout />}>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* PRIVADO GLOBAL */}
      <Route element={<RequireAuth />}>
        <Route element={<RootLayout />}>
          <Route element={<DashboardLayout />}>

            {/* 1. PROTEÇÃO DO DASHBOARD */}
            <Route element={<RequireAuth module="dashboard" />}>
              {homeRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

            {/* 2. PROTEÇÃO DE ATIVOS */}
            <Route element={<RequireAuth module="assets" />}>
              {assetsRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

            {/* 3. PROTEÇÃO DE RACKS */}
            <Route element={<RequireAuth module="racks" />}>
              {racksRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

            {/* 4. PROTEÇÃO DE APLICAÇÕES */}
            <Route element={<RequireAuth module="applications" />}>
              {applicationsRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

            {/* 5. PROTEÇÃO DE USUÁRIOS */}
            <Route element={<RequireAuth module="users" />}>
              {usersRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>

          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/* Se houver componente mapeado */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}