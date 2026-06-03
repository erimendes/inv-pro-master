import {
  useEffect,
  useState
} from 'react';

import {
  Loader2,
  Trash2,
  AlertTriangle,
  Server
} from 'lucide-react';

import {
  DndContext,
  closestCenter,
  useDroppable
} from '@dnd-kit/core';

import type {
  DragEndEvent
} from '@dnd-kit/core';

import { DraggableItem } from './DraggableItem';
import { DroppableUnit } from './DroppableUnit';

// ========================
// CONFIG
// ========================
const UNIT_HEIGHT = 14;

// ========================
// TYPES
// ========================
interface Asset {
  id: string | number;
  hostname?: string;
  hardware?: string;
  tipo?: string;
  rackId?: string | null;
  posicaoRack?: number | null;
  tamanhoU?: number;
  isVirtual?: boolean;
  tagPatrimonial?: string;
}

interface Rack {
  id: string;
  nome?: string;
  capacidade?: number;
}

interface Props {
  rackId: string;
}

// ========================
// VM FILTER
// ========================
const isVirtualMachine = (
  asset: Asset
) => {

  const tipo =
    String(asset?.tipo || '')
      .toUpperCase();

  const hostname =
    String(asset?.hostname || '')
      .toUpperCase();

  return (
    asset?.isVirtual === true ||
    tipo.includes('VM') ||
    tipo.includes('VIRTUAL') ||
    tipo.includes('SERVIDOR_VIRTUAL') ||
    hostname.startsWith('VM-')
  );
};

// ========================
// COLLISION
// ========================
const verificarColisao = (
  posicaoAlvo: number,
  tamanhoU: number,
  ativosNoRack: Asset[],
  idAtivoArrastado: string | number
) => {

  const novoInicio = posicaoAlvo;

  const novoFim =
    posicaoAlvo +
    tamanhoU -
    1;

  return ativosNoRack.find(
    (ativo) => {

      if (
        String(ativo.id) ===
        String(idAtivoArrastado)
      ) {
        return false;
      }

      const atualInicio =
        Number(ativo.posicaoRack);

      const atualFim =
        atualInicio +
        (
          Number(ativo.tamanhoU) || 1
        ) -
        1;

      return (
        novoInicio <= atualFim &&
        novoFim >= atualInicio
      );
    }
  );
};

// ========================
// INVENTORY DROP
// ========================
function InventoryDropZone({
  children,
  active
}: any) {

  const { setNodeRef } =
    useDroppable({
      id: 'inventory-area'
    });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-[2rem]
        border-2
        border-dashed
        p-6
        min-h-[600px]
        transition-all
        bg-slate-900/40
        ${
          active
            ? `
              border-emerald-500
              bg-emerald-500/10
            `
            : `
              border-white/5
            `
        }
      `}
    >
      {children}
    </div>
  );
}

// ========================
// COMPONENT
// ========================
export default function RackEditorView({
  rackId
}: Props) {

  const [assetsInRack, setAssetsInRack] =
    useState<Asset[]>([]);

  const [availableAssets, setAvailableAssets] =
    useState<Asset[]>([]);

  const [rackInfo, setRackInfo] =
    useState<Rack | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  // ========================
  // FETCH
  // ========================
  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        const [
          assetsRes,
          rackRes
        ] = await Promise.all([
          fetch('http://localhost:3000/hardware/assets'),
          fetch(`http://localhost:3000/hardware/racks/${rackId}`)
        ]);

        const allAssets =
          await assetsRes.json();

        const rack =
          await rackRes.json();

        const ativosFisicos =
          allAssets.filter(
            (a: Asset) =>
              !isVirtualMachine(a)
          );

        setRackInfo(rack);

        setAssetsInRack(
          ativosFisicos.filter(
            (a: Asset) =>
              String(a.rackId) ===
              String(rackId)
          )
        );

        setAvailableAssets(
          ativosFisicos.filter(
            (a: Asset) => !a.rackId
          )
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, [rackId]);

  // ========================
  // DRAG START
  // ========================
  const handleDragStart = (
    event: any
  ) => {

    setActiveId(
      String(event.active.id)
    );
  };

  // ========================
  // DRAG END
  // ========================
  const handleDragEnd = async (
    event: DragEndEvent
  ) => {

    setActiveId(null);

    const {
      active,
      over
    } = event;

    if (!over) return;

    const assetId = active.id;

    // ========================
    // REMOVE
    // ========================
    if (
      over.id ===
      'inventory-area'
    ) {

      const asset =
        assetsInRack.find(
          (a) =>
            String(a.id) ===
            String(assetId)
        );

      if (!asset) return;

      setAvailableAssets(
        (prev) => [
          ...prev,
          {
            ...asset,
            rackId: null,
            posicaoRack: null
          }
        ]
      );

      setAssetsInRack(
        (prev) =>
          prev.filter(
            (a) =>
              String(a.id) !==
              String(assetId)
          )
      );

      await fetch(
        `http://localhost:3000/hardware/assets/${assetId}/position`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            rackId: null,
            posicaoRack: null
          })
        }
      );

      return;
    }

    // ========================
    // POSITION
    // ========================
    const unitPosition =
      parseInt(
        over.id
          .toString()
          .replace('u-', '')
      );

    if (
      isNaN(unitPosition)
    ) {
      return;
    }

    const asset =
      [
        ...availableAssets,
        ...assetsInRack
      ].find(
        (a) =>
          String(a.id) ===
          String(assetId)
      );

    if (!asset) return;

    if (
      isVirtualMachine(asset)
    ) {

      alert(
        'VM não pode ser colocada em rack físico.'
      );

      return;
    }

    const tamanhoU =
      Number(asset.tamanhoU) || 1;

    if (
      unitPosition +
        tamanhoU -
        1 >
      (rackInfo?.capacidade || 42)
    ) {

      alert(
        'Sem espaço no rack.'
      );

      return;
    }

    const conflito =
      verificarColisao(
        unitPosition,
        tamanhoU,
        assetsInRack,
        assetId
      );

    if (conflito) {

      alert(
        `Conflito com ${conflito.hostname}`
      );

      return;
    }

    const updatedAsset = {
      ...asset,
      rackId,
      posicaoRack:
        unitPosition
    };

    setAssetsInRack(
      (prev) => [
        ...prev.filter(
          (a) =>
            String(a.id) !==
            String(assetId)
        ),
        updatedAsset
      ]
    );

    setAvailableAssets(
      (prev) =>
        prev.filter(
          (a) =>
            String(a.id) !==
            String(assetId)
        )
    );

    await fetch(
      `http://localhost:3000/hardware/assets/${assetId}/position`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          rackId,
          posicaoRack:
            unitPosition
        })
      }
    );
  };

  // ========================
  // LOADING
  // ========================
  if (loading) {

    return (
      <div
        className="
          min-h-[400px]
          flex
          items-center
          justify-center
        "
      >
        <Loader2
          className="
            animate-spin
            text-emerald-500
          "
          size={40}
        />
      </div>
    );
  }

  const totalU =
    rackInfo?.capacidade || 42;

  const slots =
    Array.from(
      { length: totalU },
      (_, i) => totalU - i
    );

  return (
    <DndContext
      collisionDetection={
        closestCenter
      }
      onDragStart={
        handleDragStart
      }
      onDragEnd={
        handleDragEnd
      }
    >

      <div className="grid grid-cols-12 gap-10">

        {/* RACK */}
        <div
          className="
            col-span-7
            rounded-[2rem]
            bg-slate-900/40
            border
            border-white/5
            p-6
          "
        >

          <div className="mb-5 flex justify-between items-center">

            <div>

              <h2
                className="
                  text-xl
                  font-black
                  uppercase
                "
              >
                {rackInfo?.nome}
              </h2>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-slate-500
                  font-bold
                  mt-1
                "
              >
                Rack físico
              </p>

            </div>

            <div
              className="
                bg-emerald-500/10
                border
                border-emerald-500/20
                rounded-xl
                px-4
                py-2
                text-center
              "
            >

              <p className="text-[8px] text-emerald-400 uppercase font-bold">
                Capacidade
              </p>

              <p className="text-lg font-black text-white">
                {totalU}U
              </p>

            </div>

          </div>

          {/* SLOTS */}
          <div className="flex flex-col gap-[1px]">

            {slots.map((u) => {

              const asset =
                assetsInRack.find(
                  (a) =>
                    Number(a.posicaoRack) === u
                );

              const oculto =
                assetsInRack.find(
                  (a) =>
                    u >
                      Number(a.posicaoRack) &&
                    u <
                      Number(a.posicaoRack) +
                        (
                          Number(a.tamanhoU) ||
                          1
                        )
                );

              if (oculto) {
                return null;
              }

              return (
                <DroppableUnit
                  key={u}
                  id={`u-${u}`}
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                    style={{
                      height: asset
                        ? `${
                            (
                              asset.tamanhoU ||
                              1
                            ) * UNIT_HEIGHT
                          }px`
                        : `${UNIT_HEIGHT}px`
                    }}
                  >

                    <span
                      className="
                        text-[8px]
                        text-slate-500
                        w-6
                        text-center
                        font-mono
                      "
                    >
                      U{u}
                    </span>

                    {asset ? (

                      <DraggableItem
                        id={String(asset.id)}
                        data={asset}
                      >

                        <div
                          className="
                            w-full
                            h-full
                            rounded-md
                            bg-gradient-to-b
                            from-emerald-400
                            to-emerald-600
                            border
                            border-emerald-300/30
                            text-black
                            px-3
                            flex
                            items-center
                            gap-2
                            shadow-lg
                          "
                        >

                          <Server size={10} />

                          <span
                            className="
                              text-[9px]
                              font-black
                              uppercase
                              truncate
                            "
                          >
                            {asset.hostname}
                          </span>

                        </div>

                      </DraggableItem>

                    ) : (

                      <div
                        className="
                          h-px
                          w-full
                          bg-white/5
                        "
                      />

                    )}

                  </div>

                </DroppableUnit>
              );
            })}

          </div>

        </div>

        {/* INVENTORY */}
        <aside className="col-span-5">

          <InventoryDropZone
            active={!!activeId}
          >

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2
                  className="
                    text-sm
                    font-black
                    uppercase
                  "
                >
                  Inventário
                </h2>

                <p
                  className="
                    text-[9px]
                    text-slate-500
                    uppercase
                    font-bold
                    tracking-[0.2em]
                    mt-1
                  "
                >
                  Somente ativos físicos
                </p>

              </div>

              <Trash2
                size={18}
                className={
                  activeId
                    ? `
                      text-emerald-500
                      animate-bounce
                    `
                    : `
                      text-slate-700
                    `
                }
              />

            </div>

            <div className="space-y-3">

              {availableAssets.map(
                (item) => (

                  <DraggableItem
                    key={item.id}
                    id={String(item.id)}
                    data={item}
                  >

                    <div
                      className="
                        rounded-2xl
                        border
                        border-white/5
                        bg-slate-900
                        p-4
                        hover:border-emerald-500/40
                        transition-all
                        cursor-grab
                      "
                    >

                      <div className="flex justify-between items-start">

                        <div>

                          <p
                            className="
                              text-xs
                              font-black
                              text-white
                            "
                          >
                            {item.hostname}
                          </p>

                          <p
                            className="
                              text-[9px]
                              text-slate-500
                              uppercase
                              mt-1
                              font-bold
                            "
                          >
                            {item.tagPatrimonial}
                          </p>

                        </div>

                        <div
                          className="
                            px-2
                            py-1
                            rounded-lg
                            bg-emerald-500/10
                            border
                            border-emerald-500/20
                          "
                        >

                          <span
                            className="
                              text-[9px]
                              font-black
                              text-emerald-400
                            "
                          >
                            {item.tamanhoU || 1}U
                          </span>

                        </div>

                      </div>

                    </div>

                  </DraggableItem>
                )
              )}

              {availableAssets.length === 0 && (

                <div
                  className="
                    border
                    border-dashed
                    border-white/10
                    rounded-2xl
                    p-10
                    text-center
                  "
                >

                  <AlertTriangle
                    size={28}
                    className="
                      mx-auto
                      text-slate-700
                      mb-4
                    "
                  />

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.2em]
                      text-slate-500
                      font-bold
                    "
                  >
                    Nenhum ativo disponível
                  </p>

                </div>
              )}

            </div>

          </InventoryDropZone>

        </aside>

      </div>

    </DndContext>
  );
}