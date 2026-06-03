import {
  useEffect,
  useState
} from 'react';

import {
  Server,
  Loader2,
  Info,
  AlertTriangle
} from 'lucide-react';

// ========================
// TYPES
// ========================

interface Asset {
  id: string | number;
  hostname?: string;
  hardware?: string;
  tagPatrimonial?: string;
  tipo?: string;
  rackId?: string;
  posicaoRack?: number;
  tamanhoU?: number;
  isVirtual?: boolean;
}

interface Rack {
  id: string;
  nome?: string;
  capacidade?: number;
}

interface Props {
  rackId: string;
}

// ========================
// FILTRO VM
// ========================

const isVirtualMachine = (
  asset: Asset
) => {

  const tipo =
    String(asset?.tipo || '')
      .toUpperCase();

  const hostname =
    String(asset?.hostname || '')
      .toUpperCase();

  return (
    asset?.isVirtual === true ||
    tipo.includes('VM') ||
    tipo.includes('VIRTUAL') ||
    tipo.includes('SERVIDOR_VIRTUAL') ||
    hostname.startsWith('VM-')
  );
};

// ========================
// COMPONENT
// ========================

export default function RackDetailView({
  rackId
}: Props) {

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [rack, setRack] =
    useState<Rack | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedAsset,
    setSelectedAsset
  ] = useState<Asset | null>(null);

  // ========================
  // CONFIG VISUAL
  // ========================

  const SLOT_HEIGHT = 12;
  const SLOT_GAP = 2;

  // ========================
  // FETCH
  // ========================

  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        const [
          assetsRes,
          rackRes
        ] = await Promise.all([
          fetch(
            'http://localhost:3000/hardware/assets'
          ),
          fetch(
            `http://localhost:3000/hardware/racks/${rackId}`
          )
        ]);

        const allAssets =
          await assetsRes.json();

        const rackData =
          await rackRes.json();

        // ========================
        // SOMENTE FÍSICOS
        // ========================

        const filtered =
          allAssets.filter(
            (a: Asset) =>
              String(a.rackId) ===
                String(rackId) &&
              !isVirtualMachine(a)
          );

        setAssets(filtered);

        setRack(rackData);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }
    };

    if (rackId) {
      fetchData();
    }

  }, [rackId]);

  // ========================
  // LOADING
  // ========================

  if (loading) {

    return (
      <div className="p-20 text-center">

        <Loader2
          className="
            animate-spin
            inline
            text-cyan-500
          "
        />

      </div>
    );
  }

  const totalU =
    rack?.capacidade || 42;

  const slots = Array.from(
    { length: totalU },
    (_, i) => totalU - i
  );

  // ========================
  // RENDER
  // ========================

  return (
    <div className="grid grid-cols-12 gap-8">

      {/* RACK */}
      <div
        className="
          col-span-5
          bg-[#050505]
          rounded-[2rem]
          border
          border-white/10
          p-5
          shadow-[0_20px_60px_rgba(0,0,0,0.8)]
        "
      >

        <div
          className="
            bg-black
            border-x-[6px]
            border-t-[6px]
            border-slate-700
            rounded-t-xl
            p-[3px]
          "
        >

          {slots.map((u) => {

            // ========================
            // OCUPANTES
            // ========================

            const ocupantes =
              assets.filter((a) => {

                const inicio =
                  Number(a.posicaoRack);

                const fim =
                  inicio +
                  (
                    Number(a.tamanhoU) || 1
                  ) - 1;

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
              u >
                Number(
                  ativoPrincipal.posicaoRack
                );

            if (
              isExpansao &&
              !temConflito
            ) {
              return null;
            }

            return (
              <div
                key={u}
                className="flex mb-[2px]"
                style={{
                  height:
                    ativoPrincipal &&
                    !temConflito
                      ? `${
                          (
                            (
                              Number(
                                ativoPrincipal.tamanhoU
                              ) || 1
                            ) *
                            SLOT_HEIGHT
                          ) +
                          (
                            (
                              (
                                Number(
                                  ativoPrincipal.tamanhoU
                                ) || 1
                              ) - 1
                            ) *
                            SLOT_GAP
                          )
                        }px`
                      : `${SLOT_HEIGHT}px`
                }}
              >

                {/* U */}
                <div
                  className={`
                    w-5
                    text-[7px]
                    flex
                    items-center
                    justify-center
                    font-mono
                    select-none
                    ${
                      temConflito
                        ? 'text-red-500'
                        : 'text-slate-700'
                    }
                  `}
                >
                  {u}
                </div>

                {/* SLOT */}
                <div
                  onClick={() => {

                    if (
                      ativoPrincipal &&
                      !temConflito
                    ) {
                      setSelectedAsset(
                        ativoPrincipal
                      );
                    }
                  }}
                  className={`
                    flex-1
                    rounded-sm
                    border
                    flex
                    items-center
                    px-3
                    overflow-hidden
                    cursor-pointer
                    transition-all
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
                          hover:border-cyan-200
                        `
                        : `
                          bg-slate-900/40
                          border-transparent
                          hover:bg-slate-800
                        `
                    }
                  `}
                >

                  {temConflito ? (

                    <div className="flex items-center gap-2">

                      <AlertTriangle
                        size={10}
                      />

                      <span className="text-[7px] font-black uppercase">
                        Conflito
                      </span>

                    </div>

                  ) : ativoPrincipal ? (

                    <>

                      <div
                        className="
                          w-2
                          h-2
                          rounded-full
                          bg-green-400
                          shadow-[0_0_8px_#4ade80]
                          mr-3
                        "
                      />

                      <Server
                        size={10}
                        className="mr-2"
                      />

                      <span
                        className="
                          text-[8px]
                          font-black
                          uppercase
                          truncate
                        "
                      >
                        {
                          ativoPrincipal.hostname
                        }
                      </span>

                    </>

                  ) : null}

                </div>

              </div>
            );
          })}

        </div>

        {/* BASE */}
        <div
          className="
            h-4
            bg-slate-700
            rounded-b-xl
            flex
            justify-around
            items-center
            px-8
            border-t
            border-black/40
          "
        >
          <div className="w-1.5 h-1.5 bg-black/60 rounded-full" />
          <div className="w-1.5 h-1.5 bg-black/60 rounded-full" />
        </div>

      </div>

      {/* DETAILS */}
      <div
        className="
          col-span-7
          bg-slate-900/40
          rounded-[2rem]
          p-8
          border
          border-white/5
        "
      >

        {selectedAsset ? (

          <div>

            <h2
              className="
                text-3xl
                font-black
                uppercase
                text-white
              "
            >
              {
                selectedAsset.hostname ||
                selectedAsset.hardware
              }
            </h2>

            <p
              className="
                text-cyan-400
                text-xs
                font-mono
                mt-2
                mb-8
              "
            >
              {
                selectedAsset.tagPatrimonial
              }
            </p>

            <div className="grid grid-cols-2 gap-4">

              <DetailCard
                title="Tipo"
                value={
                  selectedAsset.tipo
                }
              />

              <DetailCard
                title="Posição"
                value={`U${selectedAsset.posicaoRack}`}
              />

              <DetailCard
                title="Tamanho"
                value={`${selectedAsset.tamanhoU || 1}U`}
              />

              <DetailCard
                title="Hostname"
                value={
                  selectedAsset.hostname
                }
              />

            </div>

          </div>

        ) : (

          <div
            className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              opacity-30
            "
          >

            <Info
              size={40}
              className="mb-4"
            />

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                font-black
              "
            >
              Selecione um ativo
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

// ========================
// DETAIL CARD
// ========================

function DetailCard({
  title,
  value
}: {
  title: string;
  value?: string | number;
}) {

  return (
    <div
      className="
        bg-black/20
        border
        border-white/5
        rounded-2xl
        p-5
      "
    >

      <p
        className="
          text-[8px]
          uppercase
          tracking-[0.25em]
          text-slate-500
          font-black
        "
      >
        {title}
      </p>

      <p
        className="
          text-sm
          text-white
          font-bold
          mt-2
        "
      >
        {value || '-'}
      </p>

    </div>
  );
}