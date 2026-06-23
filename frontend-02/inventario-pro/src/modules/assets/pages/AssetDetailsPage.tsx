// src/modules/assets/pages/AssetDetailsPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Server,
  Monitor,
  Network,
  HardDrive,
  Cpu,
} from 'lucide-react';

import { assetsService } from '../services/assets.service';
import { useAuth } from '../../auth/context/AuthContext'; 
import { canModifyModule } from '../../../shared/constants/roles';

// Importação dos componentes isolados
import { SectionCard, DetailItem } from '../components/AssetDetailsComponents';

export default function AssetDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();

  const canEditAssets = useMemo(() => {
    return canModifyModule(currentUser?.role, 'assets');
  }, [currentUser]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [asset, setAsset] = useState<any | null>(null);
  const [fetchedHostFisico, setFetchedHostFisico] = useState<any | null>(null);

  useEffect(() => {
    async function loadAssetAndRelations() {
      try {
        if (!id) {
          setErrorMessage('ID do ativo não informado.');
          return;
        }

        setLoading(true);
        const assetResponse = await assetsService.getById(String(id));
        setAsset(assetResponse);

        const currentAsset = assetResponse as any;

        if (currentAsset?.tipo === 'SERVIDOR_VIRTUAL' && !currentAsset?.hostFisico && currentAsset?.hostFisicoId) {
          try {
            const hostResponse = await assetsService.getById(String(currentAsset.hostFisicoId));
            setFetchedHostFisico(hostResponse);
          } catch (hostError) {
            console.error('Incapaz de buscar o Host Pai de forma secundária:', hostError);
          }
        } else if (currentAsset?.hostFisico) {
          setFetchedHostFisico(currentAsset.hostFisico);
        }

      } catch (error) {
        console.error(error);
        setErrorMessage('Erro ao carregar ativo.');
      } finally {
        setLoading(false);
      }
    }

    loadAssetAndRelations();
  }, [id]); 

  const isVM = asset?.tipo === 'SERVIDOR_VIRTUAL';

  /* ========================================================= */
  /* FORMATAÇÕES AUXILIARES */
  /* ========================================================= */
  function formatDate(value?: string | Date | null) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value?: number | null) {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  function formatHypervisor(tipo?: string | null) {
    if (!tipo) return '-';
    const mapeamento: Record<string, string> = {
      VMWARE: 'VMware ESXi',
      HYPERV: 'Microsoft Hyper-V',
      PROXMOX: 'Proxmox VE',
      KVM: 'KVM Linux',
      XEN: 'Xen Project',
    };
    return mapeamento[tipo.toUpperCase()] || tipo;
  }

  function getPowerStateBadge(state?: string) {
    const normalState = (state || '').toUpperCase();
    if (normalState === 'ON') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (normalState === 'OFF') return 'bg-red-500/10 border-red-500/30 text-red-400';
    return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-slate-400">
        Carregando ativo...
      </div>
    );
  }

  if (errorMessage || !asset) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070a13] p-6">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-300 max-w-md text-center">
          {errorMessage ? `⚠️ ${errorMessage}` : 'Ativo não encontrado.'}
        </div>
      </div>
    );
  }

  return (
    /* 🟢 CORREÇÃO DE CASCA: Trava o container externo na viewport, reduz margens e oculta transbordamentos brutais */
    <div className="h-screen w-full bg-[#070a13] px-8 pt-2 pb-1 text-slate-100 antialiased font-sans flex flex-col overflow-hidden min-h-0">
      
      {/* HEADER COMPACTO FIXADO */}
      {/* 🟢 Otimizado paddings e margins de mb-10 para mb-4 para compactar o topo */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shrink-0">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {asset.tipo || 'ATIVO'}
            </span>
            <span className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
              {asset.status || 'SEM STATUS'}
            </span>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
            {asset.hostname || 'Sem Hostname'}
          </h1>
          <p className="mt-1 text-xs text-slate-400 leading-none">Visualização completa dos parâmetros de inventário e infraestrutura</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEditAssets && (
            <button
              onClick={() => navigate(`/assets/${asset.id}/edit`)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400 hover:scale-[1.01] cursor-pointer"
            >
              <Pencil size={14} />
              Editar Ativo
            </button>
          )}
          
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/assets');
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
        </div>
      </div>

      {/* 🟢 CONTAINER COMPACTO REATIVO COM SCROLL INDEPENDENTE */}
      {/* Isola toda a listagem de especificações técnicas permitindo rolagem interna macia */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4 min-h-0 custom-scrollbar">
        
        {/* SEÇÃO: MÁQUINAS VIRTUAIS HOSPEDADAS */}
        {asset.vms && asset.vms.length > 0 && (
          <section className="rounded-2xl border border-cyan-500/20 bg-[#0a0f1d] p-4 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
                <Server size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  Máquinas Virtuais Dependentes
                </h2>
                <p className="text-xs text-slate-400">Instâncias virtualizadas alocadas e rodando neste host físico</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {asset.vms.map((vm: any) => (
                <div
                  key={vm.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#111625] p-4 transition-all hover:border-cyan-500/40 hover:bg-[#141b2f] shadow-lg"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">{vm.hostname}</h3>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          {vm.sistemaOperacional || 'Sistema Operacional não mapeado'}
                        </p>
                      </div>
                      <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${getPowerStateBadge(vm.powerState)}`}>
                        {vm.powerState || 'VM'}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-slate-800/50 pt-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">IP de Gerência</span>
                        <span className="font-mono text-slate-300">{vm.ipPrincipal || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Topologia vCPU</span>
                        <span className="text-slate-300 font-semibold">{vm.cpu || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Memória Provisionada</span>
                        <span className="text-slate-300 font-semibold">{vm.ram || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Storage Virtual</span>
                        <span className="text-slate-300 font-semibold">{vm.armazenamento || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/assets/${vm.id || vm.assetId}`)}
                    className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400 transition hover:border-cyan-500/40 hover:bg-slate-900 hover:text-white cursor-pointer"
                  >
                    Abrir Painel da VM
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* IDENTIFICAÇÃO PATRIMONIAL */}
        <SectionCard title="Identificação Geral" icon={<Monitor size={18} />}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="ID Registro" value={asset.id} />
            <DetailItem label="Hostname" value={asset.hostname} />
            <DetailItem label="Tag / Apelido" value={asset.apelido} />
            <DetailItem label="Família de Hardware" value={asset.hardware} />
            
            {!isVM && (
              <>
                <DetailItem label="Código de Patrimônio" value={asset.patrimonio} />
                <DetailItem label="Fabricante" value={asset.fabricante} />
                <DetailItem label="Modelo Comercial" value={asset.modelo} />
                <DetailItem label="Número de Série" value={asset.serial} />
              </>
            )}

            {asset.hypervisor && (
              <DetailItem label="Mecanismo de Virtualização" value={formatHypervisor(asset.hypervisor)} />
            )}
          </div>
        </SectionCard>

        {/* RECURSOS COMPUTACIONAIS E LÓGICOS */}
        <SectionCard title="Capacidade Lógica e Rede" icon={<Network size={18} />}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Endereço IP Principal" value={asset.ipPrincipal} />
            <DetailItem label="Distribuição / SO" value={asset.sistemaOperacional} />
            <DetailItem label="Modelo e Cores de CPU" value={asset.cpu} />
            <DetailItem label="Capacidade total RAM" value={asset.ram} />
            <DetailItem label="Volumetria Armazenamento" value={asset.armazenamento} />
            <DetailItem label="Escopo de Descrição" value={asset.descricao} />
          </div>
        </SectionCard>

        {/* SERVIDOR HOSPEDEIRO RELACIONADO (Exclusivo de VMs) */}
        {fetchedHostFisico && (
          <SectionCard title="Servidor Hospedeiro (Host Pai)" icon={<Cpu size={18} />}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailItem label="Hostname do Servidor" value={fetchedHostFisico.hostname} />
              <DetailItem label="Código de Patrimônio" value={fetchedHostFisico.patrimonio} />
              <DetailItem label="IP do Hipervisor" value={fetchedHostFisico.ipPrincipal} />
              <DetailItem label="Sistema Operacional" value={fetchedHostFisico.sistemaOperacional} />
              <DetailItem label="Tecnologia Hypervisor" value={formatHypervisor(fetchedHostFisico.hypervisor)} />
            </div>

            <button
              onClick={() => navigate(`/assets/${fetchedHostFisico.id}`)}
              className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-400 transition hover:bg-emerald-500/20 cursor-pointer"
            >
              Inspecionar Servidor Pai
            </button>
          </SectionCard>
        )}

        {/* DISTRIBUIÇÃO EM RACK */}
        {!isVM && (
          <SectionCard title="Distribuição em Rack" icon={<HardDrive size={18} />}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailItem label="Unidade Identificadora do Rack" value={asset.rack?.nome} />
              <DetailItem label="Posição de Origem" value={asset.posicaoRack ? `${asset.posicaoRack}U` : '-'} />
              <DetailItem label="Tamanho Ocupado" value={asset.tamanhoU ? `${asset.tamanhoU}U` : '-'} />
            </div>
          </SectionCard>
        )}

        {/* DADOS DE AQUISIÇÃO E CUSTOS */}
        {!isVM && (
          <SectionCard title="Dados de Aquisição e Custos" icon={<Monitor size={18} />}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailItem label="Data de Compra" value={formatDate(asset.dataCompra)} />
              <DetailItem label="Custo Contábil" value={formatCurrency(asset.valor ? Number(asset.valor) : null)} />
            </div>
          </SectionCard>
        )}

        {/* OBSERVAÇÕES INTERNAS */}
        <SectionCard title="Anotações e Observações Gerais" icon={<Monitor size={18} />}>
          <div className="rounded-2xl border border-slate-800 bg-[#050811] p-4 text-slate-400 text-xs font-medium leading-relaxed">
            {asset.observacoes || 'Nenhuma observação técnica cadastrada para este ativo.'}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

function DetailField({ label, value, className = '', highlightColor = 'text-slate-200' }: { label: string; value: any; className?: string; highlightColor?: string; }) {
  const isInvalid = value === undefined || value === null || String(value).trim() === '' || String(value).trim() === '-';
  return (
    <div className={`rounded-xl border border-white/[0.02] bg-slate-950/40 p-2.5 ${className}`}>
      <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 select-none">{label}</span>
      <span className={`block mt-0.5 text-xs font-bold truncate ${isInvalid ? 'text-slate-600 font-normal italic' : highlightColor}`}>
        {isInvalid ? 'Não informado' : String(value)}
      </span>
    </div>
  );
}