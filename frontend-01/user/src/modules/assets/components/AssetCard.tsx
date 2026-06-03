// src/modules/assets/components/AssetCard.tsx
import { Edit3, Eye } from 'lucide-react'; // Importe os ícones

interface AssetCardProps {
  asset: any;
  onEdit?: (id: string) => void;
  onDetails?: (id: string) => void;
}

export function AssetCard({ asset, onEdit, onDetails }: AssetCardProps) {
  return (
    <div className="group relative bg-slate-900/50 rounded-3xl border border-white/5 p-6 hover:border-emerald-500/30 transition-all hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]">
      
      {/* BOTÕES DE AÇÃO (Aparecem no hover) */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={() => onDetails?.(asset.id)}
          className="p-2 bg-slate-800 hover:bg-emerald-500 text-slate-400 hover:text-black rounded-xl transition-all shadow-lg"
          title="Ver Detalhes"
        >
          <Eye size={16} />
        </button>
        <button 
          onClick={() => onEdit?.(asset.id)}
          className="p-2 bg-slate-800 hover:bg-white text-slate-400 hover:text-black rounded-xl transition-all shadow-lg"
          title="Editar Ativo"
        >
          <Edit3 size={16} />
        </button>
      </div>

      <span className="absolute top-4 left-6 text-[10px] font-bold bg-white/5 text-slate-400 px-2 py-1 rounded-lg uppercase">
        {asset.tipo}
      </span>

      <div className="mt-8"> {/* Espaço para não bater nos botões */}
        <h2 className="text-white font-bold text-xl mb-1 group-hover:text-emerald-400 transition-colors">
          {asset.hostname}
        </h2>

        <p className="text-slate-400 text-sm mb-4 truncate">
          {asset.hardware || 'Hardware não especificado'}
        </p>

        <div className="flex items-center gap-2 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
          <p className="text-emerald-500 font-mono text-xs font-bold">
            {asset.ipRede || 'Sem IP'}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Rack</p>
          <p className="text-xs text-slate-300">{asset.rack?.nome || '—'}</p>
        </div>
        {asset.posicaoRack && (
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Posição</p>
            <p className="text-xs text-slate-300 font-mono">U{asset.posicaoRack}</p>
          </div>
        )}
      </div>
    </div>
  );
}