import RackDetailView from '../components/RackDetailView';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';

interface Props {
  rackId: string;
  onBack: () => void;
}

export default function RackDetailsPage({
  rackId,
  onBack
}: Props) {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">

        <div className="flex items-center gap-6">

          <button
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              Detalhes do Rack
            </h1>

            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              ID: {rackId}
            </p>
          </div>

        </div>

        <div className="flex gap-3">

          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase transition-all">
            <Printer size={14} />
            Imprimir TAGs
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-emerald-400">
            <Share2 size={14} />
            Exportar Relatório
          </button>

        </div>

      </header>

      {/* CONTEÚDO */}
      <div className="max-w-7xl mx-auto">
        <RackDetailView rackId={rackId} />
      </div>

    </div>
  );
}