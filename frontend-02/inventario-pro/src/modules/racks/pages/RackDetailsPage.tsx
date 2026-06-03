// ===============================================
// RackDetailsPage.tsx
// ===============================================

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
} from 'lucide-react';

import { racksService } from '../services/racks.service';
import type { Asset } from '../../assets/types/asset.types';

// 1. Criamos uma interface local estendida que aceita exatamente o que o serviço retorna e o que o ecrã precisa
interface RackDetalhado {
  id: string | number;
  nome: string;
  localizacao?: string | null; // Aceita null vindo do banco de dados para evitar o erro de atribuição
  capacidade: number;
  ativos?: Asset[]; // Adicionado explicitamente para resolver o erro 'Property ativos does not exist'
}

function getAssetSize(asset?: any): number {
  if (!asset) return 1;
  const rawSize = asset.tamanhoU ?? asset.tamanho_u ?? asset.tamanhou ?? asset.tamanho ?? '1';
  const size = parseInt(String(rawSize), 10);
  if (isNaN(size) || size <= 0) {
    return 1;
  }
  return size;
}

export default function RackDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 2. O estado agora usa a nossa interface local estendida
  const [rack, setRack] = useState<RackDetalhado | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  // ESTADOS DOS FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        if (!id) return;
        // 3. Forçamos o retorno do serviço para a nossa interface com o "as RackDetalhado"
        const rackData = await racksService.getById(id) as RackDetalhado;
        setRack(rackData);

        if (rackData.ativos) {
          setAssets(rackData.ativos);
        }
      } catch (error) {
        console.error('Erro ao carregar rack:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // APLICAÇÃO DOS FILTROS NA LISTA DE ATIVOS
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        (asset.hostname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.apelido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.modelo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.patrimonio?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      // CORREÇÃO AQUI: Adicionado fallback seguro para evitar o erro 'possibly undefined'
      const assetTipo = asset.tipo || '';
      const assetStatus = asset.status || '';

      const matchesTipo = filterTipo === '' || assetTipo === filterTipo;
      const matchesStatus = filterStatus === '' || assetStatus === filterStatus;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [assets, searchTerm, filterTipo, filterStatus]);

  // SEPARA ATIVOS FÍSICOS E VIRTUAIS
  const { physicalAssets, virtualAssets } = useMemo(() => {
    const physical = filteredAssets.filter(
      (a) => a.posicaoRack !== null && a.posicaoRack !== undefined && String(a.posicaoRack) !== ''
    );
    const virtual = filteredAssets.filter(
      (a) => a.posicaoRack === null || a.posicaoRack === undefined || String(a.posicaoRack) === ''
    );
    return { physicalAssets: physical, virtualAssets: virtual };
  }, [filteredAssets]);

  // MAPEIA OS SLOTS DO RACK FÍSICO
  const rackMap = useMemo(() => {
    const map = new Map<number, { asset: Asset; isStart: boolean }>();

    physicalAssets.forEach((asset) => {
      const startPos = Number(asset.posicaoRack);
      if (isNaN(startPos) || startPos <= 0) return;

      const size = getAssetSize(asset);
      for (let i = 0; i < size; i++) {
        map.set(startPos + i, {
          asset,
          isStart: i === 0,
        });
      }
    });

    return map;
  }, [physicalAssets]);

  // EXTRAI TIPOS E STATUS ÚNICOS PARA OS SELECTS
  const uniqueTipos = useMemo(() => 
    Array.from(new Set(assets.map((a) => a.tipo)))
      .filter((t): t is NonNullable<typeof t> => Boolean(t)), 
    [assets]
  );

  const uniqueStatus = useMemo(() => 
    Array.from(new Set(assets.map((a) => a.status)))
      .filter((s): s is NonNullable<typeof s> => Boolean(s)), 
    [assets]
  );

  if (loading) return <div className="p-6 text-white text-center font-medium">Carregando rack...</div>;
  if (!rack) return <div className="p-6 text-red-400 text-center font-medium">Rack não encontrado</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      
      {/* HEADER PRINCIPAL DA PÁGINA */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{rack.nome}</h1>
          <p className="mt-2 text-slate-400">Visualização física e lógica do rack da infraestrutura</p>
        </div>
        <button
          onClick={() => navigate('/racks')}
          className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          &larr; Voltar para Racks
        </button>
      </div>

      {/* CARDS INFORMATIVOS SUPERIORES */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Localização" value={rack.localizacao || 'Não Informada'} />
        <InfoCard title="Capacidade Total" value={`${rack.capacidade}U`} />
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ativos no Filtro</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {filteredAssets.length} <span className="text-sm font-normal text-slate-500">de {assets.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/racks/${rack.id}/include-assets`)}
                className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Link2 size={14} /> Incluir
              </button>
              <button
                onClick={() => navigate('/assets/new')}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <Plus size={14} /> Novo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS DE BUSCA */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Buscar Ativo</label>
            <input
              type="text"
              placeholder="Digite Hostname, Apelido, Modelo ou Patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="w-full md:w-48">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Filtrar por Tipo</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Todos os Tipos</option>
              {uniqueTipos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Filtrar por Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Todos os Status</option>
              {uniqueStatus.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {(searchTerm || filterTipo || filterStatus) && (
            <div className="flex items-end h-full pt-5">
              <button
                onClick={() => { setSearchTerm(''); setFilterTipo(''); setFilterStatus(''); }}
                className="text-xs text-red-400 hover:text-red-300 font-medium underline"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL COM LAYOUT SPLIT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        
        {/* COLUNA ESQUERDA: ESTRUTURA FÍSICA E VIRTUAIS */}
        <div className="flex flex-col gap-6">
          
          {/* RACK FÍSICO COM GAVETAS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-200">Estrutura Física</h2>
            
            <div className="mx-auto w-[300px] rounded-xl border-[12px] border-slate-700 bg-slate-800 p-3 shadow-2xl">
              <div className="flex flex-col-reverse gap-[2px]">
                {Array.from({ length: rack.capacidade }).map((_, index) => {
                  const unit = index + 1;
                  const slotData = rackMap.get(unit);

                  const asset = slotData?.asset;
                  const isStart = slotData?.isStart;
                  
                  // Alturas fixadas em 40px por U para manter a régua e o alinhamento
                  const size = asset ? getAssetSize(asset) : 1;
                  const computedHeight = size * 40 + (size - 1) * 2;

                  return (
                    <div
                      key={unit}
                      style={{ height: '40px' }} // Altura de cada gaveta de U é fixa em 40px
                      className={`relative flex items-stretch gap-2 rounded border transition-all duration-200 ${
                        asset 
                          ? selectedAsset?.id === asset.id
                            ? 'border-cyan-500/40 bg-slate-950/40' 
                            : 'border-slate-800 bg-slate-950/20'
                          : 'border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      {/* O número do U nunca desaparece (Régua estrita exibida no arquivo "image_43290b.png") */}
                      <div className="flex w-10 items-center justify-center border-r border-slate-800/80 bg-slate-950/40 font-mono text-xs font-bold text-slate-500 select-none">
                        U{unit}
                      </div>

                      {/* Conteúdo interno do Slot */}
                      <div className="flex-1 p-1 relative">
                        {slotData ? (
                          isStart && asset ? (
                            /* Se for a gaveta base do Ativo, renderiza o botão expandido de forma absoluta */
                            <div 
                              className="absolute left-1 right-1 bottom-1"
                              style={{ 
                                height: `${computedHeight - 8}px`, // Descontando paddings internos
                                zIndex: 10 
                              }}
                            >
                              <button
                                onClick={() => setSelectedAsset(asset)}
                                className={`group flex h-full w-full flex-col justify-center rounded px-2.5 text-left transition-all border ${
                                  selectedAsset?.id === asset.id
                                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-950/50 to-slate-900 shadow-lg shadow-cyan-500/10'
                                    : 'border-slate-800 bg-slate-950 hover:bg-slate-900/80'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold text-xs text-cyan-400 truncate max-w-[140px]">
                                    {asset.hostname || asset.apelido || asset.modelo}
                                  </span>
                                  <span className="rounded bg-slate-900/80 px-1 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-800/60">
                                    {size}U
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wide truncate">
                                  {asset.tipo?.replace('_', ' ') || 'Não localizado'}
                                </span>
                              </button>
                            </div>
                          ) : (
                            /* Espaço ocupado pelas U's superiores do ativo (ficam transparentes pro bloco de baixo cobrir) */
                            <div className="h-full w-full pointer-events-none" />
                          )
                        ) : (
                          /* Espaço limpo e sem equipamentos */
                          <div className="h-full w-full rounded border border-dashed border-slate-800/30 bg-slate-950/5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LISTAGEM DE ATIVOS VIRTUAIS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-200">Ativos Virtuais / Sem Posição</h2>
            
            {virtualAssets.length === 0 ? (
              <div className="text-xs italic text-slate-500 p-3 border border-dashed border-slate-800 rounded-xl text-center bg-slate-950/10">
                Nenhum ativo sem posição encontrado.
              </div>
            ) : (
              <div className="flex max-h-[250px] flex-col gap-2 overflow-y-auto pr-1">
                {virtualAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedAsset?.id === asset.id
                        ? 'border-cyan-500 bg-slate-950 text-white shadow-md shadow-cyan-500/5'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="truncate font-semibold text-cyan-400">{asset.hostname || asset.apelido || asset.modelo}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span className="uppercase text-[10px] tracking-wide text-slate-500">{asset.tipo?.replace('_', ' ')}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 px-1 rounded text-slate-500">{getAssetSize(asset)}U</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: COMPONENTES COM VISUALIZAÇÃO COMPLETA DE TODOS OS CAMPOS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 h-fit min-h-[600px]">
          {!selectedAsset ? (
            <div className="flex h-[550px] items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/10 text-slate-500 text-sm">
              Selecione um equipamento para visualizar os detalhes completos
            </div>
          ) : (
            <div>
              
              {/* BOTÕES DE AÇÃO DO ATIVO */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                >
                  <ArrowLeft size={14} /> Voltar
                </button>
                <button
                  onClick={() => navigate(`/assets/${selectedAsset.id}/edit`, { 
                    state: { from: window.location.pathname } 
                  })}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  <Edit2 size={13} /> Editar
                </button>
              </div>

              {/* HEADER DO DETALHE */}
              <div className="mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-500">
                  ID #{selectedAsset.id || '00'}
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {selectedAsset.hostname || 'SEM HOSTNAME'}
                </h2>
                {selectedAsset.apelido && (
                  <p className="text-sm text-slate-400 mt-0.5">{selectedAsset.apelido}</p>
                )}
              </div>

              {/* SEÇÃO 1: IDENTIFICAÇÃO */}
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-800/60 bg-slate-950/20 p-5">
                  <div className="mb-4 flex items-center gap-2 text-slate-400 border-b border-slate-800/50 pb-2">
                    <Tag size={15} className="text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Identificação</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <DetailField label="ID" value={selectedAsset.id || '00'} />
                    <DetailField label="Patrimônio" value={selectedAsset.patrimonio || 'Não localizado'} />
                    <DetailField label="Hostname" value={selectedAsset.hostname || 'Não localizado'} />
                    <DetailField label="Apelido" value={selectedAsset.apelido || 'Não localizado'} />
                    <DetailField label="Fabricante" value={(selectedAsset as any).fabricante || 'Não localizado'} />
                    <DetailField label="Hardware" value={(selectedAsset as any).hardware || 'Não localizado'} />
                    <DetailField label="Modelo" value={selectedAsset.modelo || 'Não localizado'} />
                    <DetailField label="Serial" value={(selectedAsset as any).serial || 'Não localizado'} className="sm:col-span-2 md:col-span-2" />
                  </div>
                </div>

                {/* SEÇÃO 2: REDE / SISTEMA */}
                <div className="rounded-xl border border-slate-800/60 bg-slate-950/20 p-5">
                  <div className="mb-4 flex items-center gap-2 text-slate-400 border-b border-slate-800/50 pb-2">
                    <Cpu size={15} className="text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Rede / Sistema</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <DetailField label="IP" value={(selectedAsset as any).ipPrincipal || 'Não localizado'} highlightColor="text-cyan-400 font-mono" />
                    <DetailField label="Sistema Operacional" value={(selectedAsset as any).sistemaOperacional || 'Não localizado'} />
                    <DetailField label="CPU" value={(selectedAsset as any).cpu || 'Não localizado'} />
                    <DetailField label="RAM" value={(selectedAsset as any).ram || 'Não localizado'} />
                    <DetailField label="Disco" value={(selectedAsset as any).armazenamento || 'Não localizado'} />
                    <DetailField label="O que roda" value={(selectedAsset as any).oqueRoda || 'Não localizado'} highlightColor="text-emerald-400" />
                  </div>
                </div>

                {/* SEÇÃO 3: RACK E AQUISIÇÃO */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  
                  {/* SUB-CARD: RACK MAP */}
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950/20 p-5">
                    <div className="mb-4 flex items-center gap-2 text-slate-400 border-b border-slate-800/50 pb-2">
                      <Network size={15} className="text-purple-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Rack</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <DetailField label="Rack" value={selectedAsset.posicaoRack ? rack.nome : '-'} />
                      <DetailField label="Posição" value={selectedAsset.posicaoRack ? `U${selectedAsset.posicaoRack}` : '-'} />
                      <DetailField label="Tamanho" value={`${getAssetSize(selectedAsset)}U`} />
                    </div>
                  </div>

                  {/* SUB-CARD: AQUISIÇÃO */}
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950/20 p-5">
                    <div className="mb-4 flex items-center gap-2 text-slate-400 border-b border-slate-800/50 pb-2">
                      <Calendar size={15} className="text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Aquisição</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <DetailField label="Data Compra" value={(selectedAsset as any).dataCompra || '-'} />
                      <DetailField label="Valor" value={(selectedAsset as any).valor || 'R$ 0,00'} />
                    </div>
                  </div>

                </div>

                {/* SEÇÃO 4: OBSERVAÇÕES */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Observações</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {(selectedAsset as any).observacoes && String((selectedAsset as any).observacoes).trim() !== '' && (selectedAsset as any).observacoes !== 'Nenhuma observação cadastrada.'
                      ? (selectedAsset as any).observacoes 
                      : 'Nenhuma observação cadastrada.'}
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* COMPONENTES COMPLEMENTARES INTERNOS */
function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function DetailField({ 
  label, 
  value, 
  className = '', 
  highlightColor = 'text-slate-200' 
}: { 
  label: string; 
  value: any; 
  className?: string;
  highlightColor?: string;
}) {
  const isInvalid = value === undefined || value === null || String(value).trim() === '' || String(value).trim() === '-';
  
  return (
    <div className={`rounded-xl border border-slate-800/40 bg-slate-950/50 p-4 transition-all hover:border-slate-800 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 select-none">{label}</p>
      <p className={`mt-1 text-sm font-bold truncate ${isInvalid ? 'text-slate-600 font-normal italic' : highlightColor}`}>
        {isInvalid ? 'Não informado' : String(value)}
      </p>
    </div>
  );
}