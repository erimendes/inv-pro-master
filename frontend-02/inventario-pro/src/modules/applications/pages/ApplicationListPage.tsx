// src/modules/applications/pages/ApplicationList.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsService } from '../services/applications.service';
import { Building2, Cpu, Globe, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { Pagination } from '../components/Pagination';

import { ApplicationCard, type Application } from '../components/ApplicationCard';
import type { SistemaCategoria, Criticidade } from '../types/applications.types';
import { canModifyModule } from '../../../shared/constants/roles';

export const ApplicationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const canModifyApps = useMemo(() => {
    if (!user?.role) return false;
    const roleLimpa = String(user.role).toUpperCase().trim();
    return canModifyModule(roleLimpa, 'applications');
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

  // PAGINAÇÃO ALTERADA: 8 itens por página
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8;

  // Busca na API quando os filtros estruturais mudam
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await applicationsService.findAll(selectedCategoria, selectedCriticidade);
        setApps(data);
        setCurrentPage(1); // Volta para a página 1 ao alterar filtros da API
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

  // Lógica de Paginação Computada
  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reseta a página ao digitar
    setSelectedCard(null);
  };

  // FUNÇÃO PARA RESETAR TODOS OS FILTROS DE UMA VEZ
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategoria(undefined);
    setSelectedCriticidade(undefined);
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
    <div className="w-full h-full flex flex-col bg-[#070a13] text-slate-100 overflow-hidden min-h-0">
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER SUPERIOR COMPACTADO */}
        <div className="flex flex-col gap-2 px-8 pt-2 pb-1 bg-[#070a13] flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">Aplicações</h1>
              <p className="text-xs text-slate-400 leading-none">Catálogo e gestão lógica de sistemas</p>
            </div>

            {/* CONTADOR DE SISTEMAS E BOTÃO NOVO COMPACTADO */}
            {/* 🟢 CORREÇÃO RESPONSIVA: Adicionado 'hidden sm:flex' para esconder o contador e o botão Nova Aplicação em telas mobile */}
            <div className="hidden sm:flex items-center gap-4 justify-between sm:justify-end">
              <div className="text-right">
                <span className="block text-3xl font-black leading-none text-emerald-400">{filteredApps.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sistemas</span>
              </div>
              
              {canModifyApps && (
                <button
                  onClick={() => navigate('/applications/new')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 font-black text-xs uppercase tracking-wider text-slate-950 transition-all hover:scale-[1.01] hover:bg-emerald-400 shadow-md shadow-emerald-500/5 cursor-pointer"
                >
                  <Plus size={14} /> Nova Aplicação
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ÁREA INTERNA PRINCIPAL */}
        <main className="flex-1 px-9 pt-1 pb-2 flex flex-col justify-between items-start overflow-y-auto w-full min-h-0">
          
          {/* BARRA DE FILTROS HORIZONTAIS INTERNOS */}
          <div className="flex flex-wrap md:flex-row gap-2 w-full items-center mb-3 flex-shrink-0">
            
            {/* 1. BUSCA POR TEXTO */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-11 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
              {searchTerm && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 2. FILTRO DE CATEGORIA COMO SELECT */}
            <div className="relative hidden sm:block w-full md:w-auto">
              <select
                value={selectedCategoria || ''}
                onChange={(e) => setSelectedCategoria(e.target.value ? (e.target.value as SistemaCategoria) : undefined)}
                className="bg-[#0b1120] border border-cyan-500/20 text-cyan-400 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-cyan-500 transition appearance-none cursor-pointer pr-8 w-full md:w-auto min-w-[180px]"
              >
                <option value="" className="bg-[#070a13] text-cyan-400">CATEGORIA: TODOS</option>
                <option value="ADMINISTRATIVO" className="bg-[#070a13] text-slate-200">ADMINISTRATIVO</option>
                <option value="OPERACIONAL" className="bg-[#070a13] text-slate-200">OPERACIONAL</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-cyan-400 pointer-events-none">▼</span>
            </div>

            {/* 3. FILTRO DE CRITICIDADE COMO SELECT */}
            <div className="relative hidden sm:block w-full md:w-auto">
              <select
                value={selectedCriticidade || ''}
                onChange={(e) => setSelectedCriticidade(e.target.value ? (e.target.value as Criticidade) : undefined)}
                className="bg-[#0b1120] border border-purple-500/20 text-purple-400 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer pr-8 w-full md:w-auto min-w-[180px]"
              >
                <option value="" className="bg-[#070a13] text-purple-400">CRITICIDADE: TODOS</option>
                <option value="BAIXA" className="bg-[#070a13] text-slate-200">BAIXA</option>
                <option value="MEDIA" className="bg-[#070a13] text-slate-200">MÉDIA</option>
                <option value="ALTA" className="bg-[#070a13] text-slate-200">ALTA</option>
                <option value="CRITICA" className="bg-[#070a13] text-slate-200">CRÍTICA</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-purple-400 pointer-events-none">▼</span>
            </div>

            {/* 4. BOTÃO "TODOS" */}
            <button
              onClick={handleResetFilters}
              className="hidden sm:block px-4 py-2 rounded-xl border border-slate-800 bg-[#0b1120] hover:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition w-full md:w-auto text-center cursor-pointer"
            >
              Todos
            </button>
          </div>

          {/* GRID DE CARDS COM REDESENHO FLUIDO RESPONSIVO */}
          {filteredApps.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium bg-slate-900/10">
              Nenhuma aplicação encontrada para os filtros aplicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 items-start w-full content-start flex-1 min-h-0 overflow-y-auto pr-1">
              {paginatedApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  opened={selectedCard === app.id}
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
          )}

          {/* PAINEL DE PAGINAÇÃO COMPACTADO COLOCADO NA BASE */}
          <div className="w-full mt-2 pt-2 border-t border-slate-900/60 flex justify-end shrink-0">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </main>
      </div>

      {/* MODAL CONFIRMAÇÃO DELETE */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
            <h2 className="text-3xl font-black text-white mb-3">Confirmar exclusão</h2>
            <p className="text-slate-400 mb-8">Deseja realmente excluir esta aplicação?<br />Esta ação não poderá ser desfeita.</p>
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