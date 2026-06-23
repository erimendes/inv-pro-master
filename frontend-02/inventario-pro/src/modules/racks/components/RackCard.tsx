// src/modules/racks/components/RackCard.tsx
import React from 'react';
import { Server, ChevronUp, ChevronDown, MapPin, Layers, Eye, Pencil, Trash2 } from 'lucide-react';
import type { Rack } from '../types/rack.types';
import { InfoRow } from './InfoRow';

interface RackCardProps {
  rack: Rack;
  isOpened: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  onDelete: (id: string) => void;
}

export const RackCard: React.FC<RackCardProps> = ({
  rack,
  isOpened,
  onToggle,
  onNavigate,
  onDelete,
}) => {
  return (
    <div
      onClick={onToggle}
      /* 🟢 AJUSTE DA ALTURA: 
         - Aumentado de 'h-[125px]' para 'h-[138px]' para dar espaço vertical aos botões.
         - Mantido o 'p-3.5' para o conteúdo interno respirar bem. 
      */
      className={`group p-3.5 rounded-2xl bg-[#090d1a] border transition-all flex flex-col justify-between h-[138px] shadow-lg select-none cursor-pointer ${
        isOpened ? 'border-cyan-500 bg-[#0c1324] ring-2 ring-cyan-500/5' : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* HEADER */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
              <Server size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-white truncate leading-tight">{rack.nome}</h2>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 truncate">
                Rack de infraestrutura
              </p>
            </div>
          </div>
          <div className="text-slate-500 flex-shrink-0 ml-2 mt-1">
            {isOpened ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {/* INFO */}
        <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
          <InfoRow
            label="Localização"
            value={rack.localizacao || '-'}
            icon={<MapPin size={12} className="text-cyan-400" />}
          />
          <InfoRow
            label="Capacidade"
            value={`${rack.capacidade}U`}
            icon={<Layers size={12} className="text-cyan-400" />}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center w-full mt-auto">
        {isOpened && (
          /* 🟢 O grid se mantém perfeito, agora com uma folga vertical excelente no fundo do card */
          <div 
            className="grid grid-cols-3 gap-1.5 w-full pt-1.5"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* BOTÃO VER */}
            <button
              onClick={() => onNavigate(`/racks/${rack.id}`)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-black uppercase tracking-normal transition"
            >
              <Eye size={12} />
              Ver
            </button>

            {/* BOTÃO ALTERAR (ALT) */}
            <button
              onClick={() => onNavigate(`/racks/${rack.id}/edit`)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 w-full rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-black uppercase tracking-normal transition"
            >
              <Pencil size={11} />
              Alt
            </button>

            {/* BOTÃO DELETAR (DEL) */}
            <button
              onClick={() => onDelete(String(rack.id))}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 w-full rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-black uppercase tracking-normal transition"
            >
              <Trash2 size={11} />
              Del
            </button>
          </div>
        )}
      </div>
    </div>
  );
};