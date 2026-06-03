import { useState } from 'react';
import { 
  DndContext, 
  pointerWithin,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { RackUnit } from '../components/RackUnit';
import { InventoryItem } from '../components/InventoryItem';
import { Box, Save, Layout, Plus } from 'lucide-react';

interface Device {
  id: string;
  type: 'server' | 'switch' | 'empty';
  name?: string;
}

const AVAILABLE_COMPONENTS = [
  { id: 'inv-1', type: 'server' as const, name: 'Servidor PowerEdge' },
  { id: 'inv-2', type: 'switch' as const, name: 'Switch Cisco Nexus' },
  { id: 'inv-3', type: 'server' as const, name: 'Storage NetApp' },
];

export default function RacksPage() {
  const [items, setItems] = useState<Device[]>([
    { id: 'u-12', type: 'empty' },
    { id: 'u-11', type: 'empty' },
    { id: 'u-10', type: 'empty' },
    { id: 'u-9', type: 'empty' },
    { id: 'u-8', type: 'empty' },
    { id: 'u-7', type: 'empty' },
    { id: 'u-6', type: 'empty' },
    { id: 'u-5', type: 'empty' },
    { id: 'u-4', type: 'empty' },
    { id: 'u-3', type: 'empty' },
    { id: 'u-2', type: 'empty' },
    { id: 'u-1', type: 'empty' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id as string;

    // Se for um item vindo do inventário (novo)
    if (activeData?.isNew) {
      setItems((prev) => 
        prev.map((item) => 
          item.id === overId 
            ? { ...item, type: activeData.type, name: activeData.name } 
            : item
        )
      );
      return;
    }

    // Se for reordenação interna do Rack
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layout className="text-[rgb(var(--primary))]" size={20} />
            <span className="text-[10px] font-bold text-[rgb(var(--primary))] uppercase tracking-[0.2em]">Data Center A</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight italic">Rack_Principal_01</h1>
        </div>
        <button className="flex items-center gap-2 bg-[rgb(var(--primary))] text-slate-950 px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all">
          <Save size={20} />
          Salvar Configuração
        </button>
      </header>

      <DndContext 
        sensors={sensors} 
        collisionDetection={pointerWithin} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 bg-slate-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl relative">
            <div className="bg-black/60 rounded-2xl p-6 border border-white/5">
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <RackUnit key={item.id} id={item.id} type={item.type} name={item.name} />
                ))}
              </SortableContext>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/80 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Plus size={18} className="text-[rgb(var(--primary))]" />
                Inventário
              </h3>
              <div className="space-y-3">
                {AVAILABLE_COMPONENTS.map((comp) => (
                  <InventoryItem key={comp.id} id={comp.id} type={comp.type} name={comp.name} />
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-6 rounded-[32px]">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Box size={18} className="text-[rgb(var(--primary))]" />
                Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ocupação</span>
                  <span className="text-white font-mono">{items.filter(i => i.type !== 'empty').length} / 12U</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[rgb(var(--primary))] h-full transition-all duration-700" 
                    style={{ width: `${(items.filter(i => i.type !== 'empty').length / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
