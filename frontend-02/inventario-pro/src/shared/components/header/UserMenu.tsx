import { useAuth } from '../../../modules/auth/context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();

  // Gera iniciais de forma segura
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <div
      className="
        ml-2
        flex items-center gap-3
        bg-slate-900/70
        border border-white/5
        px-3 py-2
        rounded-2xl
      "
    >
      {/* Avatar com iniciais */}
      <div
        className="
          w-11 h-11
          rounded-full
          bg-violet-500/20
          text-violet-400
          flex items-center justify-center
          font-black text-sm
        "
      >
        {initials}
      </div>

      {/* Nome e função */}
      <div className="hidden md:block">
        <p className="text-sm font-bold text-white">
          {user?.name}
        </p>
        <p className="text-xs text-slate-500">
          {user?.role}
        </p>
      </div>

      {/* Botão de logout */}
      <button
        onClick={logout}
        className="
          px-4 py-2
          rounded-xl
          bg-red-500/10
          border border-red-500/20
          text-red-400 text-sm font-bold
          hover:bg-red-500/20
        "
      >
        Sair
      </button>
    </div>
  );
}
