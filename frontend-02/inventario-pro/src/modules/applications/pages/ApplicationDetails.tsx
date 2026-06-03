import React, {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowLeft,
  Pencil,
  ShieldAlert,
  Database,
  Server,
  Clock,
  RefreshCw,
} from 'lucide-react';

import {
  applicationsService,
} from '../services/applications.service';

// ✅ IMPORT AUTH
import { useAuth } from '../../auth/context/AuthContext';

export const ApplicationDetails =
  () => {
    const { id } =
      useParams<{
        id: string;
      }>();

    const navigate =
      useNavigate();

    // ✅ USER LOGADO
    const { user } =
      useAuth();

    // ✅ VERIFICA ADMIN
    const isAdmin =
      user?.role ===
      'ADMIN';

    const [app, setApp] =
      useState<any>(null);

    const [loading, setLoading] =
      useState(true);

    useEffect(() => {
      if (!id) return;

      const fetchApp =
        async () => {
          try {
            setLoading(true);

            const response =
              await applicationsService.findOne(
                Number(id),
              );

            // ✅ TRATAMENTO FLEXÍVEL DA API
            let appData =
              null;

            if (
              response
            ) {
              if (
                response.nome
              ) {
                appData =
                  response;
              } else if (
                response.data &&
                response
                  .data.nome
              ) {
                appData =
                  response.data;
              } else if (
                response.data &&
                response
                  .data
                  .data &&
                response
                  .data
                  .data
                  .nome
              ) {
                appData =
                  response
                    .data
                    .data;
              }
            }

            setApp(
              appData,
            );
          } catch (
            error
          ) {
            console.error(
              'Erro ao buscar detalhes da aplicação:',
              error,
            );
          } finally {
            setLoading(
              false,
            );
          }
        };

      fetchApp();
    }, [id]);

    // =====================================
    // LOADING
    // =====================================

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-[#070a13] text-slate-400 font-medium">
          Carregando detalhes da
          aplicação...
        </div>
      );
    }

    // =====================================
    // NOT FOUND
    // =====================================

    if (!app) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#070a13] text-slate-400 gap-4">
          <p>
            Aplicação não
            encontrada ou erro
            na resposta da API.
          </p>

          <button
            onClick={() =>
              navigate(
                '/applications',
              )
            }
            className="text-emerald-400 font-bold hover:underline flex items-center gap-2"
          >
            <ArrowLeft
              size={
                16
              }
            />
            Voltar para a
            listagem
          </button>
        </div>
      );
    }

    // =====================================
    // HELPERS
    // =====================================

    const getCriticidadeColor =
      (
        crit: string,
      ) => {
        switch (
          crit?.toUpperCase()
        ) {
          case 'CRITICA':
          case 'CRÍTICA':
            return 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50';

          case 'ALTA':
            return 'bg-teal-950/50 text-teal-400 border border-teal-800/50';

          case 'MEDIA':
          case 'MÉDIA':
            return 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/50';

          default:
            return 'bg-slate-800 text-slate-400 border border-slate-700';
        }
      };

    // =====================================
    // RENDER
    // =====================================

    return (
      <div className="min-h-screen bg-[#070a13] text-slate-100 p-8 lg:p-12">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
          <button
            onClick={() =>
              navigate(
                '/applications',
              )
            }
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft
              size={
                16
              }
            />
            Voltar
          </button>

          {/* ✅ SOMENTE ADMIN */}
          {isAdmin && (
            <button
              onClick={() =>
                navigate(
                  `/applications/edit/${app.id}`,
                )
              }
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Pencil
                size={
                  14
                }
              />
              Editar Sistema
            </button>
          )}
        </div>

        {/* CARD */}
        <div className="bg-[#0a0f1d] border border-slate-900 rounded-xl max-w-5xl mx-auto p-8 shadow-2xl space-y-8">
          {/* TOPO */}
          <div className="flex justify-between items-start border-b border-slate-800/60 pb-6">
            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">
                {app.sigla ||
                  'SEM SIGLA'}
              </span>

              <h1 className="text-3xl font-black text-white">
                {app.nome}
              </h1>
            </div>

            <span
              className={`px-3 py-1 rounded font-bold uppercase tracking-wider text-sm ${getCriticidadeColor(
                app.criticidade,
              )}`}
            >
              {
                app.criticidade
              }
            </span>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* GERAL */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-2">
                Informações
                Gerais
              </h3>

              <div className="bg-[#111625] p-5 rounded-lg border border-slate-800/40 space-y-4">
                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                    Descrição
                  </span>

                  <p className="text-sm text-slate-300 font-medium whitespace-pre-line">
                    {app.descricao ||
                      'Nenhuma descrição fornecida.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                      Categoria
                    </span>

                    <p className="text-sm text-slate-300 font-bold">
                      {
                        app.categoria
                      }
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                      Fornecedor
                    </span>

                    <p className="text-sm text-slate-300 font-medium">
                      {app.fornecedor ||
                        'Desenvolvimento Interno'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* GOVERNANÇA */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-2">
                Governança &
                Contatos
              </h3>

              <div className="bg-[#111625] p-5 rounded-lg border border-slate-800/40 space-y-4">
                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                    Business Owner
                  </span>

                  <p className="text-sm text-slate-300 font-semibold">
                    {app.businessOwner ||
                      'Não informado'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                    Responsável
                    Técnico
                  </span>

                  <p className="text-sm text-slate-300 font-semibold">
                    {app.responsavelTecnico ||
                      'Não informado'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                    Contato
                    Funcional
                  </span>

                  <p className="text-sm text-slate-300 font-medium">
                    {app.contatoFuncional ||
                      'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* TECNOLOGIA */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-2">
                Tecnologia &
                Dados
              </h3>

              <div className="bg-[#111625] p-5 rounded-lg border border-slate-800/40 space-y-4">
                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                    Tecnologia
                    Principal
                  </span>

                  <p className="text-sm text-slate-300 font-semibold">
                    {app.tecnologiaPrincipal ||
                      'Não informada'}
                  </p>
                </div>

                <div className="flex gap-3 items-start text-sm">
                  <Database
                    size={16}
                    className="text-slate-500 mt-0.5 shrink-0"
                  />

                  <div>
                    <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-0.5">
                      Banco de
                      Dados
                    </span>

                    <p className="text-slate-300 font-medium">
                      {app.databaseInfo ||
                        'Não mapeado'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start text-sm">
                  <RefreshCw
                    size={16}
                    className="text-slate-500 mt-0.5 shrink-0"
                  />

                  <div>
                    <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-0.5">
                      Integrações
                    </span>

                    <p className="text-slate-300 font-medium whitespace-pre-line">
                      {app.integracoes ||
                        'Nenhuma integração registrada.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTINUIDADE */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-2">
                Continuidade &
                Operação
              </h3>

              <div className="bg-[#111625] p-5 rounded-lg border border-slate-800/40 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2.5 items-start text-sm">
                    <Clock
                      size={16}
                      className="text-slate-500 mt-0.5 shrink-0"
                    />

                    <div>
                      <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-0.5">
                        Janela de
                        Operação
                      </span>

                      <p className="text-slate-300 font-medium text-xs">
                        {app.janelaOperacao ||
                          '24/7'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start text-sm">
                    <Server
                      size={16}
                      className="text-slate-500 mt-0.5 shrink-0"
                    />

                    <div>
                      <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-0.5">
                        Rotina de
                        Backup
                      </span>

                      <p className="text-slate-300 font-medium text-xs">
                        {app.backupInfo ||
                          'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-start text-sm border-t border-slate-800/40 pt-3">
                  <ShieldAlert
                    size={16}
                    className="text-amber-500 mt-0.5 shrink-0"
                  />

                  <div>
                    <span className="text-amber-500/80 font-bold text-xs uppercase block tracking-wide mb-0.5">
                      SPOF
                    </span>

                    <p className="text-slate-300 font-medium">
                      {app.pontoUnicoFalha ||
                        'Nenhum ponto crítico identificado.'}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-slate-500 font-bold text-xs uppercase block tracking-wide mb-1">
                    Procedimento
                    de Recuperação
                  </span>

                  <p className="text-slate-300 font-medium text-xs bg-slate-950/40 p-3 rounded border border-slate-900/60 font-mono whitespace-pre-line">
                    {app.procedimentoRecup ||
                      'Procedimento operacional padrão não anexado.'}
                  </p>
                </div>
              </div>
            </div>

            {/* SERVIDORES */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-2">
                Servidores de
                Hospedagem
              </h3>

              <div className="bg-[#111625] p-4 rounded-lg border border-slate-800/40">
                {app.servidores &&
                app.servidores
                  .length >
                  0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {app.servidores.map(
                      (
                        servidor: any,
                      ) => {
                        const serverIp =
                          servidor.ip ||
                          servidor.ipAddress ||
                          servidor.ip_address ||
                          servidor.enderecoIp ||
                          servidor.host ||
                          'Sem IP';

                        const serverName =
                          servidor.nome ||
                          servidor.name ||
                          'Servidor sem nome';

                        return (
                          <div
                            key={
                              servidor.id
                            }
                            className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />

                            <div className="truncate">
                              <span className="text-slate-200 block truncate mb-0.5">
                                {
                                  serverName
                                }
                              </span>

                              <span className="text-slate-600 font-mono font-medium block text-[10px]">
                                {
                                  serverIp
                                }
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">
                    Nenhum servidor
                    associado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };