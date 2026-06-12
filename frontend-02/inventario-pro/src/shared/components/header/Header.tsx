import Logo from './Logo';
import Navbar from './Navbar';
import UserMenu from './UserMenu';

import { useAuth } from '../../../modules/auth/context/AuthContext';
import { checkIsAdmin } from '../../../shared/constants/roles'; // 🔄 Importando o nosso atalho do mapa central

export default function Header() {
  const { user } = useAuth();
  
  // 🎯 AGORA É DINÂMICO: Retorna true para ADMIN, SUPER_ADMIN, ADMIN_INFRA, MANAGER_INFRA, etc.
  const hasAdminAccess = checkIsAdmin(user?.role);

  return (
    <header
      className="
        h-20
        border-b
        border-white/5
        bg-slate-950/70
        backdrop-blur-xl
        sticky
        top-0
        z-50
      "
    >
      <div
        className="
          max-w-7xl
          h-full
          mx-auto
          px-8
          flex
          items-center
          justify-between
        "
      >

        <Logo />

        {/* 🔄 CORREÇÃO: Mostra o menu superior se o usuário tiver qualquer perfil administrativo liberado no mapa */}
        {user && hasAdminAccess && <Navbar />}

        {/* Só mostra user menu se logado (Mantém a foto e botão Sair do usuário comum) */}
        {user ? (
          <UserMenu />
        ) : (
          <div className="text-sm text-slate-500">
            Infrastructure Platform
          </div>
        )}

      </div>
    </header>
  );
}