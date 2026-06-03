import React from 'react';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import type { Application } from '../types/applications.types';

interface ApplicationCardProps {
  app: Application;
  onViewDetails?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  app,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const getCriticidadeColor = (crit: string) => {
    switch (crit.toUpperCase()) {
      case 'CRITICA':
      case 'CRÍTICA':
        return 'bg-red-950/40 text-red-400 border border-red-800/50';

      case 'ALTA':
        return 'bg-orange-950/40 text-orange-400 border border-orange-800/50';

      case 'MEDIA':
      case 'MÉDIA':
        return 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/50';

      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="group relative flex h-full min-h-[390px] flex-col rounded-2xl border border-slate-800/70 bg-gradient-to-b from-[#0c1224] to-[#09101f] p-6 shadow-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-emerald-500/10">
      
      {/* HEADER */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-3xl font-black leading-tight text-white">
          {app.nome}
        </h3>

        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider ${getCriticidadeColor(
            app.criticidade,
          )}`}
        >
          {app.criticidade}
        </span>
      </div>

      {/* DESCRIÇÃO */}
      <p className="mb-8 min-h-[60px] text-base leading-relaxed text-slate-400">
        {app.descricao || 'Nenhuma descrição cadastrada.'}
      </p>

      {/* ESPAÇADOR */}
      <div className="flex-1" />

      {/* INFO */}
      <div className="space-y-3 border-t border-slate-800/60 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Categoria
          </span>

          <span className="truncate text-sm font-semibold uppercase text-white">
            {app.categoria}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Responsável
          </span>

          <span className="truncate text-sm font-semibold uppercase text-white">
            {app.responsavelTecnico || 'N/A'}
          </span>
        </div>
      </div>

      {/* BOTÕES */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => onViewDetails?.(app.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-slate-700"
        >
          <Eye size={16} />
          Detalhes
        </button>

        <button
          onClick={() => onEdit?.(app.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-950 transition-all hover:bg-emerald-400"
        >
          <Pencil size={16} />
          Editar
        </button>

        <button
          onClick={() => onDelete?.(app.id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};