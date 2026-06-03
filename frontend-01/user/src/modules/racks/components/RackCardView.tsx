import React from 'react';

interface Ativo {
  id: number | string;
  hostname: string;
  posicaoRack: number | null;
  tamanhoU: number;
  tipo?: string;
  isVirtual?: boolean;
}

interface Rack {
  id: string;
  nome: string;
  localizacao?: string;
  capacidade: number;
  ativos: Ativo[];
}

interface RackCardViewProps {
  rack: Rack;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

// ========================
// FILTRO DE VM
// ========================
const isVirtualMachine = (asset: Ativo) => {
  const tipo = String(asset?.tipo || '').toUpperCase();
  const hostname = String(asset?.hostname || '').toUpperCase();

  return (
    asset?.isVirtual === true ||
    tipo.includes('VM') ||
    tipo.includes('VIRTUAL') ||
    tipo.includes('SERVIDOR_VIRTUAL') ||
    hostname.startsWith('VM-')
  );
};

const RackCardView = ({
  rack,
  onView,
  onEdit
}: RackCardViewProps) => {

  // ========================
  // CONFIG VISUAL
  // ========================
  const SLOT_HEIGHT = 4;
  const SLOT_GAP = 1;

  const totalU = rack.capacidade || 42;

  const slots = Array.from(
    { length: totalU },
    (_, i) => totalU - i
  );

  // ========================
  // SOMENTE ATIVOS FÍSICOS
  // ========================
  const ativosFisicos =
    rack.ativos?.filter((a) => {
      return (
        a.posicaoRack !== null &&
        a.posicaoRack > 0 &&
        !isVirtualMachine(a)
      );
    }) || [];

  return (
    <div
      className="
        bg-[#0f172a]
        border
        border-slate-800
        rounded-2xl
        p-5
        shadow-2xl
        group
        hover:border-cyan-500/40
        transition-all
        flex
        flex-col
        items-center
        w-full
        max-w-[240px]
        mx-auto
      "
    >

      {/* HEADER */}
      <div className="w-full mb-5 text-center">

        <h3
          className="
            text-white
            font-black
            text-[12px]
            uppercase
            tracking-[0.15em]
            truncate
          "
        >
          {rack.nome}
        </h3>

        <p
          className="
            text-slate-500
            text-[8px]
            font-bold
            uppercase
            mt-1
            tracking-[0.25em]
          "
        >
          {rack.localizacao || 'Data Center'}
        </p>

      </div>

      {/* RACK */}
      <div
        className="
          bg-black
          border-x-[5px]
          border-t-[5px]
          border-slate-700
          rounded-t-xl
          p-[2px]
          w-[160px]
          shadow-[0_20px_60px_rgba(0,0,0,0.8)]
          relative
        "
      >

        {slots.map((u) => {

          // ========================
          // OCUPANTES DA U
          // ========================
          const ocupantes = ativosFisicos.filter((a) => {

            const inicio = a.posicaoRack!;
            const fim =
              a.posicaoRack! +
              (a.tamanhoU || 1) -
              1;

            return (
              u >= inicio &&
              u <= fim
            );
          });

          const temConflito =
            ocupantes.length > 1;

          const ativoPrincipal =
            ocupantes[0];

          // ========================
          // EXPANSÃO MULTI-U
          // ========================
          const isExpansao =
            ativoPrincipal &&
            u > ativoPrincipal.posicaoRack!;

          // Não renderiza expansão normal
          if (
            isExpansao &&
            !temConflito
          ) {
            return null;
          }

          return (
            <div
              key={u}
              className={`
                flex
                mb-[${SLOT_GAP}px]
                transition-all
                ${
                  temConflito
                    ? 'relative z-10'
                    : ''
                }
              `}
              style={{
                height:
                  ativoPrincipal &&
                  !temConflito
                    ? `${
                        (
                          (ativoPrincipal.tamanhoU || 1) *
                          SLOT_HEIGHT
                        ) +
                        (
                          (
                            ativoPrincipal.tamanhoU || 1
                          ) - 1
                        ) *
                        SLOT_GAP
                      }px`
                    : `${SLOT_HEIGHT}px`,
              }}
            >

              {/* NUMERAÇÃO U */}
              <div
                className={`
                  w-4
                  text-[6px]
                  flex
                  items-center
                  justify-center
                  font-mono
                  pr-1
                  italic
                  select-none
                  ${
                    temConflito
                      ? 'text-red-500 font-bold'
                      : 'text-slate-700'
                  }
                `}
              >
                {u}
              </div>

              {/* SLOT */}
              <div
                className={`
                  flex-1
                  rounded-[2px]
                  flex
                  items-center
                  justify-center
                  border
                  transition-all
                  overflow-hidden
                  ${
                    temConflito
                      ? `
                        bg-red-600
                        border-red-400
                        animate-pulse
                      `
                      : ativoPrincipal
                      ? `
                        bg-gradient-to-b
                        from-cyan-500
                        to-blue-700
                        border-cyan-300/30
                        shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]
                      `
                      : `
                        bg-slate-900/40
                        border-transparent
                        hover:bg-slate-800
                      `
                  }
                `}
              >

                <span
                  className="
                    text-[5px]
                    text-white
                    font-black
                    truncate
                    px-1
                    uppercase
                    tracking-tight
                  "
                >
                  {temConflito
                    ? 'CONFLITO'
                    : ativoPrincipal?.hostname}
                </span>

              </div>

            </div>
          );
        })}

      </div>

      {/* BASE */}
      <div
        className="
          h-3
          bg-slate-700
          w-[160px]
          rounded-b-xl
          flex
          justify-around
          items-center
          px-8
          border-t
          border-black/40
        "
      >
        <div className="w-1 h-1 bg-black/60 rounded-full" />
        <div className="w-1 h-1 bg-black/60 rounded-full" />
      </div>

      {/* STATS */}
      <div className="mt-4 text-center">

        <p
          className="
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-slate-500
            font-bold
          "
        >
          Ativos Físicos
        </p>

        <p
          className="
            text-cyan-400
            font-black
            text-lg
            leading-none
            mt-1
          "
        >
          {ativosFisicos.length}
        </p>

      </div>

      {/* AÇÕES */}
      <div className="flex gap-3 mt-5 w-full">

        <button
          onClick={() => onView(rack.id)}
          className="
            flex-1
            px-3
            py-2
            bg-cyan-600
            hover:bg-cyan-500
            text-white
            text-[9px]
            font-black
            rounded-xl
            uppercase
            transition-all
          "
        >
          Detalhes
        </button>

        <button
          onClick={() => onEdit(rack.id)}
          className="
            flex-1
            px-3
            py-2
            bg-slate-800
            hover:bg-slate-700
            text-white
            text-[9px]
            font-black
            rounded-xl
            uppercase
            border
            border-slate-600
            transition-all
          "
        >
          Editar
        </button>

      </div>

    </div>
  );
};

export default RackCardView;