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
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1120] px-6 pt-6 pb-8 cursor-pointer transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900 min-h-[200px]"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Server size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{rack.nome}</h2>
            <p className="mt-1 text-sm uppercase tracking-widest text-slate-500">
              Rack de infraestrutura
            </p>
          </div>
        </div>
        {isOpened ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
      </div>

      {/* INFO */}
      <div className="mt-5 space-y-3">
        <InfoRow
          label="Localização"
          value={rack.localizacao || '-'}
          icon={<MapPin size={15} className="text-cyan-400" />}
        />
        <InfoRow
          label="Capacidade"
          value={`${rack.capacidade}U`}
          icon={<Layers size={15} className="text-cyan-400" />}
        />
      </div>

      {/* ACTIONS */}
      <div
        className={`absolute inset-x-0 bottom-0 border-t border-slate-600 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ${
          isOpened ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/racks/${rack.id}`);
            }}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
          >
            <div className="flex items-center justify-center gap-2">
              <Eye size={16} /> Detalhes
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/racks/${rack.id}/edit`);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-400"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(rack.id);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};