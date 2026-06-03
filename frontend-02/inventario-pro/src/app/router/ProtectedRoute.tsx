import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Debug: loga o usuário e o role
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - role:', user?.role);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);

  // Se não estiver logado, manda para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se roles foram definidos e o usuário não tem permissão, bloqueia
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
