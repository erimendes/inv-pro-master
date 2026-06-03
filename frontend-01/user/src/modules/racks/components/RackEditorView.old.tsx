import { useEffect, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { Loader2 } from 'lucide-react';
import { DraggableItem } from './DraggableItem';
import { DroppableUnit } from './DroppableUnit';

const UNIT_HEIGHT = 14;

// ========================
// VM FILTER
// ========================
const isVirtualMachine = (asset: any) => {
  const tipo = String(asset?.tipo || '').toUpperCase();
  const hostname = String(asset?.hostname || '').toUpperCase();

  return (
    asset?.isVirtual === true ||
    tipo.includes('VM') ||
    tipo.includes('VIRTUAL') ||
    hostname.startsWith('VM-')
  );
};

// ========================
// COLISÃO
// ========================
const hasCollision = (
  pos: number,
  size: number,
  rack: any[],
  id: string
) => {
  const end = pos + size - 1;

  return rack.find(a => {
    if (String(a.id) === String(id)) return false;

    const aStart = Number(a.posicaoRack);
    const aEnd = aStart + (Number(a.tamanhoU) || 1) - 1;

    return pos <= aEnd && end >= aStart;
  });
};

// ========================
// COMPONENT
// ========================
export default function RackEditorView({ rackId, onBack }: any) {
  const [rack, setRack] = useState<any>(null);
  const [inRack, setInRack] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [assetsRes, rackRes] = await Promise.all([
        fetch('http://localhost:3000/hardware/assets'),
        fetch(`http://localhost:3000/hardware/racks/${rackId}`)
      ]);

      const assets = await assetsRes.json();
      const rackData = await rackRes.json();

      const fisicos = assets.filter((a: any) => !isVirtualMachine(a));

      setRack(rackData);
      setInRack(fisicos.filter((a: any) => String(a.rackId) === String(rackId)));
      setInventory(fisicos.filter((a: any) => !a.rackId));

      setLoading(false);
    };

    load();
  }, [rackId]);

  const handleDrop = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const id = active.id;

    // REMOVE
    if (over.id === 'inventory') {
      const asset = inRack.find(a => String(a.id) === String(id));
      if (!asset) return;

      setInRack(prev => prev.filter(a => String(a.id) !== String(id)));
      setInventory(prev => [...prev, { ...asset, rackId: null }]);

      await fetch(`http://localhost:3000/hardware/assets/${id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rackId: null, posicaoRack: null })
      });

      return;
    }

    const pos = Number(over.id.replace('u-', ''));
    const asset = [...inRack, ...inventory].find(a => String(a.id) === String(id));
    if (!asset) return;

    const size = Number(asset.tamanhoU || 1);

    if (pos + size - 1 > (rack?.capacidade || 42)) return;

    if (hasCollision(pos, size, inRack, id)) return;

    const updated = { ...asset, rackId, posicaoRack: pos };

    setInRack(prev => [
      ...prev.filter(a => String(a.id) !== String(id)),
      updated
    ]);

    setInventory(prev => prev.filter(a => String(a.id) !== String(id)));

    await fetch(`http://localhost:3000/hardware/assets/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rackId, posicaoRack: pos })
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );
  }

  const totalU = rack?.capacidade || 42;
  const slots = Array.from({ length: totalU }, (_, i) => totalU - i);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDrop}>
      <div className="p-8 text-white">

        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-black">{rack?.nome}</h1>

          <button
            onClick={onBack}
            className="bg-white text-black px-4 py-2 rounded"
          >
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">

          {/* RACK */}
          <div className="col-span-7 bg-slate-900/40 p-6 rounded-xl">
            {slots.map(u => {
              const asset = inRack.find(a => Number(a.posicaoRack) === u);

              return (
                <DroppableUnit key={u} id={`u-${u}`}>
                  <div
                    style={{
                      height: asset
                        ? `${asset.tamanhoU * UNIT_HEIGHT}px`
                        : `${UNIT_HEIGHT}px`
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs w-6">U{u}</span>

                    {asset ? (
                      <DraggableItem id={String(asset.id)} data={asset}>
                        <div className="bg-emerald-500 text-black w-full px-2 text-xs">
                          {asset.hostname}
                        </div>
                      </DraggableItem>
                    ) : (
                      <div className="h-px w-full bg-white/5" />
                    )}
                  </div>
                </DroppableUnit>
              );
            })}
          </div>

          {/* INVENTÁRIO */}
          <div className="col-span-5">
            <div
              id="inventory"
              className="bg-slate-900/40 p-4 rounded-xl min-h-[400px]"
            >
              {inventory.map(item => (
                <DraggableItem key={item.id} id={String(item.id)} data={item}>
                  <div className="bg-slate-800 p-2 mb-2 rounded">
                    {item.hostname}
                  </div>
                </DraggableItem>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DndContext>
  );
}