// src/modules/racks/pages/RackIncludeAssetsPage.tsx

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
const UNIT_HEIGHT = 48;

function getAssetSize(asset?: Asset): number {
  const size = parseInt(String(asset?.tamanhoU ?? '1'), 10);
  if (isNaN(size) || size <= 0) return 1;
  return size;
}

const ASSET_IMAGES: Record<string, string> = {
  'SERVIDOR_FISICO_1U': '/assets/images/servidor_1u.png',
  'SERVIDOR_FISICO_2U': '/assets/images/servidor_2u.png',
  'SERVIDOR_FISICO_4U': '/assets/images/servidor_4u.png',
  'SWITCH': '/assets/images/switch.png',
  'ROTEADOR': '/assets/images/roteador.png',
  'STORAGE': '/assets/images/storage.png',
};

function getAssetFrontImage(asset: Asset): string | null {
  const size = getAssetSize(asset);
  const type = asset.tipo ?? '';
  const keyWithSize = `${type}_${size}U`;
  if (ASSET_IMAGES[keyWithSize]) return ASSET_IMAGES[keyWithSize];
  if (ASSET_IMAGES[type]) return ASSET_IMAGES[type];
  return null;
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

        const available = allAssets.filter(
          (asset: Asset) => !asset.rackId && ALLOWED_TYPES.includes(asset.tipo ?? '')
        );
        
        const allocated = allAssets.filter(
          (asset: Asset) => asset.rackId && String(asset.rackId) === String(id)
        );

        setAvailableAssets(available);
        setAllocatedAssets(allocated);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } // 🟢 LIMPO: O texto corrompido 'fill/all' que estava causando o crash foi removido daqui!
      finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const rackMap = useMemo(() => {
    const map: Record<number, { asset: Asset; isStart: boolean }> = {};
    allocatedAssets.forEach((asset) => {
      const start = Number(asset.posicaoRack);
      if (!start) return;
      const size = getAssetSize(asset);
      for (let i = 0; i < size; i++) {
        map[start + i] = { asset, isStart: i === 0 };
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

    if (overId === 'available-assets') {
      try {
        await assetsService.update(String(asset.id), {
          rackId: null,
          posicaoRack: null,
          tamanhoU: getAssetSize(asset),
        });
        
        setAllocatedAssets((prev) => prev.filter((a) => String(a.id) !== activeId));
        setAvailableAssets((prev) => {
          if (prev.some((a) => String(a.id) === activeId)) return prev;
          const unallocatedAsset: Asset = { ...asset, rackId: undefined, posicaoRack: undefined };
          return [...prev, unallocatedAsset];
        });
      } catch (error) {
        console.error('Erro ao desalocar ativo:', error);
      }
      return;
    }

    const targetPosition = Number(overId);
    if (isNaN(targetPosition)) return;

    const assetSize = getAssetSize(asset);

    if (rack && targetPosition + assetSize - 1 > rack.capacidade) {
      alert('O equipamento ultrapassa os limites físicos superiores do rack.');
      return;
    }

    const isOccupied = allocatedAssets.some((a) => {
      if (String(a.id) === activeId) return false; 
      const start = Number(a.posicaoRack || 0);
      const size = getAssetSize(a);
      const end = start + size - 1;
      const targetEnd = targetPosition + assetSize - 1;
      return !(targetEnd < start || targetPosition > end);
    });

    if (isOccupied) {
      alert('Esta posição já está ocupada.');
      return;
    }

    try {
      const safeRackId = String(rack ? rack.id : id);
      await assetsService.update(String(asset.id), {
        rackId: safeRackId,
        posicaoRack: targetPosition,
        tamanhoU: assetSize,
      });
      const updatedAsset: Asset = { ...asset, rackId: safeRackId, posicaoRack: targetPosition };
      
      setAvailableAssets((prev) => prev.filter((a) => String(a.id) !== activeId));
      setAllocatedAssets((prev) => {
        const filtered = prev.filter((a) => String(a.id) !== activeId);
        return [...filtered, updatedAsset];
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) return <div className="p-6 text-white text-center">Carregando dados...</div>;
  if (!rack) return <div className="p-6 text-red-400 text-center">Rack não encontrado</div>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-screen w-full bg-slate-950 px-8 pt-2 pb-1 text-white flex flex-col overflow-hidden min-h-0">
        
        {/* HEADER COMPACTADO */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Alocar Ativos</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Mova os ativos entre a listagem e as gavetas exclusivas do Rack.
            </p>
          </div>
          <button
            onClick={() => navigate(`/racks/${id}`)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            ← Voltar
          </button>
        </div>

        {/* CONTAINER DO GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_1fr] flex-1 min-h-0 overflow-hidden">
          
          {/* PAINEL DO RACK (ESQUERDA) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col h-full min-h-0 overflow-hidden">
            <h2 className="mb-2 text-base font-black uppercase text-slate-400 tracking-wider shrink-0">
              Rack: {rack.nome}
            </h2>
            
            <div className="w-full flex-1 overflow-y-auto pr-1 py-1 min-h-0 custom-scrollbar max-h-[calc(100vh-130px)]">
              <div className="mx-auto w-[340px] rounded-xl border-[12px] border-slate-700 bg-slate-800 p-3 shadow-2xl">
                <div className="flex flex-col-reverse gap-[2px]">
                  {Array.from({ length: rack.capacidade }).map((_, index) => {
                    const unit = index + 1;
                    const slotData = rackMap[unit];

                    return (
                      <RackSlot
                        key={unit}
                        unit={unit}
                        asset={slotData?.asset}
                        isStart={slotData?.isStart}
                        hasAsset={!!slotData}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PAINEL DE DISPONÍVEIS (DIREITA) */}
          <DroppableList>
            <h2 className="mb-2 text-base font-black uppercase text-slate-400 tracking-wider shrink-0">
              Ativos Sem Posição
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-1 min-h-0 max-h-[calc(100vh-130px)]">
              {availableAssets.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/40 text-sm text-slate-500">
                  Nenhum ativo disponível no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 content-start">
                  {availableAssets.map((asset) => (
                    <DraggableAsset key={asset.id} asset={asset} />
                  ))}
                </div>
              )}
            </div>
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
  
  const size = asset ? getAssetSize(asset) : 1;
  const computedHeight = size * UNIT_HEIGHT + (size - 1) * 2; 

  return (
    <div
      ref={setNodeRef}
      style={{ height: `${UNIT_HEIGHT}px` }}
      className={`relative flex items-stretch gap-2 rounded border transition-all duration-200 shrink-0 ${
        isOver
          ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
          : 'border-slate-700/50 bg-slate-900/40'
      }`}
    >
      <div className="flex w-10 items-center justify-center border-r border-slate-800 bg-slate-950/40 font-mono text-xs font-bold text-slate-500 select-none">
        U{unit}
      </div>

      <div className="flex-1 p-1 relative">
        {hasAsset ? (
          isStart && asset ? (
            <div 
              className="absolute left-1 right-1 bottom-1" 
              style={{ 
                height: `${computedHeight - 8}px`,
                zIndex: 10 
              }}
            >
              <DraggableAsset asset={asset} isInsideRack />
            </div>
          ) : (
            <div className="h-full w-full pointer-events-none" />
          )
        ) : (
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
      className={`rounded-2xl border p-4 transition-all h-full flex flex-col min-h-0 overflow-hidden ${
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
        zIndex: 100,
      }
    : undefined;

  const imageSrc = (asset as any).imagemUrl || getAssetFrontImage(asset);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative flex h-full w-full cursor-grab flex-col justify-center overflow-hidden rounded-sm bg-slate-950 shadow-md border active:cursor-grabbing transition-all select-none ${
        isDragging ? 'opacity-30' : 'opacity-100'
      } ${
        isInsideRack 
          ? 'border-zinc-800 hover:border-cyan-500 bg-zinc-900' 
          : 'border-slate-800 hover:border-cyan-500 p-2.5 h-[52px]'
      }`}
    >
      {imageSrc ? (
        <div className="absolute inset-0 h-full w-full bg-black">
          <img 
            src={imageSrc} 
            alt="Hardware" 
            className="h-full w-full object-cover object-center pointer-events-none group-hover:brightness-125 transition-all"
          />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),_inset_0_-1px_3px_rgba(0,0,0,0.8)] bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>
      ) : null}

      {isInsideRack && imageSrc ? (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 pointer-events-none">
          <div className="rounded bg-black/75 backdrop-blur-xs px-1.5 py-0.5 border border-zinc-800/80">
            <span className="font-mono text-xs font-bold text-cyan-400 drop-shadow-md">
              {asset.hostname || asset.modelo}
            </span>
          </div>
          {getAssetSize(asset) > 1 && (
            <span className="rounded bg-black/60 px-1 py-0.5 text-[9px] font-mono font-bold text-zinc-400">
              {getAssetSize(asset)}U
            </span>
          )}
        </div>
      ) : (
        <div className="relative z-10 w-full">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-cyan-400 truncate max-w-[180px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {asset.hostname || asset.modelo}
            </span>
            <span className="rounded bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400 border border-slate-800">
              {getAssetSize(asset)}U
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {asset.tipo?.replace('_', ' ') || ''}
          </div>
        </div>
      )}
    </div>
  );
}