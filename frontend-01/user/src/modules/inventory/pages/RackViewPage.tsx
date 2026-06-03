import { useState, useEffect } from 'react';
import { ArrowLeft, Cpu, Server, Info } from 'lucide-react';
import type { Ativo } from '../components/DraggableItem';

export default function RackViewPage({ rackId, onBack }: { rackId: string; onBack: () => void }) {
  const [rackData, setRackData] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<Ativo | null>(null);
  const [layout, setLayout] = useState<Record<number, Ativo>>({});

  useEffect(() => {
    fetch(`http://localhost:3000/hardware/racks`)
      .then(res => res.json())
      .then(data => {
        const rack = data.find((r: any) => r.id === rackId);
        setRackData(rack);
        if (rack?.ativos) {
          const map: Record<number, Ativo> = {};
          rack.ativos.forEach((a: Ativo, i: number) => { map[24 - i] = a; });
          setLayout(map);
        }
      });
  }, [rackId]);

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white">
      <button onClick={onBack} className="text-emerald-500 font-bold flex items-center gap-2 mb-8">
        <ArrowLeft size={18} /> VOLTAR PARA LISTAGEM
      </button>

      <div className="grid grid-cols-12 gap-8">
        {/* Topologia do Rack (Leitura) */}
        <div className="col-span-7 bg-slate-900/40 rounded-[2rem] p-8 border border-white/5">
          <h2 className="text-center text-slate-500 font-black mb-6 uppercase tracking-widest text-xs">Vista Frontal</h2>
          <div className="space-y-1.5 max-w-md mx-auto">
            {Array.from({ length: 24 }, (_, i) => 24 - i).map(u => (
              <div 
                key={u}
                onClick={() => layout[u] && setSelectedAsset(layout[u])}
                className={`h-10 border rounded flex items-center px-4 transition-all ${
                  layout[u] 
                    ? 'border-blue-500/50 bg-blue-500/10 cursor-pointer hover:bg-blue-500/20' 
                    : 'border-white/5 bg-transparent opacity-20'
                } ${selectedAsset?.id === layout[u]?.id && layout[u] ? 'ring-2 ring-blue-400' : ''}`}
              >
                <span className="text-[10px] font-mono text-slate-500 w-6">U{u}</span>
                {layout[u] && (
                  <div className="flex items-center gap-3 ml-4">
                    {layout[u].tipo === 'SWITCH' ? <Cpu size={14}/> : <Server size={14}/>}
                    <span className="text-xs font-medium">{layout[u].modelo}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Painel de Detalhes do Ativo */}
        <aside className="col-span-5">
          {selectedAsset ? (
            <div className="bg-slate-900 rounded-[2rem] p-8 border border-blue-500/30 shadow-2xl sticky top-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-500 p-3 rounded-2xl text-slate-900">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-tighter">Detalhes do Ativo</h3>
                  <p className="text-blue-400 text-xs font-mono">{selectedAsset.tagPatrimonial}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Modelo do Equipamento</label>
                  <p className="text-lg text-white font-medium">{selectedAsset.modelo}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <label className="text-[10px] uppercase text-slate-500 font-black block mb-1">Tipo</label>
                    <span className="text-emerald-400 font-bold">{selectedAsset.tipo}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <label className="text-[10px] uppercase text-slate-500 font-black block mb-1">Status</label>
                    <span className="text-blue-400 font-bold">ATIVO</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Este ativo está localizado fisicamente no Rack <strong>{rackData?.nome}</strong>. 
                     Clique em editar na página anterior para alterar sua posição.
                   </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center">
              <Info size={48} className="mb-4 opacity-20" />
              <p>Selecione um ativo no rack para visualizar todas as especificações técnicas.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
