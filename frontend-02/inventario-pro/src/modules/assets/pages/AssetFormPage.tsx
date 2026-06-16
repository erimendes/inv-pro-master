// src/modules/assets/pages/AssetFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { assetsService } from '../services/assets.service';
import { racksService } from '../../racks/services/racks.service';

import type { Asset } from '../types/asset.types';
import { useNotification } from '../../../app/providers/NotificationProvider';

type Rack = {
  id: string;
  nome: string;
};

export default function AssetFormPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const backUrl = location.state?.from || '/assets';
  const { id } = useParams();
  const { notify } = useNotification();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [physicalHosts, setPhysicalHosts] = useState<Asset[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  
  // 🆕 ESTADOS NOVOS: Controlam a listagem e seleção de VMs filhas
  const [availableVms, setAvailableVms] = useState<Asset[]>([]);
  const [selectedVmIds, setSelectedVmIds] = useState<number[]>([]);

  const [form, setForm] = useState<Partial<Asset>>({
    patrimonio: '',
    tipo: 'LAPTOP',
    fabricante: '',
    hardware: '',
    modelo: '',
    serial: '',
    hostname: '',
    apelido: '',
    ipPrincipal: '',
    descricao: '',
    sistemaOperacional: '',
    cpu: '',
    ram: '',
    armazenamento: '',
    status: 'DISPONIVEL',
    emUso: true,
    dataCompra: undefined,
    valor: 0,
    isVirtualizado: false,
    hostFisicoId: undefined,
    userId: undefined,
    rackId: undefined,
    observacoes: '',
    posicaoRack: undefined,
    tamanhoU: undefined,
  });

  /* ========================================================= */
  /* CARREGA ATIVO PARA EDIÇÃO + VMs JÁ VINCULADAS */
  /* ========================================================= */
  useEffect(() => {
    async function loadAsset() {
      try {
        if (!id) return;

        const asset = await assetsService.getById(Number(id));
        setForm(asset);

        // 🆕 Se for um servidor físico editado, pré-marca as VMs que já eram dele
        if (asset.tipo === 'SERVIDOR_FISICO' && asset.vms) {
          const idsExistentes = asset.vms.map((vm: any) => Number(vm.id));
          setSelectedVmIds(idsExistentes);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('Erro ao carregar ativo');
      }
    }
    loadAsset();
  }, [id]);

  /* ========================================================= */
  /* CARREGA ATIVOS DO BANCO (FILTRA HOSTS E VMs DISPONÍVEIS) */
  /* ========================================================= */
  useEffect(() => {
    async function loadAllAssets() {
      try {
        const assets = await assetsService.getAll();
        
        // 1. Separa os servidores físicos para quando o formulário atual for uma VM
        const hosts = assets.filter((a: Asset) => a.tipo === 'SERVIDOR_FISICO');
        setPhysicalHosts(hosts);

        // 2. 🆕 Separa as VMs do inventário que estão livres OU que já pertencem a este servidor atual
        const vms = assets.filter((a: Asset) => {
          const isVM = a.tipo === 'SERVIDOR_VIRTUAL';
          const isOrphan = !a.hostFisicoId;
          const belongsToMe = id ? a.hostFisicoId === Number(id) : false;
          return isVM && (isOrphan || belongsToMe);
        });
        setAvailableVms(vms);
      } catch (error) {
        console.error('Erro ao carregar inventário de servidores', error);
      }
    }
    loadAllAssets();
  }, [id]);

  /* ========================================================= */
  /* CARREGA RACKS */
  /* ========================================================= */
  useEffect(() => {
    async function loadRacks() {
      try {
        const response = await racksService.getAll();
        setRacks(response);
      } catch (error) {
        console.error('Erro ao carregar racks', error);
      }
    }
    loadRacks();
  }, []);

  /* ========================================================= */
  /* GERENCIADOR DE SELEÇÃO DE CHECKBOX DE VMs */
  /* ========================================================= */
  function handleVmToggle(vmId: number) {
    setSelectedVmIds((prev) =>
      prev.includes(vmId) ? prev.filter((id) => id !== vmId) : [...prev, vmId],
    );
  }

  function handleTipoChange(novoTipo: Asset['tipo']) {
    setForm((prev) => {
      const isVM = novoTipo === 'SERVIDOR_VIRTUAL';
      return {
        ...prev,
        tipo: novoTipo,
        isVirtualizado: isVM ? true : prev.isVirtualizado,
        rackId: isVM ? undefined : prev.rackId,
        posicaoRack: isVM ? undefined : prev.posicaoRack,
        tamanhoU: isVM ? undefined : prev.tamanhoU,
        hostFisicoId: novoTipo === 'SERVIDOR_FISICO' ? undefined : prev.hostFisicoId,
      };
    });
  }

  /* ========================================================= */
  /* SUBMIT PAYLOAD */
  /* ========================================================= */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        patrimonio: form.patrimonio?.trim() || null,
        tipo: form.tipo,
        fabricante: form.fabricante?.trim() || null,
        hardware: form.hardware?.trim() || null,
        modelo: form.modelo?.trim() || null,
        serial: form.serial?.trim() || null,
        hostname: form.hostname?.trim() || null,
        apelido: form.apelido?.trim() || null,
        ipPrincipal: form.ipPrincipal?.trim() || null,
        descricao: form.descricao?.trim() || null,
        sistemaOperacional: form.sistemaOperacional?.trim() || null,
        cpu: form.cpu?.trim() || null,
        ram: form.ram?.trim() || null,
        armazenamento: form.armazenamento?.trim() || null,
        status: form.status,
        emUso: form.emUso ?? true,
        dataCompra: form.dataCompra ? new Date(form.dataCompra) : null,
        valor: Number(form.valor || 0),
        isVirtualizado: form.isVirtualizado ?? false,
        hostFisicoId: form.hostFisicoId ? Number(form.hostFisicoId) : null,
        userId: form.userId ? Number(form.userId) : null,
        rackId: form.rackId || null,
        observacoes: form.observacoes?.trim() || null,
        posicaoRack: form.posicaoRack ? Number(form.posicaoRack) : null,
        tamanhoU: form.tamanhoU ? Number(form.tamanhoU) : null,
        
        // 🆕 ENVIADO PARA O BACKEND: IDs das VMs que o admin selecionou para este servidor
        vmsIds: form.tipo === 'SERVIDOR_FISICO' ? selectedVmIds : [],
      };

      if (!payload.patrimonio || !payload.fabricante || !payload.modelo || !payload.tipo || !payload.status) {
        throw new Error('Preencha todos os campos obrigatórios (*)');
      }

      if (id) {
        await assetsService.update(Number(id), payload);
        notify('Ativo atualizado com sucesso!', 'success');
      } else {
        await assetsService.create(payload);
        notify('Ativo criado com sucesso!', 'success');
      }

      navigate(backUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Erro ao salvar ativo'
      );
      notify('Erro ao salvar ativo', 'error');
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof Asset>(field: K, value: Asset[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{id ? 'Editar Ativo' : 'Novo Ativo'}</h1>
            <p className="mt-2 text-sm text-slate-400">Gerenciamento completo e topologia do ativo</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              form="asset-form"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-300 text-sm">
            ⚠️ {errorMessage}
          </div>
        )}

        <form id="asset-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* IDENTIFICAÇÃO */}
          <Section title="Identificação Patrimonial">
            <Grid>
              <Input label="Patrimônio *" value={form.patrimonio} onChange={(v) => updateField('patrimonio', v)} />
              <Input label="Hostname" value={form.hostname} onChange={(v) => updateField('hostname', v)} />
              <Input label="Apelido / Tag" value={form.apelido} onChange={(v) => updateField('apelido', v)} />
              <Input label="Fabricante *" value={form.fabricante} onChange={(v) => updateField('fabricante', v)} />
              <Input label="Família do Hardware" value={form.hardware} onChange={(v) => updateField('hardware', v)} />
              <Input label="Modelo Comercial *" value={form.modelo} onChange={(v) => updateField('modelo', v)} />
              <Input label="Número de Série" value={form.serial} onChange={(v) => updateField('serial', v)} />
              
              <SelectField
                label="Tipo de Ativo *"
                value={form.tipo ?? 'LAPTOP'}
                onChange={(v) => handleTipoChange(v as Asset['tipo'])}
                options={[
                  { value: 'LAPTOP', label: 'Laptop' },
                  { value: 'DESKTOP', label: 'Desktop' },
                  { value: 'SERVIDOR_FISICO', label: 'Servidor Físico (Host)' },
                  { value: 'SERVIDOR_VIRTUAL', label: 'Servidor Virtual (VM)' },
                  { value: 'SWITCH', label: 'Switch' },
                  { value: 'ROTEADOR', label: 'Roteador' },
                  { value: 'STORAGE', label: 'Storage' },
                  { value: 'MONITOR', label: 'Monitor' },
                ]}
              />

              <SelectField
                label="Status Operacional *"
                value={form.status ?? 'DISPONIVEL'}
                onChange={(v) => updateField('status', v as Asset['status'])}
                options={[
                  { value: 'DISPONIVEL', label: 'Disponível' },
                  { value: 'EM_USO', label: 'Em uso' },
                  { value: 'MANUTENCAO', label: 'Manutenção' },
                  { value: 'DESCARTADO', label: 'Descartado' },
                ]}
              />
            </Grid>
          </Section>

          {/* LOCALIZAÇÃO (ESCONDIDO SE FOR VM) */}
          {form.tipo !== 'SERVIDOR_VIRTUAL' && (
            <Section title="Localização & Rack">
              <Grid>
                <SelectField
                  label="Alocação de Rack"
                  value={form.rackId ?? ''}
                  onChange={(v) => updateField('rackId', v || undefined)}
                  options={[
                    { value: '', label: 'Sem rack / Avulso' },
                    ...racks.map((rack) => ({ value: rack.id, label: rack.nome })),
                  ]}
                />
                <NumberInput label="Posição Inicial no Rack (U)" value={form.posicaoRack} onChange={(v) => updateField('posicaoRack', v)} />
                <NumberInput label="Tamanho Ocupado (U)" value={form.tamanhoU} onChange={(v) => updateField('tamanhoU', v)} />
              </Grid>
            </Section>
          )}

          {/* REDE E RECURSOS */}
          <Section title="Rede & Capacidade Lógica">
            <Grid>
              <Input label="Endereço IP Principal" value={form.ipPrincipal} onChange={(v) => updateField('ipPrincipal', v)} />
              <Input label="Descrição do Escopo" value={form.descricao} onChange={(v) => updateField('descricao', v)} />
              <Input label="Sistema Operacional" value={form.sistemaOperacional} onChange={(v) => updateField('sistemaOperacional', v)} />
              <Input label="Especificação de CPU" value={form.cpu} onChange={(v) => updateField('cpu', v)} />
              <Input label="Volumetria RAM" value={form.ram} onChange={(v) => updateField('ram', v)} />
              <Input label="Armazenamento / Disco" value={form.armazenamento} onChange={(v) => updateField('armazenamento', v)} />
            </Grid>
          </Section>

          {/* STRATEGY VIRTUALIZATION */}
          <Section title="Estratégia de Virtualização & Hierarquia">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Checkbox label="Ativo em Produção / Uso" checked={form.emUso ?? false} onChange={(v) => updateField('emUso', v)} />
                <Checkbox label="Este ativo é virtualizado?" disabled={form.tipo === 'SERVIDOR_VIRTUAL'} checked={form.isVirtualizado ?? false} onChange={(v) => updateField('isVirtualizado', v)} />
              </div>

              {/* CENÁRIO A: O ATIVO ATUAL É UMA VM -> ESCOLHE O SERVIDOR PAI */}
              {(form.isVirtualizado || form.tipo === 'SERVIDOR_VIRTUAL') && (
                <div className="max-w-md">
                  <SelectField
                    label="Servidor Host Hospedeiro (Hypervisor) *"
                    value={form.hostFisicoId ? String(form.hostFisicoId) : ''}
                    onChange={(v) => updateField('hostFisicoId', (v ? Number(v) : undefined) as any)}
                    options={[
                      { value: '', label: 'Selecione o Servidor Físico Pai' },
                      ...physicalHosts.map((host) => ({
                        value: String(host.id),
                        label: host.hostname ? `${host.hostname} [PAT: ${host.patrimonio}]` : `Host ID #${host.id}`,
                      })),
                    ]}
                  />
                </div>
              )}

              {/* 🆕 CENÁRIO B: O ATIVO ATUAL É UM SERVIDOR FÍSICO -> INCLUI MULTI-SELECT DE VMs FILHAS */}
              {form.tipo === 'SERVIDOR_FISICO' && (
                <div className="border-t border-slate-800 pt-4">
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    Vincular Máquinas Virtuais a este Host Físico
                  </label>
                  <p className="text-xs text-slate-500 mb-4">Selecione abaixo as VMs do inventário que rodam dentro deste servidor:</p>
                  
                  {availableVms.length === 0 ? (
                    <div className="text-xs p-4 text-center rounded-lg border border-dashed border-slate-800 text-slate-600 bg-slate-950/40">
                      Nenhuma máquina virtual disponível ou órfã encontrada no inventário para alocação.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableVms.map((vm) => (
                        <label 
                          key={vm.id} 
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-sm ${
                            selectedVmIds.includes(Number(vm.id))
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedVmIds.includes(Number(vm.id))}
                            onChange={() => handleVmToggle(Number(vm.id))}
                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                          />
                          <div className="flex flex-col">
                            <span>{vm.hostname}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{vm.ipPrincipal || 'Sem IP'}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* OBSERVAÇÕES */}
          <Section title="Anotações Gerais / Observações">
            <textarea
              rows={4}
              placeholder="Digite detalhes técnicos extras..."
              value={form.observacoes ?? ''}
              onChange={(e) => updateField('observacoes', e.target.value as any)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white text-sm outline-none transition focus:border-blue-500"
            />
          </Section>
        </form>
      </div>
    </div>
  );
}

/* ========================================================= */
/* COMPONENTES COMPILADOS INTERNOS DO ARQUIVO */
/* ========================================================= */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-md">
      <h2 className="mb-6 text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Input({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
      />
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value?: number; onChange: (value: number | undefined) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 select-none w-full ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-slate-700'}`}>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
      />
      {label}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}