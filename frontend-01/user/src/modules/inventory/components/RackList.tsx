// src/modules/inventory/components/RackList.tsx

import { useEffect, useState } from 'react';

interface Ativo {
  id: number;
  tagPatrimonial: string;
  modelo: string;
}

interface Rack {
  id: string;
  nome: string;
  localizacao: string;
  capacidade: number;
  ativos: Ativo[];
}

// Adicionamos a interface para as props
interface RackListProps {
  onEdit: (id: string) => void;
}

export function RackList({ onEdit }: RackListProps) {
  const [racks, setRacks] = useState<Rack[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/hardware/racks')
      .then(res => res.json())
      .then(data => setRacks(data))
      .catch(err => console.error("Erro ao carregar racks:", err));
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {racks.map(rack => (
        <div 
          key={rack.id} 
          onClick={() => onEdit(rack.id)} // Aciona a navegação ao clicar
          className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all group"
        >
          <div className="bg-slate-800 p-4 group-hover:bg-slate-700 transition-colors">
            <h3 className="text-white font-bold text-lg">{rack.nome}</h3>
            <p className="text-slate-400 text-sm">{rack.localizacao || 'Sem localização'}</p>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between mb-4 text-sm font-medium">
              <span className="text-slate-500">Capacidade: {rack.capacidade}U</span>
              <span className="text-blue-600 font-semibold">{rack.ativos.length} ativos instalados</span>
            </div>

            <ul className="space-y-2">
              {rack.ativos.length > 0 ? (
                rack.ativos.map(ativo => (
                  <li key={ativo.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 flex justify-between">
                    <span className="font-semibold text-slate-700">{ativo.tagPatrimonial}</span>
                    <span className="text-slate-500">{ativo.modelo}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-400 italic py-2">Nenhum ativo neste rack</li>
              )}
            </ul>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
               <span className="text-blue-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                 Clique para gerenciar ativos
               </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}