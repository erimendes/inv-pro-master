import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  applicationsService,
} from '../services/applications.service';

import type {
  Application,
  SistemaCategoria,
  Criticidade,
} from '../types/applications.types';

import {
  Layers3,
  ShieldAlert,
  Building2,
  Cpu,
  Globe,
  Database,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  Plus,
} from 'lucide-react';

import { useAuth } from '../../auth/context/AuthContext';

export const ApplicationList =
  () => {
    const navigate =
      useNavigate();

    const { user } =
      useAuth();

    // =====================================
    // ROLE
    // =====================================

    const isAdmin =
      user?.role === 'ADMIN';

    // =====================================
    // STATES
    // =====================================

    const [apps, setApps] =
      useState<Application[]>(
        [],
      );

    const [loading, setLoading] =
      useState<boolean>(true);

    const [
      selectedCategoria,
      setSelectedCategoria,
    ] = useState<
      SistemaCategoria | undefined
    >(undefined);

    const [
      selectedCriticidade,
      setSelectedCriticidade,
    ] = useState<
      Criticidade | undefined
    >(undefined);

    const [
      deleteModalOpen,
      setDeleteModalOpen,
    ] = useState(false);

    const [
      appToDelete,
      setAppToDelete,
    ] = useState<number | null>(
      null,
    );

    // CARD ABERTO
    const [
      selectedCard,
      setSelectedCard,
    ] = useState<number | null>(
      null,
    );

    // =====================================
    // LOAD
    // =====================================

    useEffect(() => {
      const fetchApplications =
        async () => {
          setLoading(true);

          try {
            const data =
              await applicationsService.findAll(
                selectedCategoria,
                selectedCriticidade,
              );

            setApps(data);
          } catch (error) {
            console.error(
              'Erro ao buscar aplicações:',
              error,
            );
          } finally {
            setLoading(false);
          }
        };

      fetchApplications();
    }, [
      selectedCategoria,
      selectedCriticidade,
    ]);

    // =====================================
    // DELETE
    // =====================================

    const handleDelete = (
      id: number,
    ) => {
      setAppToDelete(id);

      setDeleteModalOpen(true);
    };

    const confirmDelete =
      async () => {
        if (!appToDelete) return;

        try {
          await applicationsService.remove(
            appToDelete,
          );

          setApps((prev) =>
            prev.filter(
              (app) =>
                app.id !==
                appToDelete,
            ),
          );

          setDeleteModalOpen(
            false,
          );

          setAppToDelete(
            null,
          );
        } catch (error) {
          console.error(
            'Erro ao excluir aplicação:',
            error,
          );

          alert(
            'Não foi possível excluir a aplicação.',
          );
        }
      };

    // =====================================
    // HELPERS
    // =====================================

    function getCriticidadeColor(
      criticidade?: string,
    ) {
      switch (
        criticidade
      ) {
        case 'CRITICA':
          return 'text-red-400 border-red-500/30 bg-red-500/10';

        case 'ALTA':
          return 'text-orange-400 border-orange-500/30 bg-orange-500/10';

        case 'MEDIA':
          return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';

        case 'BAIXA':
          return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

        default:
          return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
      }
    }

    function getCategoriaIcon(
      categoria?: string,
    ) {
      switch (
        categoria
      ) {
        case 'ADMINISTRATIVO':
          return (
            <Building2
              size={18}
            />
          );

        case 'OPERACIONAL':
          return (
            <Cpu
              size={18}
            />
          );

        default:
          return (
            <Globe
              size={18}
            />
          );
      }
    }

    // =====================================
    // RENDER
    // =====================================

    return (
   // <div className="flex min-h-screen bg-[#070a13] text-slate-100">
      <div className="w-full h-full flex border-2 border-green-500 gap-4">
        {/* SIDEBAR */}
    {/* <aside className="w-64 shrink-0 border-r border-slate-900 bg-[#0a0f1d] p-4 flex flex-col gap-4"> */}
        <aside className="w-72 shrink-0 h-fit border-b md:border-b-0 bg-[#0a0f1d] p-5 md:border-r border-slate-900">
          {/* TITLE */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400">
              <Layers3
                size={18}
              />
              Catálogo
            </h2>
          </div>

          {/* CATEGORIA */}
          <div className="flex flex-col gap-2">
            <span className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Categoria
            </span>

            {[
              {
                label:
                  'TODOS',
                value:
                  undefined,
              },
              {
                label:
                  'ADMINISTRATIVO',
                value:
                  'ADMINISTRATIVO',
              },
              {
                label:
                  'OPERACIONAL',
                value:
                  'OPERACIONAL',
              },
            ].map(
              (item) => {
                const active =
                  selectedCategoria ===
                  item.value;

                return (
                  <button
                    key={
                      item.label
                    }
                    onClick={() =>
                      setSelectedCategoria(
                        item.value as any,
                      )
                    }
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all
                    ${
                      active ||
                      (!selectedCategoria &&
                        item.label ===
                          'TODOS')
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {
                      item.label
                    }
                  </button>
                );
              },
            )}
          </div>

          {/* CRITICIDADE */}
          <div className="flex flex-col gap-2">
            <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ShieldAlert
                size={14}
              />
              Criticidade
            </span>

            {[
              'TODOS',
              'BAIXA',
              'MEDIA',
              'ALTA',
              'CRITICA',
            ].map(
              (
                crit,
              ) => {
                const isTodos =
                  crit ===
                  'TODOS';

                const value =
                  isTodos
                    ? undefined
                    : crit;

                const isActive =
                  isTodos
                    ? !selectedCriticidade
                    : selectedCriticidade ===
                      crit;

                return (
                  <button
                    key={
                      crit
                    }
                    onClick={() =>
                      setSelectedCriticidade(
                        value as any,
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all
                    ${
                      isActive
                        ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-400'
                        : 'border-transparent text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {crit}
                  </button>
                );
              },
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* HEADER */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="mb-3 text-5xl font-black tracking-tight text-white">
                Aplicações
              </h1>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
                  Categoria:{' '}
                  {selectedCategoria ||
                    'TODOS'}
                </span>

                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-violet-400">
                  Criticidade:{' '}
                  {selectedCriticidade ||
                    'TODOS'}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-5xl font-black leading-none text-emerald-400">
                  {
                    apps.length
                  }
                </span>

                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Sistemas
                </span>
              </div>

              {/* SOMENTE ADMIN */}
              {isAdmin && (
                <button
                  onClick={() =>
                    navigate(
                      '/applications/new',
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition hover:scale-105 hover:bg-emerald-400"
                >
                  <Plus
                    size={18}
                  />
                  Nova Aplicação
                </button>
              )}
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-400 font-medium">
              Carregando aplicações...
            </div>
          ) : apps.length ===
            0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium">
              Nenhuma aplicação encontrada.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {apps.map(
                (
                  app,
                ) => {
                  const opened =
                    selectedCard ===
                    app.id;

                  return (
                    <div
                      key={
                        app.id
                      }
                      onClick={() =>
                        setSelectedCard(
                          opened
                            ? null
                            : app.id,
                        )
                      }
                      className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-slate-800
                        bg-[#0b1120]
                        p-2
                        transition-all
                        duration-300
                        hover:border-cyan-500/30
                        hover:bg-slate-900
                        cursor-pointer
                        min-h-[320px]
                      "
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                            {getCategoriaIcon(
                              app.categoria,
                            )}
                          </div>

                          <div>
                            <h2 className="text-2xl font-black leading-tight text-white">
                              {
                                app.nome
                              }
                            </h2>

                            <p className="mt-1 text-sm uppercase tracking-widest text-slate-500">
                              {
                                app.sigla
                              }
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`
                            mt-1
                            text-slate-600
                            transition-transform
                            duration-300
                            ${
                              opened
                                ? 'rotate-90'
                                : ''
                            }
                          `}
                        />
                      </div>

                      {/* TAGS */}
                      <div className="mt-8 flex flex-wrap gap-3">
                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
                          {
                            app.categoria
                          }
                        </span>

                        <span
                          className={`
                            rounded-full
                            border
                            px-4
                            py-1
                            text-xs
                            font-black
                            uppercase
                            tracking-widest
                            ${getCriticidadeColor(
                              app.criticidade,
                            )}
                          `}
                        >
                          {
                            app.criticidade
                          }
                        </span>
                      </div>

                      {/* INFO */}
                      <div className="mt-10 space-y-5">
                        <InfoRow
                          label="Ambiente"
                          value={
                            app.ambiente ||
                            '-'
                          }
                        />

                        <InfoRow
                          label="Porta"
                          value={
                            app.porta ||
                            '-'
                          }
                        />

                        <InfoRow
                          label="Banco"
                          value={
                            app.bancoDados ||
                            '-'
                          }
                          icon={
                            <Database
                              size={
                                15
                              }
                              className="text-violet-400"
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
                          border-slate-800
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
                                `/applications/${app.id}`,
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

                          {/* SOMENTE ADMIN */}
                          {isAdmin && (
                            <>
                              {/* EDITAR */}
                              <button
                                onClick={(
                                  e,
                                ) => {
                                  e.stopPropagation();

                                  navigate(
                                    `/applications/edit/${app.id}`,
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
                                    app.id,
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </main>

        {/* MODAL DELETE */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
              <h2 className="mb-3 text-3xl font-black text-white">
                Confirmar exclusão
              </h2>

              <p className="mb-8 text-slate-400">
                Deseja realmente
                excluir esta
                aplicação?
                <br />
                Esta ação não poderá
                ser desfeita.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(
                      false,
                    );

                    setAppToDelete(
                      null,
                    );
                  }}
                  className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancelar
                </button>

                <button
                  onClick={
                    confirmDelete
                  }
                  className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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