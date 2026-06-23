// src/modules/users/components/UserCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // 🟢 Restaurado o hook de navegação
import { ChevronRight, Mail, Shield, Eye, Pencil, Trash2 } from 'lucide-react';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    username?: string;
  };
  opened: boolean;
  onToggle: () => void;
  onDelete?: (id: string) => void; // Apenas a deleção continua vindo do pai
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  opened,
  onToggle,
  onDelete,
}) => {
  const navigate = useNavigate(); // 🟢 Inicializado o navigate internamente

  return (
    <div
      onClick={onToggle}
      className={`relative overflow-hidden rounded-2xl border bg-[#0b1120] p-3.5 h-[120px] transition-all duration-300 hover:bg-slate-900 cursor-pointer select-none flex flex-col justify-between ${
        opened ? 'border-cyan-500 bg-[#0c1324] ring-2 ring-cyan-500/5' : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* HEADER COMPACTO */}
      <div className="flex items-start justify-between min-w-0 w-full">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Iniciais do nome */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-black text-xs uppercase">
            {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black text-white truncate tracking-tight">
              {user.name || 'Sem nome'}
            </h2>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">
              {user.username || 'user'}
            </p>
          </div>
        </div>
        <ChevronRight className={`text-slate-600 transition-transform duration-300 flex-shrink-0 ml-1 mt-1 ${opened ? 'rotate-90' : ''}`} size={16} />
      </div>

      {/* METADADOS / INFOS DO CARD */}
      <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <Mail size={11} className="text-cyan-400 shrink-0" />
          <span className="truncate font-semibold text-slate-300">{user.email}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Shield size={11} className="text-emerald-500 shrink-0" />
          <span className="font-black uppercase text-[9px] tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
            {user.role}
          </span>
        </div>
      </div>

      {/* PAINEL DE AÇÕES FLUTUANTE */}
      <div 
        className={`absolute inset-x-0 bottom-0 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ${
          opened ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div 
          className="grid grid-cols-3 gap-1.5 p-2 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão VER - 🟢 Corrigido para navegar diretamente de forma autônoma */}
          <button
            onClick={() => navigate(`/users/${user.id}`)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-black uppercase tracking-normal transition cursor-pointer"
          >
            <Eye size={12} className="text-slate-400" />
            <span>VER</span>
          </button>

          {/* Botão ALTERAR (ALT) - 🟢 Corrigido para navegar diretamente de forma autônoma */}
          <button
            onClick={() => navigate(`/users/${user.id}/edit`)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-black uppercase tracking-normal transition cursor-pointer"
          >
            <Pencil size={11} className="text-cyan-400" />
            <span>ALT</span>
          </button>

          {/* Botão DELETAR (DEL) */}
          {onDelete ? (
            <button 
              onClick={() => onDelete(user.id)} 
              className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-black uppercase tracking-normal transition cursor-pointer"
            >
              <Trash2 size={11} className="text-red-400" />
              <span>DEL</span>
            </button>
          ) : (
            <div className="py-1.5 rounded-xl bg-slate-900/40 border border-slate-900/60 text-slate-600 text-[10px] font-black uppercase text-center opacity-40 select-none">
              Lock
            </div>
          )}
        </div>
      </div>

    </div>
  );
};