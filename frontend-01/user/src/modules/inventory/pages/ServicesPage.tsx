import { useState } from 'react';
import { BookOpen, LifeBuoy, FileText, Share2, Plus, Search, Bookmark, ChevronRight } from 'lucide-react';

const SERVICES_MOCK = [
  { id: 1, name: 'Monitoramento Zabbix', category: 'Infraestrutura', sla: '99.9%', status: 'Operacional' },
  { id: 2, name: 'Pipeline GitLab CI/CD', category: 'DevOps', sla: '99.5%', status: 'Manutenção' },
  { id: 3, name: 'Backup de Banco de Dados', category: 'Segurança', sla: '100%', status: 'Operacional' },
];

const DOCS_MOCK = [
  { title: 'Topologia de Rede - Data Center A', author: 'Francisco Rabelo', date: '2026-04-15' },
  { title: 'Procedimento de Restore Postgre', author: 'IT Team', date: '2026-03-20' },
  { title: 'Configuração Mesh TP-Link Deco', author: 'Francisco Rabelo', date: '2026-02-10' },
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-[rgb(var(--primary))]" size={24} />
            <span className="text-[10px] font-bold text-[rgb(var(--primary))] uppercase tracking-[0.4em]">Service Desk & Wiki</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Serviços e Docs</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-900/50 border border-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
            <Plus size={20} />
            Novo Registro
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUNA ESQUERDA: CATÁLOGO DE SERVIÇOS */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LifeBuoy size={18} className="text-[rgb(var(--primary))]" />
            Catálogo de Serviços Ativos
          </h3>
          
          <div className="grid gap-4">
            {SERVICES_MOCK.map((service) => (
              <div key={service.id} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:border-[rgb(var(--primary))/20] transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-[rgb(var(--primary))] transition-colors">{service.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{service.category} • SLA {service.sla}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    service.status === 'Operacional' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: DOCUMENTAÇÃO (WIKI) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={18} className="text-[rgb(var(--primary))]" />
              Base de Conhecimento
            </h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar manuais..."
                className="w-full bg-black/30 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[rgb(var(--primary))/30]"
              />
            </div>

            <div className="space-y-4">
              {DOCS_MOCK.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Bookmark size={14} className="text-slate-600 group-hover:text-[rgb(var(--primary))]" />
                    <div>
                      <p className="text-xs font-semibold text-slate-300">{doc.title}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Editado em {doc.date}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-white" />
                </div>
              ))}
            </div>

            <button className="w-full mt-8 flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-slate-500 hover:text-[rgb(var(--primary))] hover:border-[rgb(var(--primary))/30] transition-all uppercase tracking-widest">
              <Share2 size={12} />
              Ver Documentação Completa
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
