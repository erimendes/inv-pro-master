import { useState } from 'react';
import { Monitor, MousePointer, Keyboard, Cable, Plus, Search, Filter } from 'lucide-react';

const ASSETS_MOCK = [
  { id: 1, name: 'Monitor Dell UltraSharp 27"', category: 'Periféricos', status: 'Em Uso', user: 'Francisco Rabelo' },
  { id: 2, name: 'Teclado Mecânico Keychron K2', category: 'Periféricos', status: 'Estoque', user: '-' },
  { id: 3, name: 'Cabo Fibra Óptica 10m', category: 'Infra', status: 'Disponível', user: '-' },
  { id: 4, name: 'Mouse Logitech MX Master 3', category: 'Periféricos', status: 'Em Uso', user: 'Admin' },
];

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Ativos Físicos</h1>
          <p className="text-slate-500 mt-2 font-medium">Controle de periféricos e suprimentos de TI.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[rgb(var(--primary))] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar ativo..."
              className="bg-slate-900/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[rgb(var(--primary))/30] w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[rgb(var(--primary))] text-slate-950 px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[rgb(var(--primary))/10]">
            <Plus size={20} />
            Novo Ativo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Monitores', icon: Monitor, count: 12 },
          { label: 'Mouses', icon: MousePointer, count: 45 },
          { label: 'Teclados', icon: Keyboard, count: 32 },
          { label: 'Cabos', icon: Cable, count: 128 },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-[24px] hover:bg-slate-900/60 transition-all group">
            <stat.icon className="text-slate-600 group-hover:text-[rgb(var(--primary))] transition-colors mb-4" size={24} />
            <p className="text-3xl font-black text-white">{stat.count}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ativo</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ASSETS_MOCK.map((asset) => (
              <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-[rgb(var(--primary))] transition-colors cursor-pointer">{asset.name}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md">{asset.category}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${asset.status === 'Em Uso' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs text-slate-300">{asset.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500 font-mono">{asset.user}</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-600 hover:text-white transition-colors">
                    <Filter size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
