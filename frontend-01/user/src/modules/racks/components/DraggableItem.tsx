import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export interface Ativo {
  id: string;
  nome: string;
  tipo: string;
}

interface DraggableProps {
  id: string;
  children: React.ReactNode;
  data?: any;
}

export function DraggableItem({ id, children, data }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: data
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`cursor-grab active:cursor-grabbing transition-shadow ${isDragging ? 'opacity-50 scale-105' : ''}`}
    >
      {children}
    </div>
  );
}
