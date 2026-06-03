import { useState } from 'react';
import { Code, Key, Cloud, ShieldCheck, Plus, Search, Terminal, ExternalLink } from 'lucide-react';

const SOFTWARE_MOCK = [
  { id: 1, name: 'Windows 11 Pro', type: 'OS', license: 'OEM', expiry: 'Perpétua', status: 'Ativo' },
  { id: 2, name: 'Adobe Creative Cloud', type: 'SaaS', license: 'Subscription', expiry: '2026-12-01', status: 'Ativo' },
  { id: 3, name: 'JetBrains All Products Pack', type: 'IDE', license: 'User-based', expiry: '2027-01-15', status: 'Renovação Próxima' },
  { id: 4, name: 'Docker Desktop Business', type: 'Container', license: 'Enterprise', expiry: '2026-08-20', status: 'Ativo' },
];

export default function SoftwarePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="text-[rgb(var(--primary))]" size={24} />
            <span className="text-[10px] font-bold text-[rgb(var(--primary))] uppercase tracking-[0.4em]">Logical Assets</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Software & Licenças</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[rgb(var(--primary))] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar licença ou app..."
              className="bg-slate-900/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[rgb(var(--primary))/30] w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[rgb(var(--primary))] text-slate-950 px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[rgb(var(--primary))/10]">
            <Plus size={20} />
            Nova Licença
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'SaaS / Cloud', icon: Cloud, count: 8, color: 'text-blue-400' },
          { label: 'Licenças Ativas', icon: ShieldCheck, count: 24, color: 'text-green-400' },
          { label: 'Desenvolvimento', icon: Code, count: 15, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} />
             </div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${stat.color}`}>{stat.label}</p>
            <p className="text-4xl font-black text-white">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Software</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Modelo de Licença</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Expiração</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {SOFTWARE_MOCK.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-[rgb(var(--primary))/20] transition-colors">
                       <Key size={16} className="text-slate-400 group-hover:text-[rgb(var(--primary))]" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs text-slate-400 font-medium">{item.type}</td>
                <td className="px-6 py-5 text-xs text-slate-500 font-mono italic">{item.license}</td>
                <td className="px-6 py-5 text-sm text-slate-300">{item.expiry}</td>
                <td className="px-6 py-5 text-right">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                    item.status === 'Ativo' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
