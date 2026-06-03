import React, { useState, useEffect } from 'react';
import { useRacks } from '../hooks/useRacks';
import RackCardView from '../components/RackCardView';

interface RackListPageProps {
  onViewRack: (id: string) => void;
  onEditRack: (id: string) => void;
}

const RackListPage = ({ onViewRack, onEditRack }: RackListPageProps) => {
  const { racks, loading, error } = useRacks();
  const [searchTerm, setSearchTerm] = useState('');

  // DEBUG: Monitoramento de dados no console do navegador
  useEffect(() => {
    if (racks) {
      console.log("=== DEBUG RACKS LOADED ===");
      racks.forEach(r => {
        console.log(`Rack: ${r.nome} | Ativos no Array: ${r.ativos?.length || 0}`);
      });
    }
  }, [racks]);

  // Filtro de busca (Nome ou Localização)
  const filteredRacks = racks?.filter(rack => 
    rack.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rack.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-blue-500 animate-pulse font-black uppercase tracking-widest text-sm">
          Sincronizando Datacenter...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 m-6 bg-red-900/10 border border-red-500/20 rounded-2xl text-center">
        <h2 className="text-red-500 font-black uppercase text-sm mb-2">Erro de Barramento</h2>
        <p className="text-slate-400 text-xs italic font-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho de Gestão */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            Rack <span className="text-blue-500 italic">Inventory</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
            Gestão de Ativos de Infraestrutura
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Campo de Busca */}
          <div className="relative">
            <input 
              type="text"
              placeholder="BUSCAR RACK OU LOCAL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-[10px] font-bold text-white outline-none focus:border-blue-500 w-64 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Contador de Ativos Online */}
          <div className="bg-blue-600/10 px-4 py-2 rounded-lg border border-blue-500/20 text-right min-w-[100px]">
            <span className="text-blue-500 text-[9px] font-black block leading-none mb-1">UNIDADES</span>
            <span className="text-white font-mono font-bold text-xl leading-none">
              {filteredRacks?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Visualização */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
        {filteredRacks && filteredRacks.length > 0 ? (
          filteredRacks.map((rack) => (
            <RackCardView 
              key={rack.id} 
              rack={rack}
              onView={onViewRack}
              onEdit={onEditRack}
            />
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <span className="text-slate-800 text-5xl mb-4 opacity-20">RACK_EMPTY</span>
            <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">
              Nenhum gabinete encontrado nos registros
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RackListPage;