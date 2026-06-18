// /src/modules/assets/pages/AssetDetailsPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function AssetDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  // 🛡️ Validação de privilégios de gravação/edição central do app
  const canEditAssets = useMemo(() => {
    return canModifyModule(currentUser?.role, 'assets');
  }, [currentUser]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [asset, setAsset] = useState<any | null>(null);
  
  // Estado complementar para o Host Pai tipado flexivelmente
  const [fetchedHostFisico, setFetchedHostFisico] = useState<any | null>(null);

  useEffect(() => {
    async function loadAssetAndRelations() {
      try {
        if (!id) {
          setErrorMessage('ID do ativo não informado.');
          return;
        }

        setLoading(true);
        // 🌟 CORREÇÃO: Passando o 'id' como String diretamente para o serviço
        const assetResponse = await assetsService.getById(String(id));
        setAsset(assetResponse);

        const currentAsset = assetResponse as any;

        // 🌟 CORREÇÃO: Passando o 'hostFisicoId' convertido para String para o serviço
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

  // Traduz o Enum HypervisorTipo enviado pelo Prisma para exibição limpa na tela
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

  // Determina a cor visual baseada no Enum de PowerState do Prisma (ON, OFF, PAUSED, SUSPENDED)
  function getPowerStateBadge(state?: string) {
    const normalState = (state || '').toUpperCase();
    if (normalState === 'ON') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (normalState === 'OFF') return 'bg-red-500/10 border-red-500/30 text-red-400';
    return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-slate-400">
        Carregando ativo...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] p-6">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-300 max-w-md text-center">
          ⚠️ {errorMessage}
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-white">
        Ativo não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100">
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
                {asset.tipo || 'ATIVO'}
              </span>
              <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-300">
                {asset.status || 'SEM STATUS'}
              </span>
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight text-white">
              {asset.hostname || 'Sem Hostname'}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Visualização completa dos parâmetros de inventário e infraestrutura</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canEditAssets && (
              <button
                onClick={() => navigate(`/assets/${asset.id}/edit`)}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400 hover:scale-[1.02]"
              >
                <Pencil size={16} />
                Editar Ativo
              </button>
            )}
            <button
              onClick={() => navigate('/assets')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-300 transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>

        {/* SEÇÃO: MÁQUINAS VIRTUAIS HOSPEDADAS */}
        {asset.vms && asset.vms.length > 0 && (
          <section className="mb-8 rounded-2xl border border-cyan-500/20 bg-[#0a0f1d] p-6 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400 border border-cyan-500/20">
                <Server size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  Máquinas Virtuais Dependentes
                </h2>
                <p className="text-sm text-slate-400">Instâncias virtualizadas alocadas e rodando neste host físico</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {asset.vms.map((vm: any) => (
                <div
                  key={vm.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#111625] p-5 transition-all hover:border-cyan-500/40 hover:bg-[#141b2f] shadow-lg"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{vm.hostname}</h3>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                          {vm.sistemaOperacional || 'Sistema Operacional não mapeado'}
                        </p>
                      </div>
                      
                      <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${getPowerStateBadge(vm.powerState)}`}>
                        {vm.powerState || 'VM'}
                      </span>
                    </div>

                    <div className="space-y-2.5 border-t border-slate-800/50 pt-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">IP de Gerência</span>
                        <span className="font-mono text-slate-300">{vm.ipPrincipal || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Topologia vCPU</span>
                        <span className="text-slate-300 text-xs font-semibold">{vm.cpu || '-'}</span>
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
                    onClick={() => navigate(`/assets/${vm.id}`)}
                    className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-400 transition hover:border-cyan-500/40 hover:bg-slate-900 hover:text-white"
                  >
                    Abrir Painel da VM
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* IDENTIFICAÇÃO FÍSICA E PATRIMONIAL */}
        <SectionCard title="Identificação Patrimonial" icon={<Monitor size={20} />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="ID Registro" value={asset.id} />
            <DetailItem label="Código de Patrimônio" value={asset.patrimonio} />
            <DetailItem label="Hostname" value={asset.hostname} />
            <DetailItem label="Tag / Apelido" value={asset.apelido} />
            <DetailItem label="Fabricante" value={asset.fabricante} />
            <DetailItem label="Família de Hardware" value={asset.hardware} />
            <DetailItem label="Modelo Comercial" value={asset.modelo} />
            <DetailItem label="Número de Série" value={asset.serial} />
            {asset.hypervisor && (
              <DetailItem label="Mecanismo de Virtualização" value={formatHypervisor(asset.hypervisor)} />
            )}
          </div>
        </SectionCard>

        {/* RECURSOS COMPUTACIONAIS E LÓGICOS */}
        <SectionCard title="Capacidade Lógica e Rede" icon={<Network size={20} />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Endereço IP Principal" value={asset.ipPrincipal} />
            <DetailItem label="Distribuição / SO" value={asset.sistemaOperacional} />
            <DetailItem label="Modelo e Cores de CPU" value={asset.cpu} />
            <DetailItem label="Capacidade total RAM" value={asset.ram} />
            <DetailItem label="Volumetria Armazenamento" value={asset.armazenamento} />
            <DetailItem label="Escopo de Descrição" value={asset.descricao} />
          </div>
        </SectionCard>

        {/* SERVIDOR HOSPEDEIRO RELACIONADO */}
        {fetchedHostFisico && (
          <SectionCard title="Servidor Hospedeiro (Host Pai)" icon={<Cpu size={20} />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailItem label="Hostname do Servidor" value={fetchedHostFisico.hostname} />
              <DetailItem label="Código de Patrimônio" value={fetchedHostFisico.patrimonio} />
              <DetailItem label="IP do Hipervisor" value={fetchedHostFisico.ipPrincipal} />
              <DetailItem label="Sistema Operacional" value={fetchedHostFisico.sistemaOperacional} />
              <DetailItem label="Tecnologia Hypervisor" value={formatHypervisor(fetchedHostFisico.hypervisor)} />
            </div>

            <button
              onClick={() => navigate(`/assets/${fetchedHostFisico.id}`)}
              className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-emerald-400 transition hover:bg-emerald-500/20"
            >
              Inspecionar Servidor Pai
            </button>
          </SectionCard>
        )}

        {/* ALOCAÇÃO FÍSICA NO DATACENTER */}
        <SectionCard title="Distribuição em Rack" icon={<HardDrive size={20} />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Unidade Identificadora do Rack" value={asset.rack?.nome} />
            <DetailItem label="Posição de Origem" value={asset.posicaoRack ? `${asset.posicaoRack}U` : '-'} />
            <DetailItem label="Tamanho Ocupado" value={asset.tamanhoU ? `${asset.tamanhoU}U` : '-'} />
          </div>
        </SectionCard>

        {/* METADADOS CONTÁBEIS */}
        <SectionCard title="Dados de Aquisição e Custos" icon={<Monitor size={20} />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Data de Compra" value={formatDate(asset.dataCompra)} />
            <DetailItem label="Custo Contábil" value={formatCurrency(asset.valor ? Number(asset.valor) : null)} />
          </div>
        </SectionCard>

        {/* OBSERVAÇÕES INTERNAS */}
        <SectionCard title="Anotações e Observações Gerais" icon={<Monitor size={20} />}>
          <div className="rounded-2xl border border-slate-800 bg-[#050811] p-5 text-slate-400 text-sm font-medium leading-relaxed">
            {asset.observacoes || 'Nenhuma observação técnica cadastrada para este ativo.'}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-800/80 bg-[#0a0f1d] p-6 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">{icon}</div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value?: any }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#111625] p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="break-words text-sm font-semibold text-white">
        {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
      </p>
    </div>
  );
}