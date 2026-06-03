import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Server, Network, Box, AlertCircle, Edit3 } from 'lucide-react';

interface Props {
  assetId?: string;
  onBack: () => void;
  onEdit: (asset: any) => void; // Adicionado para permitir a navegação para edição
}

export default function AssetDetailsPage({ assetId, onBack, onEdit }: Props) {
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:3000/hardware/assets/${assetId}`);
        
        if (!res.ok) {
          throw new Error(`Erro ao localizar ativo ID: ${assetId}`);
        }

        const data = await res.json();
        setAsset(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (assetId) load();
  }, [assetId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-emerald-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <AlertCircle size={48} className="text-emerald-500/50 mb-4" />
      <h2 className="text-2xl font-black mb-4 uppercase italic">Ops! Ativo não encontrado</h2>
      <p className="text-slate-500 mb-8">{error}</p>
      <button onClick={onBack} className="bg-emerald-500 text-black px-8 py-3 rounded-full font-bold uppercase text-xs">
        Voltar para a Lista
      </button>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.2em]">
          <ArrowLeft size={14} /> Voltar para lista
        </button>

        {/* BOTÃO DE EDIÇÃO */}
        <button 
          onClick={() => onEdit(asset)}
          className="flex items-center gap-2 bg-white/5 hover:bg-emerald-500 text-slate-400 hover:text-black px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
        >
          <Edit3 size={14} /> Editar Ativo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                {asset.hostname}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                {asset.tipo}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 border-t border-white/5 pt-8">
            <div className="flex gap-4">
              <div className="p-3 bg-white/5 rounded-2xl h-fit text-emerald-500"><Server size={24} /></div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Hardware</p>
                <p className="text-slate-200 font-medium">{asset.hardware || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-white/5 rounded-2xl h-fit text-blue-500"><Network size={24} /></div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">IP de Rede</p>
                <p className="text-slate-200 font-mono">{asset.ipRede || 'Sem IP configurado'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
              <Box size={16} className="text-emerald-500" /> Localização
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Data Center / Rack</p>
                <p className="text-emerald-400 font-bold text-sm uppercase">{asset.rack?.nome || 'Não Alocado'}</p>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Unidades</p>
                  <p className="text-white text-xl font-black">{asset.tamanhoU}U</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Slot</p>
                  <p className="text-white text-xl font-black">#{asset.posicaoRack || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}