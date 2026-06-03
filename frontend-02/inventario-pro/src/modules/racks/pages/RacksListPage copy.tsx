import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Server,
  Database,
  Layers,
  MapPin,
  Boxes,
} from 'lucide-react';

import { racksService } from '../services/racks.service';
import type { Rack } from '../types/rack.types';

import { useNotification } from '../../../app/providers/NotificationProvider';

export default function RacksListPage() {
  const navigate = useNavigate();

  const { notify } = useNotification();

  const [loading, setLoading] =
    useState(true);

  const [racks, setRacks] =
    useState<Rack[]>([]);

  const [error, setError] =
    useState('');

  // CARD ABERTO
  const [
    selectedRackId,
    setSelectedRackId,
  ] = useState<string | null>(
    null,
  );

  // FILTROS
  const [filterName, setFilterName] =
    useState('');

  const [
    filterLocation,
    setFilterLocation,
  ] = useState('');

  const [
    filterCapacity,
    setFilterCapacity,
  ] = useState('');

  // =====================================
  // LOAD
  // =====================================

  useEffect(() => {
    loadRacks();
  }, []);

  async function loadRacks() {
    try {
      setLoading(true);

      const data =
        await racksService.getAll();

      setRacks(data);
    } catch (error) {
      console.error(error);

      setError(
        'Erro ao carregar racks',
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // DELETE
  // =====================================

  async function handleDelete(
    id: string,
  ) {
    const confirmed = confirm(
      'Deseja remover este rack?',
    );

    if (!confirmed) return;

    try {
      await racksService.remove(id);

      setRacks((prev) =>
        prev.filter(
          (rack) => rack.id !== id,
        ),
      );

      notify(
        'Rack removido com sucesso!',
        'success',
      );
    } catch (error) {
      console.error(error);

      notify(
        'Erro ao remover rack',
        'error',
      );
    }
  }

  // =====================================
  // FILTRO
  // =====================================

  const filteredRacks = useMemo(() => {
    return racks.filter((rack) => {
      const matchesName =
        (
          rack.nome?.toLowerCase() || ''
        ).includes(
          filterName.toLowerCase(),
        );

      const matchesLocation =
        (
          rack.localizacao?.toLowerCase() ||
          ''
        ).includes(
          filterLocation.toLowerCase(),
        );

      const matchesCapacity =
        filterCapacity === '' ||
        String(rack.capacidade) ===
          filterCapacity;

      return (
        matchesName &&
        matchesLocation &&
        matchesCapacity
      );
    });
  }, [
    racks,
    filterName,
    filterLocation,
    filterCapacity,
  ]);

  // =====================================
  // CAPACIDADES
  // =====================================

  const uniqueCapacities = useMemo(() => {
    const capacities = racks
      .map((r) => r.capacidade)
      .filter(Boolean);

    return Array.from(
      new Set(capacities),
    ).sort((a, b) => a - b);
  }, [racks]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070a13] text-slate-400">
        Carregando racks...
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="p-8 text-red-400">
        {error}
      </div>
    );
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="flex bg-[#070a13] text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-72 shrink-0 h-fit border-b md:border-b-0 md:border-r border-slate-900 bg-[#0a0f1d] p-5">
        {/* TITLE */}
        <div className="mb-10">
          <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.25em] text-cyan-400">
            <Server size={18} />
            Infraestrutura
          </h2>
        </div>

        {/* FILTROS */}
        <div className="space-y-6">
          {/* NOME */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Nome
            </label>

            <input
              type="text"
              value={filterName}
              onChange={(e) =>
                setFilterName(
                  e.target.value,
                )
              }
              placeholder="RACK-01..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-cyan-500
              "
            />
          </div>

          {/* LOCALIZAÇÃO */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Localização
            </label>

            <input
              type="text"
              value={filterLocation}
              onChange={(e) =>
                setFilterLocation(
                  e.target.value,
                )
              }
              placeholder="Sala segura..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-cyan-500
              "
            />
          </div>

          {/* CAPACIDADE */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Capacidade
            </label>

            <select
              value={filterCapacity}
              onChange={(e) =>
                setFilterCapacity(
                  e.target.value,
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-cyan-500
              "
            >
              <option value="">
                Todas
              </option>

              {uniqueCapacities.map(
                (cap) => (
                  <option
                    key={cap}
                    value={String(cap)}
                  >
                    {cap}U
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </aside>

      {/* MAIN */}
  {/* <main className="min-h-screen p-4 lg:px-12 lg:pt-6 lg:pb-4"> */}
      <main className="w-full h-full flex flex-col border-2 border-green-500 flex flex-col gap-4">
        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="mb-3 text-5xl font-black tracking-tight text-white">
              Racks
            </h1>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
                Localização:{' '}
                {filterLocation ||
                  'TODAS'}
              </span>

              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-violet-400">
                Capacidade:{' '}
                {filterCapacity
                  ? `${filterCapacity}U`
                  : 'TODAS'}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-5xl font-black leading-none text-cyan-400">
                {
                  filteredRacks.length
                }
              </span>

              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Racks
              </span>
            </div>

            <button
              onClick={() =>
                navigate('/racks/new')
              }
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-cyan-500
                px-5
                py-3
                font-black
                text-slate-950
                transition
                hover:scale-105
                hover:bg-cyan-400
              "
            >
              <Plus size={18} />
              Novo Rack
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {filteredRacks.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500">
            Nenhum rack encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRacks.map(
              (rack) => {
                const opened =
                  selectedRackId ===
                  rack.id;

                return (
                  <div
                    key={rack.id}
                    onClick={() =>
                      setSelectedRackId(
                        opened
                          ? null
                          : rack.id,
                      )
                    }
                    className="
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-800
                      bg-[#0b1120]
                      // p-6
                      px-6 pt-6 pb-8
                      cursor-pointer
                      transition-all
                      duration-300
                      hover:border-cyan-500/30
                      hover:bg-slate-900
                      cursor-pointer
                      min-h-[200px]
                    "
                  >
                    {/* HEADER */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-cyan-500/10
                            text-cyan-400
                          "
                        >
                          <Server
                            size={24}
                          />
                        </div>

                        <div>
                          <h2 className="text-2xl font-black text-white">
                            {rack.nome}
                          </h2>

                          <p className="mt-1 text-sm uppercase tracking-widest text-slate-500">
                            Rack de infraestrutura
                          </p>
                        </div>
                      </div>

                      {opened ? (
                        <ChevronUp className="text-slate-500" />
                      ) : (
                        <ChevronDown className="text-slate-500" />
                      )}
                    </div>

                    {/* TAGS */}
                    {/* <div className="mt-8 flex flex-wrap gap-3">
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
                        {rack.capacidade}
                        U
                      </span>

                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-emerald-400">
                        ATIVO
                      </span>
                    </div> */}

                    {/* INFO */}
                    <div className="mt-5 space-y-3">
                      <InfoRow
                        label="Localização"
                        value={
                          rack.localizacao ||
                          '-'
                        }
                        icon={
                          <MapPin
                            size={15}
                            className="text-cyan-400"
                          />
                        }
                      />

                      <InfoRow
                        label="Capacidade"
                        value={`${rack.capacidade}U`}
                        icon={
                          <Layers
                            size={15}
                            className="text-cyan-400"
                          />
                        }
                      />
                    </div>

                    {/* ACTIONS */}
                    <div
                      className={`
                        absolute
                        inset-x-0
                        bottom-0
                        border-t
                        border-slate-600
                        bg-[#0f172a]/95
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        ${
                          opened
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-full opacity-0'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 p-4">
                        {/* DETALHES */}
                        <button
                          onClick={(
                            e,
                          ) => {
                            e.stopPropagation();

                            navigate(
                              `/racks/${rack.id}`,
                            );
                          }}
                          className="
                            flex-1
                            rounded-xl
                            bg-emerald-500
                            px-4
                            py-3
                            text-sm
                            font-black
                            text-slate-950
                            transition
                            hover:bg-emerald-400
                          "
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Eye
                              size={
                                16
                              }
                            />
                            Detalhes
                          </div>
                        </button>

                        {/* EDITAR */}
                        <button
                          onClick={(
                            e,
                          ) => {
                            e.stopPropagation();

                            navigate(
                              `/racks/${rack.id}/edit`,
                            );
                          }}
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-500
                            text-white
                            transition
                            hover:bg-blue-400
                          "
                        >
                          <Pencil
                            size={
                              18
                            }
                          />
                        </button>

                        {/* EXCLUIR */}
                        <button
                          onClick={(
                            e,
                          ) => {
                            e.stopPropagation();

                            handleDelete(
                              rack.id,
                            );
                          }}
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-red-500
                            text-white
                            transition
                            hover:bg-red-400
                          "
                        >
                          <Trash2
                            size={
                              18
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// =====================================
// INFO ROW
// =====================================

function InfoRow({
  label,
  value,
  icon,
}: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        {label}
      </span>

      <div className="flex items-center gap-2 font-bold text-slate-200">
        {icon}
        {value}
      </div>
    </div>
  );
}