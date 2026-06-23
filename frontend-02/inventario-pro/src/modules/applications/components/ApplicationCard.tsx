// src/modules/applications/components/ApplicationCard.tsx
import React from 'react';
import { ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react';

import type { CreateApplicationDto } from '../types/applications.types';

// Garantimos que a extensão reconheça o ID e campos adicionais
export interface Application extends CreateApplicationDto {
  id: number; 
  ambiente?: string; 
  porta?: string;
  bancoDados?: string;
}

interface ApplicationCardProps {
  app: Application; 
  opened: boolean;
  isAdmin: boolean; // 🟢 Recebe o booleano 'canModifyApps' calculado pelo componente pai
  onSelect: () => void;
  onNavigateDetails: (id: number) => void;
  onNavigateEdit: (id: number) => void;
  onDelete: (id: number) => void;
  getCriticidadeColor: (crit?: string) => string;
  getCategoriaIcon: (cat?: string) => React.ReactNode;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  app,
  opened,
  isAdmin, // 🟢 Atua como o sinal verde de escrita vindo do mapa de permissões centralizado
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
      /* 🟢 CORREÇÃO DE ALTURA E PADDING:
         - Adicionado 'h-[120px]' fixo para remover a barriga e o espaço vertical morto.
         - Reduzido o padding interno de 'p-5' para 'p-3.5' para achatar a estrutura.
      */
      className={`relative overflow-hidden rounded-2xl border bg-[#0b1120] p-3.5 h-[120px] transition-all duration-300 hover:bg-slate-900 cursor-pointer select-none flex flex-col justify-between ${
        opened ? 'border-cyan-500 bg-[#0c1324] ring-2 ring-cyan-500/5' : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* HEADER COMPACTADO */}
      <div className="flex items-start justify-between min-w-0 w-full">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* 🟢 ÍCONE COMPACTO (h-9 w-9) */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            {getCategoriaIcon(app?.categoria)}
          </div>
          <div className="min-w-0 flex-1">
            {/* tracking-tight e leading-tight para manter nomes longos organizados */}
            <h2 className="text-base font-black leading-tight text-white truncate tracking-tight">{app?.nome || 'Sem nome'}</h2>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">{app?.sigla || '-'}</p>
          </div>
        </div>
        <ChevronRight className={`text-slate-600 transition-transform duration-300 flex-shrink-0 ml-1 mt-1 ${opened ? 'rotate-90' : ''}`} size={16} />
      </div>

      {/* PILLS / TAGS */}
      {/* 🟢 MARGEM AJUSTADA: Reduzido mt-4 para mt-1.5 para se encaixar na nova altura */}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-400 truncate max-w-[50%]">
          {app?.categoria || 'Não Definida'}
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest truncate max-w-[50%] ${getCriticidadeColor(app?.criticidade)}`}>
          {app?.criticidade || 'MEDIA'}
        </span>
      </div>

      {/* PAINEL DE AÇÕES FLUTUANTE ADAPTADO (IGUAL AO MODELO DE ATIVOS/RACKS) */}
      <div 
        className={`absolute inset-x-0 bottom-0 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ${
          opened ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* 🟢 CORREÇÃO DOS BOTÕES INTERNOS: 
           - Agora em grid de 3 colunas fluídas para preencher a base perfeitamente de canto a canto sem estufar.
        */}
        <div 
          className="grid grid-cols-3 gap-1.5 p-2 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão VER */}
          <button
            onClick={() => { if (app?.id) onNavigateDetails(app.id); }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-black uppercase tracking-normal transition cursor-pointer"
          >
            <Eye size={12} className="text-slate-400" />
            <span>VER</span>
          </button>

          {isAdmin ? (
            <button 
              onClick={() => { if (app?.id) onNavigateEdit(app.id); }} 
              className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-black uppercase tracking-normal transition cursor-pointer"
            >
              <Pencil size={11} className="text-cyan-400 group-hover:text-slate-950" />
              <span>ALT</span>
            </button>
          ) : (
            <div className="py-1.5 rounded-xl bg-slate-900/40 border border-slate-900/60 text-slate-600 text-[10px] font-black uppercase text-center opacity-40 select-none">
              Lock
            </div>
          )}

          {isAdmin ? (
            <button 
              onClick={() => { if (app?.id) onDelete(app.id); }} 
              className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-black uppercase tracking-normal transition cursor-pointer"
            >
              <Trash2 size={11} className="text-red-400 group-hover:text-white" />
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