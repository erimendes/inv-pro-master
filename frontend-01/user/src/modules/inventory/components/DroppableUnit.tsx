import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import RackUnit from './RackUnit';

export function DroppableUnit({ unitNumber, children }: { unitNumber: number; children?: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `unit-${unitNumber}`,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`transition-all rounded-lg min-h-[44px] flex items-center justify-center ${
        isOver ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-transparent'
      }`}
    >
      {children ? (
        <div className="w-full relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
            U{unitNumber}
          </span>
          <div>{children}</div>
        </div>
      ) : (
        <RackUnit unitNumber={unitNumber} status="DISPONÍVEL" />
      )}
    </div>
  );
}
