// src/app/components/assets/AssetRow.tsx
import React from 'react';
import { ChevronDown, ChevronUp, Eye, Pencil, Trash2, Monitor, Laptop, Server, Router, Network, HardDrive } from 'lucide-react';
import type { Asset, AssetTipo } from '../types/asset.types'; // 💡 Ajuste o caminho do import se necessário
import { InfoCard } from './InfoCard';

interface AssetRowProps {
  asset: Asset;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  onDelete: (id: number) => void;
}

export const AssetRow: React.FC<AssetRowProps> = ({ asset, isOpen, onToggle, onNavigate, onDelete }) => {
  function getAssetIcon(tipo?: AssetTipo) {
    switch (tipo) {
      case 'LAPTOP': return <Laptop size={22} />;
      case 'DESKTOP': return <Monitor size={22} />;
      case 'SERVIDOR_FISICO':
      case 'SERVIDOR_VIRTUAL': return <Server size={22} />;
      case 'ROTEADOR': return <Router size={22} />;
      case 'SWITCH': return <Network size={22} />;
      case 'STORAGE': return <HardDrive size={22} />;
      default: return <Monitor size={22} />;
    }
  }

  // Mapeamento de cores baseado nos seus status reais
  function getStatusBadgeClass(status?: string) {
    switch (status) {
      case 'DISPONIVEL': return 'bg-emerald-500/20 text-emerald-400';
      case 'EM_USO': return 'bg-blue-500/20 text-blue-400';
      case 'MANUTENCAO': return 'bg-amber-500/20 text-amber-400';
      case 'DESCARTADO': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }

  return (
    <div className="border-b border-white/5 last:border-none">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left transition hover:bg-white/5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
              {getAssetIcon(asset.tipo)}
            </div>
            <div>
              <div className="text-lg font-bold text-white">{asset.hostname || '-'}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-lg bg-violet-500/20 px-2 py-1 text-xs font-semibold text-violet-400">
                  {asset.tipo || '-'}
                </span>
                <span className="text-sm text-slate-400">
                  {asset.fabricante || '-'} {asset.modelo || ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className={`rounded-xl px-3 py-2 text-xs font-bold ${getStatusBadgeClass(asset.status)}`}>
              {asset.status || '-'}
            </div>
            {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/5 bg-black/20 px-6 py-5">
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard label="IP" value={asset.ipRede} />
            <InfoCard label="Sistema" value={asset.sistOper} />
            <InfoCard label="Fabricante" value={`${asset.fabricante || '-'} ${asset.modelo || ''}`} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate(`/assets/${asset.id}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/30"
            >
              <Eye size={16} /> Detalhes
            </button>
            <button
              onClick={() => onNavigate(`/assets/${asset.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-sm font-bold text-blue-400 transition hover:bg-blue-500/30"
            >
              <Pencil size={16} /> Editar
            </button>
            <button
              onClick={() => onDelete(asset.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/30"
            >
              <Trash2 size={16} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};