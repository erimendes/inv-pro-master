import { useDraggable } from '@dnd-kit/core';
import { Server, Cpu, X } from 'lucide-react';
import InventoryItem from './InventoryItem';

export interface Ativo {
  id: number;
  tagPatrimonial: string;
  modelo: string;
  tipo: string;
}

interface Props {
  asset: Ativo;
  origin: 'inventory' | 'rack';
  onRemove?: (asset: Ativo) => void;
}

export function DraggableItem({ asset, origin, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${origin}-draggable-${asset.id}`,
    data: { asset, origin },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 999,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <InventoryItem 
          name={asset.modelo} 
          specs={asset.tagPatrimonial} 
          icon={asset.tipo === 'SWITCH' ? <Cpu size={20} /> : <Server size={20} />} 
        />
      </div>
      
      {origin === 'rack' && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(asset);
          }}
          className="absolute -right-2 -top-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 border-2 border-[#020617]"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
