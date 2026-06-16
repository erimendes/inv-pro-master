import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsService } from '../services/applications.service';
import { Layers3, ShieldAlert, Building2, Cpu, Globe, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { Pagination } from '../components/Pagination';

import { ApplicationCard, type Application } from '../components/ApplicationCard';
import type { SistemaCategoria, Criticidade } from '../types/applications.types';
import { canModifyModule } from '../../../shared/constants/roles'; // 🔄 Importa o validador dinâmico do mapa

export const ApplicationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 🎯 CORREÇÃO CRÍTICA: O useMemo + toUpperCase garante o cálculo em tempo real assim que o 'user' carrega em memória
  const canModifyApps = useMemo(() => {
    console.log("=== SCANNER DE PERMISSÃO ===");
    console.log("Tipo do dado do user.role:", typeof user?.role);
    console.log("Valor exato de user.role:", JSON.stringify(user?.role));
    
    if (!user?.role) return false;
  
    const roleLimpa = String(user.role).toUpperCase().trim();
    const resultado = canModifyModule(roleLimpa, 'applications');
    
    console.log(`Procurando por '${roleLimpa}' em 'applications'. Resultado:`, resultado);
    console.log("============================");
    
    return resultado;
  }, [user]);

  // Estados dos Filtros vindos da API
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategoria, setSelectedCategoria] = useState<SistemaCategoria | undefined>(undefined);
  const [selectedCriticidade, setSelectedCriticidade] = useState<Criticidade | undefined>(undefined);
  
  // Filtro de busca textual (Nome/Descrição)
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Estados de Controle Interno
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // PAGINAÇÃO: Limite de 3 itens por linha e max 2 linhas = 6 itens por página
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Busca na API quando os filtros estruturais mudam
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await applicationsService.findAll(selectedCategoria, selectedCriticidade);
        setApps(data);
        setCurrentPage(1); // Volta para a página 1 ao alterar filtros da API
        setSearchTerm(''); // Limpa o texto para evitar inconsistências
      } catch (error) {
        console.error('Erro ao buscar aplicações:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [selectedCategoria, selectedCriticidade]);

  // Aplica o filtro de texto localmente antes de paginar
  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) return apps;
    
    return apps.filter((app) => {
      const targetSearch = searchTerm.toLowerCase();
      return (
        app.nome?.toLowerCase().includes(targetSearch) ||
        app.descricao?.toLowerCase().includes(targetSearch)
      );
    });
  }, [apps, searchTerm]);

  // Lógica de Paginação Computada (Baseada na lista FILTRADA)
  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reseta a página ao digitar
    setSelectedCard(null);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    try {
      await applicationsService.remove(appToDelete);
      setApps((prev) => prev.filter((app) => app.id !== appToDelete));
      setDeleteModalOpen(false);
      setAppToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir aplicação:', error);
      alert('Não foi possível excluir a aplicação.');
    }
  };

  // Helpers de Estilização Dinâmica
  function getCriticidadeColor(criticidade?: string) {
    switch (criticidade) {
      case 'CRITICA': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'ALTA': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'MEDIA': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'BAIXA': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  }

  function getCategoriaIcon(categoria?: string) {
    switch (categoria) {
      case 'ADMINISTRATIVO': return <Building2 size={18} />;
      case 'OPERACIONAL': return <Cpu size={18} />;
      default: return <Globe size={18} />;
    }
  }

  return (
    <div className="w-full h-full flex border-2 border-green-500 gap-4 bg-[#070a13]">
      {/* SIDEBAR FILTERS */}
      <aside className="w-72 shrink-0 h-fit border-b md:border-b-0 bg-[#0a0f1d] p-5 md:border-r border-slate-900">
        <div>
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400">
            <Layers3 size={18} /> Catálogo
          </h2>
        </div>

        {/* FILTRO CATEGORIA */}
        <div className="flex flex-col gap-2 mb-6">
          <span className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</span>
          {[
            { label: 'TODOS', value: undefined },
            { label: 'ADMINISTRATIVO', value: 'ADMINISTRATIVO' },
            { label: 'OPERACIONAL', value: 'OPERACIONAL' },
          ].map((item) => {
            const active = selectedCategoria === item.value;
            return (
              <button
                key={item.label}
                onClick={() => setSelectedCategoria(item.value as any)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
                  active || (!selectedCategoria && item.label === 'TODOS')
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* FILTRO CRITICIDADE */}
        <div className="flex flex-col gap-2">
          <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ShieldAlert size={14} /> Criticidade
          </span>
          {['TODOS', 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA'].map((crit) => {
            const isTodos = crit === 'TODOS';
            const value = isTodos ? undefined : crit;
            const isActive = isTodos ? !selectedCriticidade : selectedCriticidade === crit;
            return (
              <button
                key={crit}
                onClick={() => setSelectedCriticidade(value as any)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                  isActive
                    ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:bg-slate-900'
                }`}
              >
                {crit}
              </button>
            );
          })}
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col justify-between">
        <div>
          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-3 text-5xl font-black tracking-tight text-white">Aplicações</h1>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
                  Categoria: {selectedCategoria || 'TODOS'}
                </span>
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-violet-400">
                  Criticidade: {selectedCriticidade || 'TODOS'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-5xl font-black leading-none text-emerald-400">{filteredApps.length}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Sistemas</span>
              </div>
              
              {/* 🔄 BOTÃO CONDICIONAL */}
              {canModifyApps && (
                <button
                  onClick={() => navigate('/applications/new')}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition hover:scale-105 hover:bg-emerald-400"
                >
                  <Plus size={18} /> Nova Aplicação
                </button>
              )}
            </div>
          </div>

          {/* BARRA DE PESQUISA TEXTUAL */}
          <div className="mb-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-12 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
            />
            {searchTerm && (
              <button 
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* GRID DE CONTEÚDO */}
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-400 font-medium">Carregando aplicações...</div>
          ) : filteredApps.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium">
              Nenhuma aplicação encontrada para os filtros aplicados.
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {paginatedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    opened={selectedCard === app.id}
                    
                    // 🔄 PASSANDO A FLAG ATUALIZADA DO USEMEMO
                    isAdmin={canModifyApps} 
                    
                    onSelect={() => setSelectedCard(selectedCard === app.id ? null : app.id)}
                    onNavigateDetails={(id) => navigate(`/applications/${id}`)}
                    onNavigateEdit={(id) => navigate(`/applications/edit/${id}`)}
                    onDelete={(id) => { setAppToDelete(id); setDeleteModalOpen(true); }}
                    getCriticidadeColor={getCriticidadeColor}
                    getCategoriaIcon={getCategoriaIcon}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </main>

      {/* MODAL CONFIRMAÇÃO DELETE */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
            <h2 className="mb-3 text-3xl font-black text-white">Confirmar exclusão</h2>
            <p className="mb-8 text-slate-400">Deseja realmente excluir esta aplicação?<br />Esta ação não poderá ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setDeleteModalOpen(false); setAppToDelete(null); }} className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:bg-slate-800">Cancelar</button>
              <button onClick={confirmDelete} className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};