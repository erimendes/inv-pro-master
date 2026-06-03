import Logo from './Logo';
import Navbar from './Navbar';
import UserMenu from './UserMenu';

import { useAuth } from '../../../modules/auth/context/AuthContext';

export default function Header() {
  const { user } = useAuth();

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

        {/* Só mostra menu se logado */}
        {user && <Navbar />}

        {/* Só mostra user menu se logado */}
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