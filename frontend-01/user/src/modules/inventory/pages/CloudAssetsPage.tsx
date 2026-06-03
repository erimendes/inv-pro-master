import { useState } from 'react';
import { Cloud, Globe, Cpu, HardDrive, Plus, Search, Activity, Box } from 'lucide-react';

const CLOUD_ASSETS_MOCK = [
  { id: 1, name: 'AWS-EC2-PROD-API', provider: 'AWS', type: 'Instância', specs: 't3.medium', region: 'us-east-1', status: 'Running' },
  { id: 2, name: 'DO-K8S-CLUSTER-01', provider: 'DigitalOcean', type: 'Cluster', specs: '3 Nodes', region: 'nyc3', status: 'Healthy' },
  { id: 3, name: 'VM-DEBIAN-MONITOR', provider: 'Local Proxmox', type: 'VM', specs: '2 vCPU / 4GB', region: 'Local', status: 'Running' },
  { id: 4, name: 'AZURE-DB-REPLICA', provider: 'Azure', type: 'Database', specs: 'Standard_D2s_v3', region: 'brazilsouth', status: 'Stopped' },
];

export default function CloudAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-[rgb(var(--primary))]" size={24} />
            <span className="text-[10px] font-bold text-[rgb(var(--primary))] uppercase tracking-[0.4em]">Virtual Infrastructure</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Nuvem & Virtualização</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[rgb(var(--primary))] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar instância ou IP..."
              className="bg-slate-900/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[rgb(var(--primary))/30] w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[rgb(var(--primary))] text-slate-950 px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[rgb(var(--primary))/10]">
            <Plus size={20} />
            Nova Instância
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Instâncias', icon: Cpu, count: 14, color: 'text-orange-400' },
          { label: 'Sistemas Ativos', icon: Activity, count: 8, color: 'text-cyan-400' },
          { label: 'Volumes/Storage', icon: HardDrive, count: 22, color: 'text-amber-400' },
          { label: 'Containers', icon: Box, count: 45, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-[28px] group hover:border-[rgb(var(--primary))/20] transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2 rounded-lg bg-slate-800 ${stat.color}`}>
                  <stat.icon size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-3xl font-black text-white">{stat.count}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Recurso</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Provedor</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuração</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Região</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {CLOUD_ASSETS_MOCK.map((asset) => (
              <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">{asset.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{asset.type}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                      <Cloud size={14} className="text-slate-500" />
                      <span className="text-xs text-slate-400 font-medium">{asset.provider}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-xs text-slate-500 font-mono italic">{asset.specs}</td>
                <td className="px-6 py-5 text-xs text-slate-400">{asset.region}</td>
                <td className="px-6 py-5 text-right">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                    asset.status === 'Running' || asset.status === 'Healthy' 
                    ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'bg-red-500/10 text-red-500'
                  }`}>
                    {asset.status}
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
