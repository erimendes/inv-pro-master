import { useState, useEffect, useCallback } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { DndContext, useDroppable, pointerWithin, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Button } from '../../../shared/components/Button';
import { DraggableItem } from '../components/DraggableItem';
import type { Ativo } from '../components/DraggableItem'; // CORREÇÃO: import type evita SyntaxError
import { DroppableUnit } from '../components/DroppableUnit';

export default function RackDetailPage({ rackId, onBack }: { rackId: string; onBack: () => void }) {
  const [availableAssets, setAvailableAssets] = useState<Ativo[]>([]);
  const [rackLayout, setRackLayout] = useState<Record<number, Ativo>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { setNodeRef: setInventoryRef, isOver } = useDroppable({ id: 'inventory-zone' });

  const loadData = useCallback(async () => {
    try {
      const [resAssets, resRacks] = await Promise.all([
        fetch('http://localhost:3000/hardware/assets/available'),
        fetch('http://localhost:3000/hardware/racks')
      ]);
      const assets = await resAssets.json();
      const racks = await resRacks.json();
      const current = racks.find((r: any) => r.id === rackId);
      
      setAvailableAssets(assets);
      if (current?.ativos) {
        const layout: Record<number, Ativo> = {};
        current.ativos.forEach((a: Ativo, i: number) => { 
            layout[24 - i] = a; 
        });
        setRackLayout(layout);
      }
    } catch (err) { console.error("Erro ao carregar:", err); }
  }, [rackId]);

  useEffect(() => { loadData(); }, [loadData]);

  const returnToInventory = async (asset: Ativo) => {
    // UI Update (Otimista)
    setRackLayout(prev => {
      const next = { ...prev };
      const key = Object.keys(next).find(k => next[Number(k)].id === asset.id);
      if (key) delete next[Number(key)];
      return next;
    });
    setAvailableAssets(prev => [...prev.filter(a => a.id !== asset.id), asset]);

    // Persistência
    await fetch(`http://localhost:3000/hardware/assets/${asset.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rackId: null })
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as { asset: Ativo; origin: string };
    const targetId = String(over.id);

    if (data.origin === 'rack' && targetId === 'inventory-zone') {
      returnToInventory(data.asset);
    } else if (data.origin === 'inventory' && targetId.startsWith('unit-')) {
      const unit = Number(targetId.replace('unit-', ''));
      setRackLayout(prev => ({ ...prev, [unit]: data.asset }));
      setAvailableAssets(prev => prev.filter(a => a.id !== data.asset.id));
      
      fetch(`http://localhost:3000/hardware/assets/${data.asset.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rackId })
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <div className="p-8 bg-[#020617] min-h-screen text-white">
        <header className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-emerald-500 font-bold flex items-center gap-2 uppercase tracking-tighter">
            <ArrowLeft size={16} /> Voltar
          </button>
          <Button onClick={onBack} className="bg-emerald-500 text-slate-900 font-bold px-8">
            Salvar Rack
          </Button>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Rack */}
          <div className="col-span-8 bg-slate-900/40 rounded-3xl p-8 border border-white/5">
            <div className="space-y-1.5 max-w-xl mx-auto">
              {Array.from({ length: 24 }, (_, i) => 24 - i).map(u => (
                <DroppableUnit key={`u-${u}`} unitNumber={u}>
                  {rackLayout[u] && (
                    <DraggableItem 
                      asset={rackLayout[u]} 
                      origin="rack" 
                      onRemove={returnToInventory} 
                    />
                  )}
                </DroppableUnit>
              ))}
            </div>
          </div>

          {/* Estoque */}
          <aside 
            ref={setInventoryRef}
            className={`col-span-4 rounded-3xl p-6 border-2 transition-all min-h-[600px] ${
              isOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-slate-900/60'
            }`}
          >
            <h3 className="text-emerald-500 font-black text-xs uppercase mb-6 tracking-widest opacity-60">Estoque</h3>
            <div className="space-y-4">
              {availableAssets.map(asset => (
                <DraggableItem key={`inv-${asset.id}`} asset={asset} origin="inventory" />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </DndContext>
  );
}
