// src/modules/applications/pages/ApplicationDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  ShieldAlert,
  Database,
  Server,
  Clock,
  RefreshCw,
} from 'lucide-react';

import { applicationsService } from '../services/applications.service';
import { useAuth } from '../../auth/context/AuthContext';

export const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // VERIFICA SE POSSUI PRIVILÉGIOS DE ADMINISTRAÇÃO
  const isAdmin = user?.role === 'ADMIN';

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchApp = async () => {
      try {
        setLoading(true);
        const response = await applicationsService.findOne(Number(id));

        // TRATAMENTO FLEXÍVEL DA API
        let appData = null;
        if (response) {
          if (response.nome) {
            appData = response;
          } else if (response.data && response.data.nome) {
            appData = response.data;
          } else if (response.data && response.data.data && response.data.data.nome) {
            appData = response.data.data;
          }
        }
        setApp(appData);
      } catch (error) {
        console.error('Erro ao buscar detalhes da aplicação:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-slate-400 font-medium">
        Carregando detalhes da aplicação...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-[#070a13] text-slate-400 gap-4 p-6">
        <p>Aplicação não encontrada ou erro na resposta da API.</p>
        <button
          onClick={() => navigate('/applications')}
          className="text-emerald-400 font-bold hover:underline flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para a listagem
        </button>
      </div>
    );
  }

  const getCriticidadeColor = (crit: string) => {
    switch (crit?.toUpperCase()) {
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

  return (
    /* 🟢 CORREÇÃO DA CASCA: Fixa na viewport, enxuga margens de topo e base e impede quebras externas */
    <div className="h-screen w-full bg-[#070a13] px-8 pt-2 pb-1 text-slate-100 antialiased font-sans flex flex-col overflow-hidden min-h-0">
      
      {/* HEADER COMPACTADO FIXADO */}
      {/* 🟢 Otimizado margin de mb-8 para mb-3 para manter consistência milimétrica com as outras páginas */}
      <div className="flex justify-between items-center mb-3 max-w-5xl w-full mx-auto shrink-0">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate(`/applications/edit/${app.id}`)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/5 cursor-pointer"
          >
            <Pencil size={12} />
            Editar Sistema
          </button>
        )}
      </div>

      {/* 🟢 AREA INTERNA DE CONTEÚDO COM ROLAGEM INDEPENDENTE ISOLADA */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 max-w-5xl w-full mx-auto min-h-0 custom-scrollbar">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-[#0a0f1d] border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-6">
          
          {/* TOPO DE IDENTIFICAÇÃO DO SISTEMA */}
          <div className="flex justify-between items-start border-b border-slate-800/60 pb-4">
            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">
                {app.sigla || 'SEM SIGLA'}
              </span>
              <h1 className="text-2xl font-black text-white leading-none tracking-tight">
                {app.nome}
              </h1>
            </div>

            <span className={`px-2.5 py-0.5 rounded font-black uppercase tracking-wider text-[10px] ${getCriticidadeColor(app.criticidade)}`}>
              {app.criticidade}
            </span>
          </div>

          {/* GRID DE METADADOS TÉCNICOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD: INFORMAÇÕES GERAIS */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5">
                Informações Gerais
              </h3>
              <div className="bg-[#111625] p-4 rounded-xl border border-slate-800/40 space-y-3.5">
                <div>
                  <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                    Descrição
                  </span>
                  <p className="text-xs text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                    {app.descricao || 'Nenhuma descrição fornecida.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                      Categoria
                    </span>
                    <p className="text-xs text-slate-300 font-black uppercase">
                      {app.categoria}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                      Fornecedor
                    </span>
                    <p className="text-xs text-slate-300 font-medium">
                      {app.fornecedor || 'Desenvolvimento Interno'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: GOVERNANÇA */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5">
                Governança & Contatos
              </h3>
              <div className="bg-[#111625] p-4 rounded-xl border border-slate-800/40 space-y-3.5">
                <div>
                  <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                    Business Owner
                  </span>
                  <p className="text-xs text-slate-300 font-semibold">
                    {app.businessOwner || 'Não informado'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                    Responsável Técnico
                  </span>
                  <p className="text-xs text-slate-300 font-semibold">
                    {app.responsavelTecnico || 'Não informado'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                    Contato Funcional
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    {app.contatoFuncional || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD: TECNOLOGIA */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5">
                Tecnologia & Dados
              </h3>
              <div className="bg-[#111625] p-4 rounded-xl border border-slate-800/40 space-y-3.5">
                <div>
                  <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                    Tecnologia Principal
                  </span>
                  <p className="text-xs text-slate-300 font-semibold">
                    {app.tecnologiaPrincipal || 'Não informada'}
                  </p>
                </div>

                <div className="flex gap-2.5 items-start text-xs">
                  <Database size={14} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                      Banco de Dados
                    </span>
                    <p className="text-slate-300 font-medium">
                      {app.databaseInfo || 'Não mapeado'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs">
                  <RefreshCw size={14} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                      Integrações
                    </span>
                    <p className="text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                      {app.integracoes || 'Nenhuma integração registrada.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: CONTINUIDADE */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5">
                Continuidade & Operação
              </h3>
              <div className="bg-[#111625] p-4 rounded-xl border border-slate-800/40 space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2 items-start text-xs">
                    <Clock size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                        Janela
                      </span>
                      <p className="text-slate-300 font-medium">
                        {app.janelaOperacao || '24/7'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start text-xs">
                    <Server size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                        Backup
                      </span>
                      <p className="text-slate-300 font-medium">
                        {app.backupInfo || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs border-t border-slate-800/40 pt-3">
                  <ShieldAlert size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-amber-500 font-black text-[9px] uppercase block tracking-wider mb-0.5">
                      SPOF (Ponto Único de Falha)
                    </span>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {app.pontoUnicoFalha || 'Nenhum ponto crítico identificado.'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-black text-[9px] uppercase block tracking-wider mb-1">
                    Procedimento de Recuperação
                  </span>
                  <p className="text-slate-300 font-medium text-[11px] bg-slate-950/40 p-2.5 rounded border border-slate-900/60 font-mono whitespace-pre-line leading-relaxed">
                    {app.procedimentoRecup || 'Procedimento operacional padrão não anexado.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD INFRA: SERVIDORES ASSOCIADOS */}
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5">
                Servidores de Hospedagem
              </h3>
              <div className="bg-[#111625] p-3 rounded-xl border border-slate-800/40">
                {app.servidores && app.servidores.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {app.servidores.map((servidor: any) => {
                      const serverIp = servidor.ip || servidor.ipAddress || servidor.ip_address || servidor.enderecoIp || servidor.host || 'Sem IP';
                      const serverName = servidor.nome || servidor.name || 'Servidor sem nome';

                      return (
                        <div
                          key={servidor.id}
                          className="bg-[#0a0f1d] border border-slate-800/80 p-2.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2.5 min-w-0"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <div className="truncate min-w-0 flex-1">
                            <span className="text-slate-200 block truncate mb-0.5 font-bold">
                              {serverName}
                            </span>
                            <span className="text-slate-500 font-mono font-medium block text-[10px]">
                              {serverIp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs p-2 text-slate-500 font-medium">
                    Nenhum servidor físico ou virtual associado a este sistema.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};