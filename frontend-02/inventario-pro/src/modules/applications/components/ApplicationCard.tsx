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
      className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120] p-5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            {/* 🛡️ Fallback seguro caso categoria venha indefinida da API */}
            {getCategoriaIcon(app?.categoria)}
          </div>
          <div>
            <h2 className="text-xl font-black leading-tight text-white">{app?.nome || 'Sem nome'}</h2>
            <p className="text-xs uppercase tracking-widest text-slate-500">{app?.sigla || '-'}</p>
          </div>
        </div>
        <ChevronRight className={`text-slate-600 transition-transform duration-300 ${opened ? 'rotate-90' : ''}`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
          {app?.categoria || 'Não Definida'}
        </span>
        <span className={`rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-widest ${getCriticidadeColor(app?.criticidade)}`}>
          {app?.criticidade || 'MEDIA'}
        </span>
      </div>

      {/* Espaçamento extra apenas para não colar o painel flutuante se estiver aberto */}
      <div className="pb-2"></div>

      {/* PAINEL DE AÇÕES FLUTUANTE (ABRE NO CLIQUE) */}
      <div 
        className={`absolute inset-x-0 bottom-0 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ${
          opened ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center justify-center gap-3 p-3">
          
          {/* Botão VER */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (app?.id) onNavigateDetails(app.id); 
            }}
            className="h-9 w-[76px] rounded-full border border-emerald-500/30 bg-transparent text-[11px] font-black text-emerald-400 transition hover:bg-emerald-500/10"
          >
            <div className="flex items-center justify-center gap-1">
              <Eye size={14} className="text-emerald-400" />
              <span>VER</span>
            </div>
          </button>

          {/* 🔄 BOTÕES DE ESCRITA: Exibidos de forma reativa caso o pai libere via isAdmin */}
          {isAdmin && (
            <>
              {/* Botão ALT (Corrigido!) */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (app?.id) onNavigateEdit(app.id); 
                }} 
                className="h-9 w-[76px] rounded-full border border-blue-500/30 bg-transparent text-[11px] font-black text-blue-400 transition hover:bg-blue-500/10"
              >
                <div className="flex items-center justify-center gap-1">
                  <Pencil size={13} className="text-blue-400" />
                  <span>ALT</span>
                </div>
              </button>

              {/* Botão DEL */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (app?.id) onDelete(app.id); 
                }} 
                className="h-9 w-[76px] rounded-full border border-red-500/30 bg-transparent text-[11px] font-black text-red-400 transition hover:bg-red-400/10"
              >
                <div className="flex items-center justify-center gap-1">
                  <Trash2 size={14} className="text-red-400" />
                  <span>DEL</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};