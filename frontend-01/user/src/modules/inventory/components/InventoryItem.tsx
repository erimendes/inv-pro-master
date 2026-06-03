// src/modules/inventory/components/InventoryItem.tsx
import { Cpu } from 'lucide-react';

interface InventoryItemProps {
  name: string;
  specs: string;
  icon: React.ReactNode;
}

export default function InventoryItem({ name, specs, icon }: InventoryItemProps) {
  return (
    <div className="bg-[#1e293b]/50 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-[#1e293b] transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="text-slate-400 group-hover:text-emerald-400 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200">{name}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase">{specs}</p>
        </div>
      </div>
      <Cpu size={14} className="text-slate-700" />
    </div>
  );
}