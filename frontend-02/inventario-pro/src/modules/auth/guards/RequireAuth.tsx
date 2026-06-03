import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type Props = {
  allowedRoles?: string[];
};

export default function RequireAuth({
  allowedRoles,
}: Props) {
  const { user, loading } =
    useAuth();

  if (loading) {
    return (
      <div className="p-10 text-white">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ROLE CHECK
  if (
    allowedRoles &&
    !allowedRoles.includes(
      user.role || '',
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
}