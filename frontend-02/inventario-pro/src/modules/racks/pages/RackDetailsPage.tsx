// src/modules/racks/pages/RackDetailsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Plus,
  Link2,
  Edit2,
  ArrowLeft,
  Cpu,
  Network,
  Tag,
  Calendar,
  Search,
} from 'lucide-react';

import { racksService } from '../services/racks.service';
import type { Asset } from '../../assets/types/asset.types';

interface RackDetalhado {
  id: string | number;
  nome: string;
  localizacao?: string | null;
  capacidade: number;
  ativos?: Asset[];
}

function getAssetSize(asset?: any): number {
  if (!asset) return 1;
  const rawSize = asset.tamanhoU ?? asset.tamanho_u ?? asset.tamanhou ?? asset.tamanho ?? '1';
  const size = parseInt(String(rawSize), 10);
  return isNaN(size) || size <= 0 ? 1 : size;
}

export default function RackDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rack, setRack] = useState<RackDetalhado | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  // CONTROLADOR DE VISIBILIDADE DO PAINEL DE FILTROS
  const [showFilters, setShowFilters] = useState(false);

  // FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        if (!id) return;
        const rackData = await racksService.getById(id) as RackDetalhado;
        setRack(rackData);
        if (rackData.ativos) setAssets(rackData.ativos);
      } catch (error) {
        console.error('Erro ao carregar rack:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        (asset.hostname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.apelido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.modelo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.patrimonio?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesTipo = filterTipo === '' || (asset.tipo || '') === filterTipo;
      const matchesStatus = filterStatus === '' || (asset.status || '') === filterStatus;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [assets, searchTerm, filterTipo, filterStatus]);

  const { physicalAssets, virtualAssets } = useMemo(() => {
    const physical = filteredAssets.filter(a => a.posicaoRack !== null && a.posicaoRack !== undefined && String(a.posicaoRack) !== '');
    const virtual = filteredAssets.filter(a => a.posicaoRack === null || a.posicaoRack === undefined || String(a.posicaoRack) === '');
    return { physicalAssets: physical, virtualAssets: virtual };
  }, [filteredAssets]);

  const rackMap = useMemo(() => {
    const map = new Map<number, { asset: Asset; isStart: boolean }>();
    physicalAssets.forEach((asset) => {
      const startPos = Number(asset.posicaoRack);
      if (isNaN(startPos) || startPos <= 0) return;
      const size = getAssetSize(asset);
      for (let i = 0; i < size; i++) {
        map.set(startPos + i, { asset, isStart: i === 0 });
      }
    });
    return map;
  }, [physicalAssets]);

  const uniqueTipos = useMemo(() => Array.from(new Set(assets.map((a) => a.tipo))).filter(Boolean), [assets]);
  const uniqueStatus = useMemo(() => Array.from(new Set(assets.map((a) => a.status))).filter(Boolean), [assets]);

  if (loading) return <div className="p-6 text-slate-400 text-center font-medium bg-slate-950 min-h-screen">Carregando infraestrutura...</div>;
  if (!rack) return <div className="p-6 text-red-400 text-center font-medium bg-slate-950 min-h-screen">Rack não localizado</div>;

  return (
    <div className="h-screen w-full bg-[#070b12] px-8 pt-2 pb-1 text-slate-100 antialiased font-sans overflow-hidden">
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] items-stretch h-full">
        
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: ESTRUTURA FÍSICA COMPLETA (ROLAGEM ISOLADA)              */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1520] p-4 shadow-xl h-full flex flex-col overflow-y-auto shrink-0 custom-scrollbar">
          <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Estrutura Física</h2>
            <span className="text-[10px] text-slate-500 font-mono">Frente</span>
          </div>
          
          {/* O GAVETEIRO ESTRUTURAL DO RACK */}
          <div className="w-full rounded-2xl border-[8px] border-[#182232] bg-[#111a24] p-1.5 shadow-2xl shrink-0">
            <div className="flex flex-col-reverse gap-[2px]">
              {Array.from({ length: rack.capacidade }).map((_, index) => {
                const unit = index + 1;
                const slotData = rackMap.get(unit);
                const asset = slotData?.asset;
                const isStart = slotData?.isStart;
                
                const size = asset ? getAssetSize(asset) : 1;
                const computedHeight = size * 24 + (size - 1) * 2;

                return (
                  <div
                    key={unit}
                    style={{ height: '24px' }}
                    className={`relative flex items-center rounded-sm transition-all duration-150 ${
                      asset 
                        ? selectedAsset?.id === asset.id
                          ? 'bg-cyan-950/30 border border-cyan-500/30' 
                          : 'bg-slate-950/40 border border-white/5'
                        : 'bg-[#090f16] border border-white/[0.01]'
                    }`}
                  >
                    <div className="flex-none flex w-8 h-full items-center justify-center border-r border-white/5 bg-slate-950/60 font-mono text-[9px] font-bold text-slate-400 select-none">
                      {String(unit).padStart(2, '0')}
                    </div>

                    <div className="flex-1 h-full relative">
                      {slotData ? (
                        isStart && asset ? (
                          <div 
                            className="absolute left-0.5 right-0.5 bottom-0.5"
                            style={{ height: `${computedHeight - 2}px`, zIndex: 20 }}
                          >
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className={`group flex h-full w-full flex-col justify-center rounded-sm px-1.5 text-left transition-all border ${
                                selectedAsset?.id === asset.id
                                  ? 'border-cyan-500 bg-gradient-to-r from-cyan-950 to-[#0e1724] shadow-md'
                                  : 'border-[#1e2d42] bg-[#141f2e] hover:border-slate-500'
                              }`}
                            >
                              <span className="font-bold text-[9px] text-cyan-400 truncate w-full">
                                {asset.hostname || asset.apelido || asset.modelo}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="h-full w-full pointer-events-none" />
                        )
                      ) : (
                        <div className="h-full w-full rounded-sm border border-dashed border-white/[0.01]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LISTA AUXILIAR PARA ATIVOS VIRTUAIS ABAIXO DO RACK */}
          {virtualAssets.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5 shrink-0">
              <h2 className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Ativos Virtuais</h2>
              <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
                {virtualAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full rounded-lg border p-1.5 text-left transition-all text-[10px] ${
                      selectedAsset?.id === asset.id
                        ? 'border-cyan-500 bg-slate-950'
                        : 'border-white/5 bg-slate-950/40'
                    }`}
                  >
                    <div className="truncate font-bold text-cyan-400">{asset.hostname || asset.apelido}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA: CONTEÚDOS GERAIS E DETALHES LÓGICOS                       */}
        {/* ========================================================================= */}
        <div className="space-y-4 h-full overflow-y-auto pr-1 pb-2 custom-scrollbar">
          
          {/* 1. BARRA SUPERIOR HEADER */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 sticky top-0 bg-[#070b12] z-30">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black tracking-tight text-white">{rack.nome}</h1>
                <span className="rounded-full bg-slate-900 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400 font-mono">ID: #{rack.id}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Visualização física e lógica do rack de infraestrutura</p>
            </div>
            <button
              onClick={() => navigate('/racks')}
              className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
            >
              <ArrowLeft size={13} /> Voltar para Racks
            </button>
          </div>

          {/* 2. CARD DE METADADOS HORIZONTAIS */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1520] p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Localização</span>
                <span className="text-xs font-bold text-slate-200">{rack.localizacao || 'Sala Segura'}</span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Capacidade Total</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{rack.capacidade}U</span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Ativos no Filtro</span>
                <span className="text-xs font-bold text-slate-200">
                  {filteredAssets.length} <span className="text-[10px] font-normal text-slate-500">de {assets.length}</span>
                </span>
              </div>

              {/* 🟢 INTERRUPTOR ADICIONADO PERFEITAMENTE DEPOIS DO CAMPO 'ATIVOS NO FILTRO' */}
              <div className="h-6 w-px bg-white/5" />
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="toggle-filters"
                  checked={showFilters}
                  onChange={(e) => setShowFilters(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-cyan-400 focus:ring-0 cursor-pointer accent-cyan-400"
                />
                <label htmlFor="toggle-filters" className="text-[10px] font-black uppercase tracking-widest text-cyan-400 cursor-pointer hover:text-cyan-300 transition">
                  Exibir Filtros
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/racks/${rack.id}/include-assets`)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-500/20"
              >
                <Link2 size={13} /> Vincular Ativo
              </button>
              <button
                onClick={() => navigate('/assets/new')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-black transition hover:bg-emerald-400"
              >
                <Plus size={13} /> Novo Ativo
              </button>
            </div>
          </div>

          {/* 3. PAINEL DE FILTROS CONDICIONAL */}
          {/* 🟢 EXIBIDO APENAS SE O CHECKBOX ESTIVER SELECIONADO */}
          {showFilters && (
            <div className="rounded-2xl border border-white/5 bg-[#0d1520] p-3 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Digite Hostname, Apelido, Modelo ou Patrimônio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-emerald-500/40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="rounded-xl border border-white/5 bg-slate-950/60 px-2.5 py-2 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="">Todos os Tipos</option>
                    {uniqueTipos.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-white/5 bg-slate-950/60 px-2.5 py-2 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="">Todos os Status</option>
                    {uniqueStatus.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. TELA GRANDE DE DETALHES DO ATIVO */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1520] p-6 shadow-xl min-h-[500px] flex flex-col justify-between">
            {!selectedAsset ? (
              <div className="w-full my-auto flex items-center justify-center">
                <p className="text-xs text-slate-500 font-medium tracking-wide text-center">
                  Selecione um equipamento para visualizar os detalhes completos
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-955/60 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition hover:text-slate-200"
                    >
                      <ArrowLeft size={12} /> Fechar Detalhes
                    </button>
                    <button
                      onClick={() => navigate(`/assets/${selectedAsset.id}/edit`, { state: { from: window.location.pathname } })}
                      className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-500/20"
                    >
                      <Edit2 size={11} /> Editar Registro
                    </button>
                  </div>

                  <div className="mb-4">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-500">Asset Record #{selectedAsset.id}</span>
                    <h2 className="text-lg font-black text-white tracking-tight mt-0.5">{selectedAsset.hostname || 'Sem Hostname'}</h2>
                    {selectedAsset.apelido && <p className="text-xs text-slate-400 mt-0.5">{selectedAsset.apelido}</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3">
                      <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                        <Tag size={12} className="text-cyan-400" />
                        <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Especificações Técnicas</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <DetailField label="Patrimônio" value={selectedAsset.patrimonio} />
                        <DetailField label="Fabricante" value={(selectedAsset as any).fabricante} />
                        <DetailField label="Modelo" value={selectedAsset.modelo} />
                        <DetailField label="Nº de Série" value={(selectedAsset as any).serial} className="sm:col-span-2" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3">
                      <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                        <Cpu size={12} className="text-emerald-400" />
                        <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Rede e Aplicação</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <DetailField label="Endereço IP" value={(selectedAsset as any).ipPrincipal} highlightColor="text-cyan-400 font-mono" />
                        <DetailField label="Sist. Operacional" value={(selectedAsset as any).sistemaOperacional} />
                        <DetailField label="Aplicação Ativa" value={(selectedAsset as any).oqueRoda} highlightColor="text-emerald-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3">
                        <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                          <Network size={12} className="text-purple-400" />
                          <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Alocação</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <DetailField label="Posição U" value={selectedAsset.posicaoRack ? `U${selectedAsset.posicaoRack}` : '-'} />
                          <DetailField label="Espaço Ocupado" value={`${getAssetSize(selectedAsset)}U`} />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3">
                        <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                          <Calendar size={12} className="text-amber-400" />
                          <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Contábil</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <DetailField label="Data Compra" value={(selectedAsset as any).dataCompra} />
                          <DetailField label="Valor" value={(selectedAsset as any).valor} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3 mt-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Observações Internas</span>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {String((selectedAsset as any).observacoes || '').trim() || 'Nenhuma observação cadastrada para este ativo.'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value, className = '', highlightColor = 'text-slate-200' }: { label: string; value: any; className?: string; highlightColor?: string; }) {
  const isInvalid = value === undefined || value === null || String(value).trim() === '' || String(value).trim() === '-';
  return (
    <div className={`rounded-xl border border-white/[0.02] bg-slate-950/40 p-2.5 ${className}`}>
      <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 select-none">{label}</span>
      <span className={`block mt-0.5 text-xs font-bold truncate ${isInvalid ? 'text-slate-600 font-normal italic' : highlightColor}`}>
        {isInvalid ? 'Não informado' : String(value)}
      </span>
    </div>
  );
}