import { Eye, Edit3, X } from 'lucide-react';

interface Props {
  rackName: string;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
}

export function RackSelectionModal({ rackName, onClose, onView, onEdit }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Rack: {rackName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onView}
            className="flex flex-col items-center gap-4 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group"
          >
            <div className="bg-blue-500 p-3 rounded-full text-slate-900 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <span className="font-bold text-blue-400">Ver Detalhes</span>
          </button>

          <button 
            onClick={onEdit}
            className="flex flex-col items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all group"
          >
            <div className="bg-emerald-500 p-3 rounded-full text-slate-900 group-hover:scale-110 transition-transform">
              <Edit3 size={24} />
            </div>
            <span className="font-bold text-emerald-400">Editar Rack</span>
          </button>
        </div>
      </div>
    </div>
  );
}
