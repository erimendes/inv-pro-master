// src/modules/inventory/components/RackUnit.tsx
interface RackUnitProps {
  unitNumber: number;
  status: string;
}

export default function RackUnit({ unitNumber, status }: RackUnitProps) {
  // Verifica se o U está ocupado por algum equipamento
  const isOccupied = status !== "DISPONÍVEL";

  return (
    <div className="flex items-center gap-4 group">
      {/* Indicador lateral do U */}
      <span className={`text-[10px] font-black w-6 transition-colors ${
        isOccupied ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'
      }`}>
        U{unitNumber.toString().padStart(2, '0')}
      </span>

      {/* Gaveta do Rack */}
      <div className={`
        flex-grow h-10 rounded-md flex items-center px-6 transition-all border
        ${isOccupied 
          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[inset_0_1px_20px_rgba(16,185,129,0.05)]' 
          : 'bg-[#0f172a] border-white/5 hover:border-emerald-500/30 cursor-pointer'
        }
      `}>
        <div className="flex items-center justify-between w-full">
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
            isOccupied ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
          }`}>
            {status}
          </span>

          {/* Indicador de remoção (aparece no hover se estiver ocupado) */}
          {isOccupied && (
            <span className="text-[9px] font-bold text-emerald-500/0 group-hover:text-red-400 uppercase transition-all">
              [ Clique para remover ]
            </span>
          )}
        </div>
      </div>
      
      {/* "Parafusos" do Rack para dar realismo visual */}
      <div className="flex flex-col gap-4 opacity-20">
        <div className="w-1 h-1 bg-white rounded-full" />
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
}