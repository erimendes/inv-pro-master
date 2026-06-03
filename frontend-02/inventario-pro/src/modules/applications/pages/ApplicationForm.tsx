import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { applicationsService } from '../services/applications.service';
import { assetsService } from '../../assets/services/assets.service'; 
import type { CreateApplicationDto } from '../types/applications.types';

export const ApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<CreateApplicationDto>({
    nome: '',
    sigla: '',
    descricao: '',
    categoria: 'OPERACIONAL',
    criticidade: 'MEDIA',
    businessOwner: '',
    responsavelTecnico: '',
    contatoFuncional: '',
    fornecedor: '',
    janelaOperacao: '',
    backupInfo: '',
    procedimentoRecup: '',
    pontoUnicoFalha: '',
    tecnologiaPrincipal: '',
    databaseInfo: '',
    integracoes: '',
    servidoresIds: [], 
  });

  const [availableAssets, setAvailableAssets] = useState<any[]>([]); 
  const [loadingData, setLoadingData] = useState<boolean>(isEdit); // Adicionado estado de carregamento
  const [saving, setSaving] = useState(false);

 useEffect(() => {
    const loadInitialData = async () => {
      // 💡 1. BUSCA E FILTRAGEM DE ATIVOS (Mostra apenas servidores)
      try {
        let assets = [];
        
        if (assetsService && typeof assetsService.findAll === 'function') {
          assets = await assetsService.findAll();
        } else if (assetsService && typeof assetsService.getAll === 'function') {
          assets = await (assetsService as any).getAll();
        } else if (assetsService && typeof assetsService.list === 'function') {
          assets = await (assetsService as any).list();
        }

        // 💡 CORREÇÃO: Filtra os ativos para trazer apenas os tipos de servidor,
        // removendo LAPTOP e DESKTOP da listagem de vínculo.
        // (Ajuste os nomes das strings se no seu enum do Prisma estiver diferente)
        const apenasServidores = assets.filter((asset: any) => 
          asset.tipo === 'SERVIDOR_FISICO' || 
          asset.tipo === 'SERVIDOR_VIRTUAL'
        );
        
        setAvailableAssets(apenasServidores);

      } catch (assetError) {
        console.error('Erro ao carregar a lista de ativos/servidores:', assetError);
      }

      // 💡 2. BUSCA DA APLICAÇÃO (Mantida igual)
      if (isEdit && id) {
        setLoadingData(true);
        try {
          const response = await applicationsService.findOne(Number(id));
          
          let appData = null;
          if (response) {
            if (response.nome) appData = response;
            else if (response.data && response.data.nome) appData = response.data;
            else if (response.data && response.data.data && response.data.data.nome) appData = response.data.data;
          }

          if (appData) {
            setFormData({
              nome: appData.nome || '',
              sigla: appData.sigla || '',
              descricao: appData.descricao || '',
              categoria: appData.categoria || 'OPERACIONAL',
              criticidade: appData.criticidade || 'MEDIA',
              businessOwner: appData.businessOwner || '',
              responsavelTecnico: appData.responsavelTecnico || '',
              contatoFuncional: appData.contatoFuncional || '',
              fornecedor: appData.fornecedor || '',
              janelaOperacao: appData.janelaOperacao || '',
              backupInfo: appData.backupInfo || '',
              procedimentoRecup: appData.procedimentoRecup || '',
              pontoUnicoFalha: appData.pontoUnicoFalha || '',
              tecnologiaPrincipal: appData.tecnologiaPrincipal || '',
              databaseInfo: appData.databaseInfo || '',
              integracoes: appData.integracoes || '',
              servidoresIds: appData.servidores ? appData.servidores.map((s: any) => s.id) : [],
            });
          }
        } catch (appError) {
          console.error('Erro crítico ao buscar dados da aplicação:', appError);
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadInitialData();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServerCheckboxChange = (assetId: number, checked: boolean) => {
    setFormData(prev => {
      const currentIds = prev.servidoresIds || [];
      if (checked) {
        return { ...prev, servidoresIds: [...currentIds, assetId] };
      } else {
        return { ...prev, servidoresIds: currentIds.filter(id => id !== assetId) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await applicationsService.update(Number(id), formData);
      } else {
        await applicationsService.create(formData);
      }
      navigate('/applications');
    } catch (error) {
      console.error('Erro ao salvar aplicação:', error);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#111625] border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  // Se estiver carregando os dados da API na edição, mostra um feedback visual
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#070a13] text-slate-400 font-medium">
        Carregando dados da aplicação para edição...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 p-8 lg:p-12">
      <div className="max-w-4xl mx-auto mb-6">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="bg-[#0a0f1d] border border-slate-900 rounded-xl max-w-4xl mx-auto p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-6 pb-4 border-b border-slate-800/60">
          {isEdit ? 'Editar Aplicação' : 'Nova Aplicação'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SEÇÃO 1: IDENTIFICAÇÃO BÁSICA */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/40 pb-1">1. Dados Cadastrais</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome do Sistema *</label>
                <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Sigla</label>
                <input type="text" name="sigla" value={formData.sigla} onChange={handleChange} className={inputClass}/>
              </div>
              <div className="md:col-span-3">
                <label className={labelClass}>Descrição Geral</label>
                <textarea rows={3} name="descricao" value={formData.descricao} onChange={handleChange} className={`${inputClass} resize-none`}/>
              </div>
              <div>
                <label className={labelClass}>Categoria *</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className={`${inputClass} font-bold text-xs`}>
                  <option value="OPERACIONAL">OPERACIONAL</option>
                  <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                  <option value="INTERNO">INTERNO</option>
                  <option value="EXTERNO">EXTERNO</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Criticidade *</label>
                <select name="criticidade" value={formData.criticidade} onChange={handleChange} className={`${inputClass} font-bold text-xs`}>
                  <option value="BAIXA">BAIXA</option>
                  <option value="MEDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="CRITICA">CRÍTICA</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fornecedor / Fabricante</label>
                <input type="text" name="fornecedor" value={formData.fornecedor} onChange={handleChange} className={inputClass} placeholder="Ex: Oracle, Dev Interno..."/>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: GOVERNANÇA */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/40 pb-1">2. Responsáveis & Contatos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Business Owner (Negócio)</label>
                <input type="text" name="businessOwner" value={formData.businessOwner} onChange={handleChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Responsável Técnico</label>
                <input type="text" name="responsavelTecnico" value={formData.responsavelTecnico} onChange={handleChange} className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Contato Funcional</label>
                <input type="text" name="contatoFuncional" value={formData.contatoFuncional} onChange={handleChange} className={inputClass}/>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: ARQUITETURA TÉCNICA */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/40 pb-1">3. Stack & Arquitetura</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Tecnologia Principal / Framework</label>
                <input type="text" name="tecnologiaPrincipal" value={formData.tecnologiaPrincipal} onChange={handleChange} className={inputClass} placeholder="Ex: Node.js, Java, Python..."/>
              </div>
              <div>
                <label className={labelClass}>String / Info de Banco de Dados</label>
                <input type="text" name="databaseInfo" value={formData.databaseInfo} onChange={handleChange} className={inputClass} placeholder="Ex: PostgreSQL (Cluster Produção)"/>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Integrações Conectadas</label>
                <textarea rows={2} name="integracoes" value={formData.integracoes} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Mapeie APIs ou webhooks de terceiros consumidos..."/>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: CONTINUIDADE E RESILIÊNCIA */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/40 pb-1">4. Janelas, Backup & SPOF</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Janela de Operação / Manutenção</label>
                <input type="text" name="janelaOperacao" value={formData.janelaOperacao} onChange={handleChange} className={inputClass} placeholder="Ex: 24/7, Dias úteis comercial..."/>
              </div>
              <div>
                <label className={labelClass}>Política / Info de Backup</label>
                <input type="text" name="backupInfo" value={formData.backupInfo} onChange={handleChange} className={inputClass} placeholder="Ex: Diário Incremental (S3)"/>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Ponto Único de Falha (SPOF)</label>
                <input type="text" name="pontoUnicoFalha" value={formData.pontoUnicoFalha} onChange={handleChange} className={inputClass} placeholder="Descreva dependências críticas não redundantes..."/>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Procedimento de Recuperação de Desastre (DRP)</label>
                <textarea rows={4} name="procedimentoRecup" value={formData.procedimentoRecup} onChange={handleChange} className={`${inputClass} font-mono text-xs`} placeholder="Cole aqui os passos operacionais de emergência em caso de queda..."/>
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: ASSOCIAÇÃO DE SERVIDORES */}
          {/* SEÇÃO 5: ASSOCIAÇÃO DE SERVIDORES */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/40 pb-1">5. Vincular Servidores (Ativos)</h2>
            <label className={labelClass}>Selecione os servidores onde esta aplicação está hospedada</label>
            
            <div className="bg-[#111625] border border-slate-800 rounded-lg p-4 max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableAssets.length > 0 ? (
                availableAssets.map((asset, index) => {
                  const isChecked = formData.servidoresIds?.includes(asset.id) || false;

                  // 💡 DIAGNÓSTICO (Opcional): Mostra no console a estrutura do primeiro ativo para você descobrir o nome do campo de IP
                  if (index === 0) {
                    console.log("=== ESTRUTURA DO OBJETO ATIVO (SERVIDOR) ===", asset);
                  }

                  // 💡 MAPEAMENTO INTELIGENTE: Tenta ler o IP de várias chaves comuns do mercado
                  const serverIp = asset.ip || 
                                   asset.ipRede || 
                                   asset.ip_address || 
                                   asset.enderecoIp || 
                                   asset.host || 
                                   'Sem IP';

                  return (
                    <label 
                      key={asset.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#0a0f1d] border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => handleServerCheckboxChange(asset.id, e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <div className="text-xs font-bold truncate">
                        {asset.hostname || 'Ativo sem nome'} 
                        {/* Exibe o IP dinamicamente aqui */}
                        <span className="text-slate-500 block text-[10px] font-medium font-mono mt-0.5">
                          {serverIp}
                        </span>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 font-medium col-span-2 p-2">
                  Nenhum ativo cadastrado no módulo de Ativos para vincular.
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO DE SUBMIT */}
          <div className="flex justify-end pt-4 border-t border-slate-800/60">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-slate-950 font-black text-sm uppercase tracking-wider px-6 py-3 rounded-lg shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Dados'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};