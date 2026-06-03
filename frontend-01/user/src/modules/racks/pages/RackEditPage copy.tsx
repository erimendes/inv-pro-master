import RackEditorView from '../components/RackEditorView';
import {
  ArrowLeft,
  LayoutGrid,
  Server
} from 'lucide-react';

interface Props {
  rackId: string;
  onBack: () => void;
}

export default function RackEditPage({
  rackId,
  onBack
}: Props) {

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">

        <div className="flex items-center gap-5">

          <button
            onClick={onBack}
            className="
              p-3
              rounded-2xl
              bg-white/5
              hover:bg-white/10
              border
              border-white/5
              transition-all
            "
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <div className="flex items-center gap-3 mb-2">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-emerald-500/10
                  border
                  border-emerald-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <LayoutGrid
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h1
                  className="
                    text-3xl
                    font-black
                    uppercase
                    tracking-tight
                  "
                >
                  Rack Editor
                </h1>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.3em]
                    text-emerald-500
                    font-bold
                  "
                >
                  Gestão Física de Equipamentos
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* STATUS */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-3
            bg-white/5
            border
            border-white/5
            rounded-2xl
            px-5
            py-3
          "
        >

          <Server
            size={16}
            className="text-emerald-400"
          />

          <div>
            <p className="text-[9px] uppercase text-slate-500 font-bold">
              Rack ID
            </p>

            <p className="text-xs font-black text-white">
              {rackId}
            </p>
          </div>

        </div>

      </header>

      {/* VIEW */}
      <div className="max-w-7xl mx-auto">
        <RackEditorView rackId={rackId} />
      </div>

    </div>
  );
}