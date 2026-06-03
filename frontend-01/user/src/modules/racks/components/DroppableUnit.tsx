import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableUnit({ id, children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`group relative h-8 rounded-2xl flex items-center px-4 transition-all border
        ${isOver ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-950/50 border-white/5 hover:border-emerald-500/30'}
      `}
    >
      {children}
    </div>
  );
}
