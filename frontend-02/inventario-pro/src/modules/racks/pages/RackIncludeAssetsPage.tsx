// ===============================================
// RackIncludeAssetsPage.tsx
// ===============================================

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import { racksService } from '../services/racks.service';
import { assetsService } from '../../assets/services/assets.service';
import type { Asset } from '../../assets/types/asset.types';

type Rack = {
  id: string | number;
  nome: string;
  capacidade: number;
};

const ALLOWED_TYPES = ['SERVIDOR_FISICO', 'SWITCH', 'ROTEADOR', 'STORAGE'];
const UNIT_HEIGHT = 48; // Altura confortável para os slots U

// Força o tamanho mínimo de 1U caso o banco retorne NULL, 0 ou NaN
function getAssetSize(asset?: Asset): number {
  const size = parseInt(String(asset?.tamanhoU ?? '1'), 10);
  if (isNaN(size) || size <= 0) {
    return 1;
  }
  return size;
}

export default function RackIncludeAssetsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rack, setRack] = useState<Rack | null>(null);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [allocatedAssets, setAllocatedAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (!id) return;
        const rackData = await racksService.getById(id);
        setRack(rackData);

        const allAssets = await assetsService.getAll();

        // NORMALIZAÇÃO CRÍTICA: Compara os IDs convertendo ambos para String 
        // para evitar falhas se um for Number e o outro String.
        const available = allAssets.filter(
          (asset: Asset) => 
            !asset.rackId && ALLOWED_TYPES.includes(asset.tipo ?? '')
        );
        
        const allocated = allAssets.filter(
          (asset: Asset) => 
            asset.rackId && String(asset.rackId) === String(id)
        );

        setAvailableAssets(available);
        setAllocatedAssets(allocated);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Cria um mapa indexado por Unidade do Rack para renderização estável
  const rackMap = useMemo(() => {
    const map: Record<number, { asset: Asset; isStart: boolean }> = {};
    
    allocatedAssets.forEach((asset) => {
      const start = Number(asset.posicaoRack);
      if (!start) return;
      
      const size = getAssetSize(asset);
      for (let i = 0; i < size; i++) {
        map[start + i] = {
          asset,
          isStart: i === 0,
        };
      }
    });
    
    return map;
  }, [allocatedAssets]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const asset =
      availableAssets.find((a) => String(a.id) === activeId) ||
      allocatedAssets.find((a) => String(a.id) === activeId);

    if (!asset) return;

    // 1. DEVOLVER PARA A LISTA EXTERNA (REMOVER DO RACK)
    if (overId === 'available-assets') {
      if (!asset.rackId) return;

      try {
        // BLINDAGEM: Passamos undefined ou o que o backend espera em vez de null bruto se a tipagem proibir
        await assetsService.update(String(asset.id), {
          rackId: undefined,
          posicaoRack: undefined,
          tamanhoU: getAssetSize(asset),
        });

        setAllocatedAssets((prev) => prev.filter((a) => String(a.id) !== activeId));
        
        // CORREÇÃO DE TIPO: Usamos o Typecast ou propriedades opcionais seguras
        const unallocatedAsset: Asset = { 
          ...asset, 
          rackId: undefined, 
          posicaoRack: undefined 
        };
        
        setAvailableAssets((prev) => [...prev, unallocatedAsset]);
      } catch (error) {
        console.error(error);
        alert('Erro ao remover ativo do rack.');
      }
      return;
    }

    // 2. ADICIONAR OU REMANEJAR DENTRO DO RACK
    const targetPosition = Number(overId);
    if (isNaN(targetPosition)) return;

    const assetSize = getAssetSize(asset);

    // Validação de limite físico do rack
    if (rack && targetPosition + assetSize - 1 > rack.capacidade) {
      alert('O equipamento ultrapassa os limites físicos superiores do rack.');
      return;
    }

    // Validação de sobreposição de espaço (colisão)
    const isOccupied = allocatedAssets.some((a) => {
      if (String(a.id) === activeId) return false; 

      const start = Number(a.posicaoRack || 0);
      const size = getAssetSize(a);
      const end = start + size - 1;
      const targetEnd = targetPosition + assetSize - 1;

      return !(targetEnd < start || targetPosition > end);
    });

    if (isOccupied) {
      alert('Esta posição ou o espaço necessário acima dela já está ocupado.');
      return;
    }

    try {
      // Garante a correspondência estrita de tipo (String se o ID da rota for string)
      const safeRackId = String(rack ? rack.id : id);

      // GRAVAÇÃO CORRETA: Envia as variáveis reais da nova posição para a API
      await assetsService.update(String(asset.id), {
        rackId: safeRackId,
        posicaoRack: targetPosition,
        tamanhoU: assetSize,
      });

      // CORREÇÃO DE TIPO: Mapeado estritamente para a assinatura do Asset
      const updatedAsset: Asset = { 
        ...asset, 
        rackId: safeRackId, 
        posicaoRack: targetPosition 
      };

      // Atualiza o estado da tela localmente de forma sincronizada
      setAvailableAssets((prev) => prev.filter((a) => String(a.id) !== activeId));
      setAllocatedAssets((prev) => {
        const filtered = prev.filter((a) => String(a.id) !== activeId);
        return [...filtered, updatedAsset];
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar alocação do ativo no servidor.');
    }
  }

  if (loading) return <div className="p-6 text-white text-center">Carregando dados...</div>;
  if (!rack) return <div className="p-6 text-red-400 text-center">Rack não encontrado</div>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alocar Ativos</h1>
            <p className="mt-2 text-slate-400">
              Mova os ativos entre a listagem e as gavetas exclusivas do Rack.
            </p>
          </div>
          <button
            onClick={() => navigate(`/racks/${id}`)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300 hover:bg-slate-800 transition"
          >
            ← Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_1fr]">
          {/* PAINEL DO RACK */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Rack: {rack.nome}</h2>
            <div className="mx-auto w-[340px] rounded-xl border-[12px] border-slate-700 bg-slate-800 p-3 shadow-2xl">
              {/* PROCURA ESTE TRECHO NO TEU PAINEL DO RACK E DEIXA ASSIM: */}
              <div className="flex flex-col-reverse gap-[2px]">
                {Array.from({ length: rack.capacidade }).map((_, index) => {
                  const unit = index + 1;
                  const slotData = rackMap[unit];

                  // APAGAMOS a linha "if (slotData && !slotData.isStart) return null;"

                  return (
                    <RackSlot
                      key={unit}
                      unit={unit}
                      asset={slotData?.asset}
                      isStart={slotData?.isStart} // <-- Passamos se é o início do ativo
                      hasAsset={!!slotData}       // <-- Passamos se tem algum ativo ali
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* PAINEL DE DISPONÍVEIS */}
          <DroppableList>
            <h2 className="mb-4 text-xl font-semibold text-slate-200">Ativos Sem Posição</h2>
            {availableAssets.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/40 text-sm text-slate-500">
                Nenhum ativo disponível no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {availableAssets.map((asset) => (
                  <DraggableAsset key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </DroppableList>
        </div>
      </div>
    </DndContext>
  );
}

// ===============================================
// COMPONENTES AUXILIARES
// ===============================================

function RackSlot({ 
  unit, 
  asset, 
  isStart, 
  hasAsset 
}: { 
  unit: number; 
  asset?: Asset; 
  isStart?: boolean; 
  hasAsset: boolean; 
}) {
  const { setNodeRef, isOver } = useDroppable({ id: unit.toString() });
  
  // O tamanho do bloco que vai flutuar de forma absoluta
  const size = asset ? getAssetSize(asset) : 1;
  // Multiplica a altura padrão + compensa os gaps de 2px entre as gavetas
  const computedHeight = size * UNIT_HEIGHT + (size - 1) * 2; 

  return (
    <div
      ref={setNodeRef}
      style={{ height: `${UNIT_HEIGHT}px` }} // Cada slot de U tem sempre tamanho fixo agora
      className={`relative flex items-stretch gap-2 rounded border transition-all duration-200 ${
        isOver
          ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
          : 'border-slate-700/50 bg-slate-900/40'
      }`}
    >
      {/* Indicador lateral da U - Este NUNCA some e aparece em todas as linhas! */}
      <div className="flex w-10 items-center justify-center border-r border-slate-800 bg-slate-950/40 font-mono text-xs font-bold text-slate-500 select-none">
        U{unit}
      </div>

      {/* Área do conteúdo do equipamento */}
      <div className="flex-1 p-1 relative">
        {/* Se este slot for o início do equipamento, renderiza-o com tamanho expandido absoluto */}
        {hasAsset ? (
          isStart && asset ? (
            <div 
              className="absolute left-1 right-1 bottom-1" // Alinha perfeitamente na base do slot inicial
              style={{ 
                height: `${computedHeight - 8}px`, // Subtrai o padding interno do container
                zIndex: 10 
              }}
            >
              <DraggableAsset asset={asset} isInsideRack />
            </div>
          ) : (
            // Slots do "meio" ou "topo" do equipamento ficam vazios (o bloco absoluto de baixo vai cobri-los)
            <div className="h-full w-full pointer-events-none" />
          )
        ) : (
          // Slot totalmente vazio e disponível para receber drops
          <div className="h-full w-full rounded border border-dashed border-slate-800/60 bg-slate-950/10" />
        )}
      </div>
    </div>
  );
}

function DroppableList({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'available-assets' });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-6 transition-all min-h-[500px] ${
        isOver
          ? 'border-cyan-500 bg-cyan-950/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'
          : 'border-slate-800 bg-slate-900'
      }`}
    >
      {children}
    </div>
  );
}

function DraggableAsset({ asset, isInsideRack = false }: { asset: Asset; isInsideRack?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(asset.id),
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex h-full w-full cursor-grab flex-col justify-center rounded-md bg-slate-950 p-2.5 shadow-md border active:cursor-grabbing transition-colors select-none ${
        isDragging ? 'opacity-30' : 'opacity-100'
      } ${
        isInsideRack 
          ? 'border-emerald-500/30 hover:border-emerald-400 bg-gradient-to-r from-slate-950 to-slate-900' 
          : 'border-slate-800 hover:border-cyan-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-cyan-400 truncate max-w-[180px]">
          {asset.hostname || asset.modelo}
        </span>
        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500 border border-slate-800">
          {getAssetSize(asset)}U
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-slate-400 truncate">
        {asset.tipo?.replace('_', ' ') || ''}
      </div>
    </div>
  );
}