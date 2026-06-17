// src/modules/assets/pages/AssetsListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { canViewModule, canModifyModule } from '../../../shared/constants/roles';
import { assetsService } from '../services/assets.service';
import type { Asset } from '../types/asset.types';

export default function AssetsListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Controla qual card está ativado para mostrar os botões no rodapé fixo
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Controle de Paginação Interna (8 itens = exatamente 2 linhas de 4 colunas)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const canAccessAssetsModule = useMemo(() => {
    return canViewModule(currentUser?.role, 'assets');
  }, [currentUser]);

  const canEditAssets = useMemo(() => {
    return canModifyModule(currentUser?.role, 'assets');
  }, [currentUser]);

  // Reseta paginação e fecha botões abertos ao filtrar
  useEffect(() => {
    setCurrentPage(1);
    setActiveCardId(null);
  }, [searchTerm, typeFilter, statusFilter]);

  // Fecha os botões abertos ao mudar de página
  useEffect(() => {
    setActiveCardId(null);
  }, [currentPage]);

  /* ========================================================= */
  /* CARREGA DADOS DO BACKEND */
  /* ========================================================= */
  useEffect(() => {
    async function loadAssets() {
      if (!canAccessAssetsModule) return;
      try {
        setLoading(true);
        setError('');
        const response = await assetsService.getAll();
        setAssets(response || []);
      } catch (err: any) {
        console.error(err);
        setError('Falha ao carregar o inventário de ativos físicos.');
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, [canAccessAssetsModule]);

  // Lógica de Filtragem Dinâmica Atualizada (Incluindo IP na busca)
  const filteredAssets = useMemo(() => {
    if (!canAccessAssetsModule || !assets) return [];

    return assets.filter((asset) => {
      const matchesSearch = 
        (asset.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (asset.fabricante?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (asset.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (asset.ipPrincipal?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        
      const matchesType = typeFilter === '' || asset.tipo === typeFilter;
      const matchesStatus = statusFilter === '' || asset.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, searchTerm, typeFilter, statusFilter, canAccessAssetsModule]);

  async function handleDelete(id: number, hostname?: string | null) {
    if (!window.confirm(`Tem certeza que deseja remover o ativo ${hostname || `#${id}`}?`)) return;
    try {
      await assetsService.delete(id);
      setAssets((prev) => prev.filter((item) => item.id !== id));
      setActiveCardId(null);
      alert('Ativo removido com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Erro ao remover o ativo.');
    }
  }

  function handleCardClick(id: number) {
    setActiveCardId((prev) => (prev === id ? null : id));
  }

  if (!canAccessAssetsModule && !loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#070a13] text-red-400 gap-4">
        <ShieldAlert size={52} className="text-red-500 animate-bounce" />
        <h2 className="text-2xl font-black uppercase tracking-wide">Acesso Negado</h2>
        <p className="text-slate-400 text-sm max-w-sm text-center">Seu perfil não possui permissions para este módulo.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  const listagemTipos = [
    { value: '', label: 'TODOS' },
    { value: 'LAPTOP', label: 'LAPTOP' },
    { value: 'DESKTOP', label: 'DESKTOP' },
    { value: 'SERVIDOR_FISICO', label: 'SERVIDOR FISICO' },
    { value: 'SERVIDOR_VIRTUAL', label: 'SERVIDOR VIRTUAL' },
    { value: 'SWITCH', label: 'SWITCH' },
    { value: 'ROTEADOR', label: 'ROTEADOR' },
    { value: 'STORAGE', label: 'STORAGE' },
    { value: 'MONITOR', label: 'MONITOR' },
  ];

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-slate-400">Carregando...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-red-400 p-6">⚠️ {error}</div>;

  return (
    <div className="w-full min-h-screen flex bg-[#070a13] text-slate-100 overflow-hidden items-stretch">
      
      {/* COLUNA ESQUERDA COMPLETA (MENU LATERAL) */}
      <aside className="w-64 border-r border-slate-800/40 bg-[#070a13] pt-6 px-6 flex flex-col gap-2 flex-shrink-0 hidden md:flex overflow-y-auto">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Tipos</p>
        <nav className="flex flex-col gap-2">
          {listagemTipos.map((tipo) => {
            const isSelected = typeFilter === tipo.value;
            return (
              <button
                key={tipo.value}
                onClick={() => setTypeFilter(tipo.value)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10'
                    : 'text-slate-400 border border-transparent hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                {tipo.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* COLUNA DIREITA CONTEÚDO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER TOP-RIGHT */}
        <div className="flex flex-col gap-4 px-8 pt-6 pb-2 bg-[#070a13] flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-white">Ativos</h1>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    TIPO: {typeFilter === '' ? 'TODOS' : typeFilter}
                  </span>
                  <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400">
                    STATUS: {statusFilter === '' ? 'TODOS' : statusFilter}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-none">Gestão da infraestrutura de TI</p>
            </div>

            {canEditAssets && (
              <button
                onClick={() => navigate('/assets/new')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-sm uppercase tracking-wider text-slate-950 transition-all hover:scale-[1.02] hover:bg-emerald-400 shadow-lg shadow-emerald-500/10"
              >
                <span className="text-lg font-bold leading-none">+</span> Novo Ativo
              </button>
            )}
          </div>
        </div>

        <main className="flex-1 px-8 pt-2 pb-6 flex flex-col justify-start items-start overflow-y-auto w-full">
          
          {/* BARRA DE FILTROS INTERNOS */}
          <div className="flex flex-col md:flex-row gap-4 w-full items-center mb-6 flex-shrink-0">
            <div className="relative flex-1 max-w-xl w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar por hostname, IP, fabricante ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0b1120] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer w-full md:w-auto min-w-[180px]"
            >
              <option value="">Todos os status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_USO">Em Uso</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="DESCARTADO">Descartado</option>
            </select>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium bg-slate-900/10">
              Nenhum ativo correspondente aos filtros ou escopo de permissão.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start w-full content-start flex-1">
              {currentAssets.map((asset) => {
                const isCardSelected = activeCardId === Number(asset.id);

                return (
                  <div 
                    key={asset.id} 
                    onClick={() => handleCardClick(Number(asset.id))}
                    className={`group p-5 rounded-2xl bg-[#090d1a] border transition-all flex flex-col justify-between h-[140px] shadow-lg select-none cursor-pointer ${
                      isCardSelected ? 'border-cyan-500 bg-[#0c1324] ring-2 ring-cyan-500/5' : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded transition-colors uppercase tracking-wide ${
                          isCardSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {asset.tipo.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          asset.status === 'DISPONIVEL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white truncate">{asset.hostname || 'Sem Hostname'}</h3>
                    </div>

                    <div className="flex items-center h-[32px] w-full mt-auto">
                      {isCardSelected ? (
                        <div 
                          className="grid grid-cols-3 gap-1.5 w-full"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <button
                            onClick={() => navigate(`/assets/${asset.id}`)}
                            className="flex items-center justify-center gap-1 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-bold uppercase transition"
                          >
                            <Eye size={12} />
                            Ver
                          </button>

                          {canEditAssets ? (
                            <button
                              onClick={() => navigate(`/assets/${asset.id}/edit`)}
                              className="flex items-center justify-center gap-1 py-1 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-bold uppercase transition"
                            >
                              <Pencil size={11} />
                              Alt
                            </button>
                          ) : (
                            <div className="py-1 rounded-xl bg-slate-900/40 border border-slate-900/60 text-slate-600 text-[11px] font-bold uppercase text-center opacity-40 select-none">
                              Lock
                            </div>
                          )}

                          {canEditAssets ? (
                            <button
                              onClick={() => handleDelete(Number(asset.id), asset.hostname)}
                              className="flex items-center justify-center gap-1 py-1 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-bold uppercase transition"
                            >
                              <Trash2 size={11} />
                              Del
                            </button>
                          ) : (
                            <div className="py-1 rounded-xl bg-slate-900/40 border border-slate-900/60 text-slate-600 text-[11px] font-bold uppercase text-center opacity-40 select-none">
                              Lock
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono block truncate w-full">
                          {asset.ipPrincipal || '-'}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* PAINEL DE PAGINAÇÃO */}
          <div className="mt-8 pt-4 border-t border-slate-900 flex justify-between items-center text-xs text-slate-400 w-full flex-shrink-0">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition font-bold"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition font-bold"
              >
                Próxima
              </button>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}