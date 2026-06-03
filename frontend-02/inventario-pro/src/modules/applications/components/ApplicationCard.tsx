// src/modules/applications/components/ApplicationCard.tsx
// src/app/components/applications/ApplicationCard.tsx
import React from 'react';
import { ChevronRight, Eye, Pencil, Trash2, Database } from 'lucide-react';

// 1. Importamos os DTOs corretos que existem no seu arquivo
import type { CreateApplicationDto } from '../types/applications.types';

// 2. Criamos uma extensão que garante que o objeto vindo da API possua o ID
export interface Application extends CreateApplicationDto {
  id: number; 
  ambiente?: string; // Caso use estas propriedades na listagem
  porta?: string;
  bancoDados?: string;
}

interface ApplicationCardProps {
  app: Application; // <-- Agora o componente reconhece perfeitamente
  opened: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onNavigateDetails: (id: number) => void;
  onNavigateEdit: (id: number) => void;
  onDelete: (id: number) => void;
  getCriticidadeColor: (crit?: string) => string;
  getCategoriaIcon: (cat?: string) => React.ReactNode;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
// ... resto do código do card continua exatamente igual
  app,
  opened,
  isAdmin,
  onSelect,
  onNavigateDetails,
  onNavigateEdit,
  onDelete,
  getCriticidadeColor,
  getCategoriaIcon,
}) => {
  return (
    <div
      onClick={onSelect}
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1120] p-6 transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900 cursor-pointer min-h-[320px]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            {getCategoriaIcon(app.categoria)}
          </div>
          <div>
            <h2 className="text-2xl font-black leading-tight text-white">{app.nome}</h2>
            <p className="mt-1 text-sm uppercase tracking-widest text-slate-500">{app.sigla}</p>
          </div>
        </div>
        <ChevronRight className={`text-slate-600 transition-transform duration-300 ${opened ? 'rotate-90' : ''}`} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
          {app.categoria}
        </span>
        <span className={`rounded-full border px-4 py-1 text-xs font-black uppercase tracking-widest ${getCriticidadeColor(app.criticidade)}`}>
          {app.criticidade}
        </span>
      </div>

      <div className="mt-10 space-y-5">
        <div className="flex items-center justify-between"><span className="text-slate-500">Ambiente</span><div className="font-bold text-slate-200">{app.ambiente || '-'}</div></div>
        <div className="flex items-center justify-between"><span className="text-slate-500">Porta</span><div className="font-bold text-slate-200">{app.porta || '-'}</div></div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Banco</span>
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Database size={15} className="text-violet-400" />
            {app.bancoDados || '-'}
          </div>
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ${opened ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigateDetails(app.id); }}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
          >
            <div className="flex items-center justify-center gap-2"><Eye size={16} /> Detalhes</div>
          </button>
          {isAdmin && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onNavigateEdit(app.id); }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-400"><Pencil size={18} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(app.id); }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400"><Trash2 size={18} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};