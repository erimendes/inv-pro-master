// src/modules/assets/pages/AssetsListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Eye, Pencil, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { canViewModule, canModifyModule } from '../../../shared/constants/roles';
import { assetsService } from '../services/assets.service';
import type { Asset } from '../types/asset.types';

// IMPORTAÇÃO DOS NOVOS COMPONENTES SEPARADOS
import AssetReportFieldsModal, { AVAILABLE_FIELDS } from '../components/AssetReportFieldsModal';
import AssetReportPreview from '../components/AssetReportPreview';

export default function AssetsListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Controle do fluxo do Wizard de relatórios
  const [wizardStep, setWizardStep] = useState<'list' | 'select_fields' | 'preview'>('list');
  const [selectedFields, setSelectedFields] = useState<string[]>(AVAILABLE_FIELDS.map(f => f.key));

  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const canAccessAssetsModule = useMemo(() => {
    return canViewModule(currentUser?.role, 'assets');
  }, [currentUser]);

  const canEditAssets = useMemo(() => {
    return canModifyModule(currentUser?.role, 'assets');
  }, [currentUser]);

  useEffect(() => {
    setCurrentPage(1);
    setActiveCardId(null);
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    setActiveCardId(null);
  }, [currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
  };

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
      await assetsService.remove(String(id));
      setAssets((prev) => prev.filter((item) => item.id !== id));
      setActiveCardId(null);
      alert('Ativo removido com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Erro ao remover o ativo.');
    }
  }

  if (!canAccessAssetsModule && !loading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-[#070a13] text-red-400 gap-4 min-h-0">
        <ShieldAlert size={52} className="text-red-500 animate-bounce" />
        <h2 className="text-2xl font-black uppercase tracking-wide">Acesso Negado</h2>
      </div>
    );
  }

  /* ========================================================= */
  /* INTERCEPTADORES DE TELA DO WIZARD                         */
  /* ========================================================= */
  if (wizardStep === 'select_fields') {
    return (
      <AssetReportFieldsModal 
        selectedFields={selectedFields}
        onToggleField={(key) => setSelectedFields(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
        onToggleAll={() => setSelectedFields(selectedFields.length === AVAILABLE_FIELDS.length ? [] : AVAILABLE_FIELDS.map(f => f.key))}
        onBack={() => setWizardStep('list')}
        onAdvance={() => setWizardStep('preview')}
      />
    );
  }

  if (wizardStep === 'preview') {
    return (
      <AssetReportPreview 
        filteredAssets={filteredAssets}
        selectedFields={selectedFields}
        onBack={() => setWizardStep('select_fields')}
      />
    );
  }

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const currentAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const listagemTipos = [
    { value: '', label: 'Todos os tipos' },
    { value: 'LAPTOP', label: 'Laptop' },
    { value: 'DESKTOP', label: 'Desktop' },
    { value: 'SERVIDOR_FISICO', label: 'Servidor Físico' },
    { value: 'SERVIDOR_VIRTUAL', label: 'Servidor Virtual' },
    { value: 'SWITCH', label: 'Switch' },
    { value: 'ROTEADOR', label: 'Roteador' },
    { value: 'STORAGE', label: 'Storage' },
    { value: 'MONITOR', label: 'Monitor' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#070a13] text-slate-100 overflow-hidden min-h-0">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex flex-col gap-2 px-8 pt-2 pb-1 bg-[#070a13] flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white leading-none">Ativos</h1>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    TIPO: {typeFilter === '' ? 'TODOS' : typeFilter}
                  </span>
                  <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-purple-400">
                    STATUS: {statusFilter === '' ? 'TODOS' : statusFilter}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-none">Gestão da infraestrutura de TI</p>
            </div>

            <div className="hidden sm:flex items-center gap-4 justify-between sm:justify-end">
              <div className="text-right mr-2">
                <span className="block text-3xl font-black leading-none text-[#10b981]">
                  {filteredAssets.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ativos</span>
              </div>

              <button
                onClick={() => filteredAssets.length > 0 ? setWizardStep('select_fields') : alert('Não há ativos para exportar.')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-black text-xs uppercase tracking-wider text-cyan-400 transition-all hover:scale-[1.01] hover:bg-cyan-500/20 shadow-md shadow-cyan-500/5 cursor-pointer border-0"
              >
                <FileText size={14} /> Gerar Relatório
              </button>

              {canEditAssets && (
                <button
                  onClick={() => navigate('/assets/new', { state: { from: window.location.pathname } })}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 font-black text-xs uppercase tracking-wider text-slate-950 transition-all hover:scale-[1.01] hover:bg-emerald-400 cursor-pointer border-0"
                >
                  <span className="text-sm font-bold leading-none">+</span> Novo Ativo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BUSCA E FILTROS */}
        <main className="flex-1 px-9 pt-1 pb-2 flex flex-col justify-between items-start overflow-y-auto w-full min-h-0">
          <div className="flex flex-wrap md:flex-row gap-2 w-full items-center mb-3 flex-shrink-0">
            <div className="relative flex-1 max-w-md w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Buscar por hostname, IP, fabricante ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="hidden sm:block bg-[#0b1120] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer w-full md:w-auto min-w-[160px]"
            >
              {listagemTipos.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hidden sm:block bg-[#0b1120] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer w-full md:w-auto min-w-[160px]"
            >
              <option value="">Todos os status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_USO">Em Uso</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="DESCARTADO">Descartado</option>
            </select>

            <button onClick={handleResetFilters} className="hidden sm:block px-4 py-2 rounded-xl border border-slate-800 bg-[#0b1120] hover:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition w-full md:w-auto text-center cursor-pointer">
              Todos
            </button>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium bg-slate-900/10">
              Nenhum ativo correspondente aos filtros ou escopo de permissão.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 items-start w-full content-start flex-1 min-h-0 overflow-y-auto pr-1">
              {currentAssets.map((asset) => {
                const isCardSelected = activeCardId === Number(asset.id);
                return (
                  <div 
                    key={asset.id} 
                    onClick={() => setActiveCardId(prev => prev === Number(asset.id) ? null : Number(asset.id))}
                    className={`group p-3 rounded-2xl bg-[#090d1a] border transition-all flex flex-col justify-between h-[120px] shadow-lg select-none cursor-pointer ${
                      isCardSelected ? 'border-cyan-500 bg-[#0c1324] ring-2 ring-cyan-500/5' : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded transition-colors uppercase tracking-wide truncate max-w-[50%] ${isCardSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          {asset.tipo.replace('_', ' ')}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate max-w-[50%] ${asset.status === 'DISPONIVEL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {asset.status}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white truncate w-full tracking-tight">{asset.hostname || 'Sem Hostname'}</h3>
                    </div>

                    <div className="flex items-center w-full mt-auto">
                      {isCardSelected ? (
                        <div className="grid grid-cols-3 gap-1.5 w-full pt-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/assets/${asset.id}`, { state: { from: window.location.pathname } })} className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-black uppercase tracking-normal transition cursor-pointer">
                            <Eye size={12} /> Ver
                          </button>
                          {canEditAssets ? (
                            <button onClick={() => navigate(`/assets/${asset.id}/edit`, { state: { from: window.location.pathname } })} className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-black uppercase tracking-normal transition cursor-pointer">
                              <Pencil size={11} /> Alt
                            </button>
                          ) : (
                            <div className="py-1.5 rounded-xl bg-slate-900/40 border border-slate-900/60 text-slate-600 text-[10px] font-black uppercase text-center opacity-40 select-none">Lock</div>
                          )}
                          {canEditAssets ? (
                            <button onClick={() => handleDelete(Number(asset.id), asset.hostname)} className="flex items-center justify-center gap-1 py-1.5 px-2 w-full rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-black uppercase tracking-normal transition cursor-pointer">
                              <Trash2 size={11} /> Del
                            </button>
                          ) : (
                            <div className="py-1.5 rounded-xl bg-slate-900/40 border border-slate-900/60 text-slate-600 text-[10px] font-black uppercase text-center opacity-40 select-none">Lock</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono block truncate w-full">{asset.ipPrincipal || '-'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINAÇÃO */}
          <div className="w-full mt-2 pt-2 border-t border-slate-900/60 flex justify-between items-center text-[11px] text-slate-400 shrink-0">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition font-bold cursor-pointer text-[10px] text-white">Anterior</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition font-bold cursor-pointer text-[10px] text-white">Próxima</button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}