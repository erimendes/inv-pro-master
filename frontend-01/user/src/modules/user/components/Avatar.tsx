import { useAuth } from '../../../app/providers/AuthContext';

export function Avatar() {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-800/40 border border-white/5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary))/20] border border-[rgb(var(--primary))/30] flex items-center justify-center text-[10px] font-black text-[rgb(var(--primary))] uppercase">
        {initials}
      </div>
      <div className="hidden lg:block">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Operador</p>
        <p className="text-xs text-white font-medium leading-none">{user?.name || 'Visitante'}</p>
      </div>
    </div>
  );
}
