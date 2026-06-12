// src/modules/auth/guards/RequireAuth.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 🔄 Mude a linha de import no seu RequireAuth.tsx para garantir:
import { canViewModule } from '../../../shared/constants/roles';
import type { SystemModules } from '../../../shared/constants/roles'; // ⬅️ Use "import type" de forma isolada
type Props = {
  module?: SystemModules; // 🔄 Agora passamos o ID do módulo
};

export default function RequireAuth({ module }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-white">Carregando permissões...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota pediu validação por módulo, checa se a role do usuário está autorizada no Mapa
  if (module) {
    const hasAccess = canViewModule(user.role, module);

    if (!hasAccess) {
      console.warn(`🛑 Acesso negado para a tela [${module}] com a role [${user.role}]`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}