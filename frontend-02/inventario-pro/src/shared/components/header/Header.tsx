// src/shared/components/header/Header.tsx
import Logo from './Logo';
import Navbar from './Navbar';
import UserMenu from './UserMenu';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { checkIsAdmin } from '../../../shared/constants/roles'; 

export default function Header() {
  const { user } = useAuth();
  const hasAdminAccess = checkIsAdmin(user?.role);

  return (
    <header className="h-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">

        {/* 🟢 CORREÇÃO CRÍTICA: Envolvido o componente Logo em uma div com 'whitespace-nowrap' e 'flex-shrink-0'
            Isso proíbe o navegador de quebrar o texto "Inventário ProMaster" em duas linhas, 
            mantendo-o sempre reto e idêntico à imagem 1. */}
        <div className="whitespace-nowrap flex-shrink-0">
          <Logo />
        </div>

        {/* O Navbar agora vai respeitar o espaço da logo e sumir/encolher no tempo certo */}
        {user && hasAdminAccess && <Navbar />}

        {user ? (
          <UserMenu />
        ) : (
          <div className="text-sm text-slate-500 whitespace-nowrap">Infrastructure Platform</div>
        )}

      </div>
    </header>
  );
}