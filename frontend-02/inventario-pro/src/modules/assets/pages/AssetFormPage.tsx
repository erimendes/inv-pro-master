// src/modules/assets/pages/AssetFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { assetsService } from '../services/assets.service';
import { racksService } from '../../racks/services/racks.service';

import type { Asset } from '../types/asset.types';
import { useNotification } from '../../../app/providers/NotificationProvider';

// Importa os componentes isolados
import { Section, Grid, Input, NumberInput, Checkbox, SelectField } from '../components/FormComponents';

type Rack = {
  id: string;
  nome: string;
};

export default function AssetFormPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mantemos o backUrl como um plano B caso o formulário seja aberto por link direto
  const backUrl = location.state?.from || '/assets';
  const { id } = useParams();
  const { notify } = useNotification();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [physicalHosts, setPhysicalHosts] = useState<Asset[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  
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
    hypervisor: '', 
    hostFisicoId: undefined,
    userId: undefined,
    rackId: undefined,
    observacoes: '',
    posicaoRack: undefined,
    tamanhoU: undefined,
  });

  const isVM = form.tipo === 'SERVIDOR_VIRTUAL';

  /* ========================================================= */
  /* 1. CARREGA LISTA GLOBAL DE ATIVOS */
  /* ========================================================= */
  useEffect(() => {
    async function loadAllAssets() {
      try {
        const assets = await assetsService.getAll();
        
        const hosts = assets.filter((a: Asset) => a.tipo === 'SERVIDOR_FISICO');
        setPhysicalHosts(hosts);

        const vms = assets.filter((a: Asset) => {
          const isAssetVM = a.tipo === 'SERVIDOR_VIRTUAL';
          const isOrphan = !a.hostFisicoId;
          const belongsToMe = id ? a.hostFisicoId === Number(id) : false;
          return isAssetVM && (isOrphan || belongsToMe);
        });
        setAvailableVms(vms);
      } catch (error) {
        console.error('Erro ao carregar inventário de servidores', error);
      }
    }
    loadAllAssets();
  }, [id]);

  /* ========================================================= */
  /* 2. CARREGA ATIVO ATUAL PARA EDIÇÃO */
  /* ========================================================= */
  useEffect(() => {
    async function loadAsset() {
      try {
        if (!id) return;

        const asset = await assetsService.getById(Number(id));
        let hypervisorDefinido = asset.hypervisor || '';
        
        if (asset.tipo === 'SERVIDOR_VIRTUAL' && asset.hostFisico) {
          hypervisorDefinido = asset.hostFisico.hypervisor || '';
        }

        setForm({
          ...asset,
          hypervisor: hypervisorDefinido,
        });

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
  /* 3. CARREGA RACKS */
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
  /* AUXILIARES DE MANIPULAÇÃO DO ESTADO */
  /* ========================================================= */
  function handleVmToggle(vmId: number) {
    setSelectedVmIds((prev) =>
      prev.includes(vmId) ? prev.filter((id) => id !== vmId) : [...prev, vmId],
    );
  }

  function handleTipoChange(novoTipo: Asset['tipo']) {
    setForm((prev) => {
      const targetIsVM = novoTipo === 'SERVIDOR_VIRTUAL';
      const targetIsHost = novoTipo === 'SERVIDOR_FISICO';
      return {
        ...prev,
        tipo: novoTipo,
        isVirtualizado: targetIsVM ? true : prev.isVirtualizado,
        hypervisor: targetIsHost ? prev.hypervisor : '',
        rackId: targetIsVM ? undefined : prev.rackId,
        posicaoRack: targetIsVM ? undefined : prev.posicaoRack,
        tamanhoU: targetIsVM ? undefined : prev.tamanhoU,
        fabricante: targetIsVM ? 'VIRTUAL' : prev.fabricante,
        modelo: targetIsVM ? 'VIRTUAL_MACHINE' : prev.modelo, 
        serial: targetIsVM ? '' : prev.serial,
        valor: targetIsVM ? 0 : prev.valor,
        dataCompra: targetIsVM ? undefined : prev.dataCompra,
        hostFisicoId: targetIsHost ? undefined : prev.hostFisicoId,
      };
    });
  }

  function updateField<K extends keyof Asset>(field: K, value: Asset[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(backUrl);
    }
  };

  /* ========================================================= */
  /* SUBMIT PAYLOAD */
  /* ========================================================= */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const payload: any = {
        tipo: form.tipo,
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
        observacoes: form.observacoes?.trim() || null,
        isVirtualizado: isVM ? true : (form.isVirtualizado ?? false),
        hostFisicoId: isVM && form.hostFisicoId ? Number(form.hostFisicoId) : null,
        userId: form.userId ? Number(form.userId) : null,
        vmsIds: form.tipo === 'SERVIDOR_FISICO' ? selectedVmIds : [],
      };

      if (isVM) {
        payload.patrimonio = `VM-${form.hostname?.trim() || Date.now()}`;
        payload.fabricante = "Virtual";
        payload.modelo = "Virtual Machine";
        payload.hardware = form.hardware?.trim() || "Virtualizado";
        payload.serial = null;
        payload.valor = 0;
        payload.dataCompra = null;
        payload.rackId = null;
        payload.posicaoRack = null;
        payload.tamanhoU = 0;
        payload.hypervisor = null;
      } else {
        payload.patrimonio = form.patrimonio?.trim() || null;
        payload.fabricante = form.fabricante?.trim() || null;
        payload.modelo = form.modelo?.trim() || null;
        payload.hardware = form.hardware?.trim() || null;
        payload.serial = form.serial?.trim() || null;
        payload.valor = Number(form.valor || 0);
        payload.dataCompra = form.dataCompra ? new Date(form.dataCompra) : null;
        payload.rackId = form.rackId || null;
        payload.posicaoRack = form.posicaoRack ? Number(form.posicaoRack) : null;
        payload.tamanhoU = form.tamanhoU ? Number(form.tamanhoU) : null;
        payload.hypervisor = form.tipo === 'SERVIDOR_FISICO' && form.hypervisor ? form.hypervisor : null;
      }

      if (!payload.patrimonio || !payload.tipo || !payload.status) {
        throw new Error('Preencha os campos de identificação obrigatórios.');
      }

      if (id) {
        await assetsService.update(Number(id), payload);
        notify('Ativo atualizado com sucesso!', 'success');
      } else {
        await assetsService.create(payload);
        notify('Ativo criado com sucesso!', 'success');
      }

      handleGoBack();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Erro ao salvar ativo');
      notify('Erro ao salvar ativo', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    /* 🟢 CASCA COMPACTA DO VIEWPORT: Trava a tela externa, aplica paddings enxutos de régua padrão */
    <div className="h-screen w-full bg-slate-950 px-8 pt-2 pb-1 text-white flex flex-col overflow-hidden min-h-0">
      <div className="mx-auto max-w-7xl w-full h-full flex flex-col min-h-0 overflow-hidden">
        
        {/* HEADER COMPACTADO FIXO */}
        {/* 🟢 Reduzido margin-bottom de mb-8 para mb-3 para evitar desperdício de espaço vertical */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{id ? 'Editar Ativo' : 'Novo Ativo'}</h1>
            <p className="mt-0.5 text-xs text-slate-400">Gerenciamento de ativos físicos e instâncias virtualizadas</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="asset-form"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            
            <button
              type="button"
              onClick={handleGoBack}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500 bg-red-500/10 p-3.5 text-red-300 text-xs shrink-0">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 🟢 FORMULÁRIO COM ROLAGEM INDEPENDENTE ISOLADA */}
        {/* Adicionado 'flex-1 overflow-y-auto pr-1 pb-4' para permitir scroll interno liso sem colapsar com o header */}
        <form id="asset-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4 min-h-0 custom-scrollbar">
          
          {/* SEÇÃO 1: IDENTIFICAÇÃO */}
          <Section title="Identificação Geral">
            <Grid>
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

              <Input label="Hostname / Nome da Máquina" value={form.hostname} onChange={(v) => updateField('hostname', v)} />
              <Input label="Apelido / Tag de Identificação" value={form.apelido} onChange={(v) => updateField('apelido', v)} />
              <Input label="Família ou Cluster de Hardware" value={form.hardware} onChange={(v) => updateField('hardware', v)} />

              {!isVM && (
                <>
                  <Input label="Patrimônio Corporativo *" value={form.patrimonio} onChange={(v) => updateField('patrimonio', v)} />
                  <Input label="Fabricante OEM *" value={form.fabricante} onChange={(v) => updateField('fabricante', v)} />
                  <Input label="Modelo Comercial *" value={form.modelo} onChange={(v) => updateField('modelo', v)} />
                  <Input label="Número de Série (Serial) " value={form.serial} onChange={(v) => updateField('serial', v)} />
                </>
              )}

              {form.tipo === 'SERVIDOR_FISICO' && (
                <SelectField
                  label="Tecnologia Hypervisor (Virtualizador) *"
                  value={form.hypervisor ?? ''}
                  onChange={(v) => updateField('hypervisor', v)}
                  options={[
                    { value: '', label: 'Selecione o Hypervisor' },
                    { value: 'VMWARE', label: 'VMware ESXi' },
                    { value: 'HYPERV', label: 'Microsoft Hyper-V' },
                    { value: 'PROXMOX', label: 'Proxmox VE' },
                    { value: 'KVM', label: 'KVM Linux' },
                    { value: 'XEN', label: 'Xen Project' },
                  ]}
                />
              )}
            </Grid>
          </Section>

          {/* SEÇÃO 2: INFRAESTRUTURA DE RACK */}
          {!isVM && (
            <Section title="Localização no Datacenter & Rack">
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

          {/* SEÇÃO 3: RECURSOS LÓGICOS */}
          <Section title="Capacidade Lógica e Rede">
            <Grid>
              <Input label="Endereço IP Principal" value={form.ipPrincipal} onChange={(v) => updateField('ipPrincipal', v)} />
              <Input label="Sistema Operacional" value={form.sistemaOperacional} onChange={(v) => updateField('sistemaOperacional', v)} />
              <Input label="Especificação de CPU" value={form.cpu} onChange={(v) => updateField('cpu', v)} />
              <Input label="Volumetria RAM" value={form.ram} onChange={(v) => updateField('ram', v)} />
              <Input label="Armazenamento total alocado" value={form.armazenamento} onChange={(v) => updateField('armazenamento', v)} />
              <Input label="Descrição do Escopo / Função" value={form.descricao} onChange={(v) => updateField('descricao', v)} />
            </Grid>
          </Section>

          {/* SEÇÃO 4: HIERARQUIA DE VIRTUALIZAÇÃO */}
          <Section title="Estratégia de Infraestrutura & Vínculos">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Checkbox label="Ativo em Produção / Operacional" checked={form.emUso ?? false} onChange={(v) => updateField('emUso', v)} />
                <Checkbox label="Este ativo hospeda virtualização?" disabled={isVM} checked={isVM ? true : (form.isVirtualizado ?? false)} onChange={(v) => updateField('isVirtualizado', v)} />
              </div>

              {isVM && (
                <div className="max-w-md">
                  <SelectField
                    label="Servidor Host Hospedeiro (Pai) *"
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

              {form.tipo === 'SERVIDOR_FISICO' && (
                <div className="border-t border-slate-800 pt-3">
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1 tracking-wider">
                    Vincular Máquinas Virtuais Dependentes
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">Selecione as instâncias virtuais do inventário criadas dentro deste nó:</p>
                  
                  {availableVms.length === 0 ? (
                    <div className="text-xs p-4 text-center rounded-xl border border-dashed border-slate-800 text-slate-600 bg-slate-950/40">
                      Nenhuma máquina virtual disponível ou órfã encontrada para alocação.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {availableVms.map((vm) => (
                        <label 
                          key={vm.id} 
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                            selectedVmIds.includes(Number(vm.id))
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedVmIds.includes(Number(vm.id))}
                            onChange={() => handleVmToggle(Number(vm.id))}
                            className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="truncate">{vm.hostname}</span>
                            <span className="text-[9px] text-slate-500 font-mono truncate">{vm.ipPrincipal || 'Sem IP'}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* ANOTAÇÕES */}
          <Section title="Anotações Gerais / Logs de Alteração">
            <textarea
              rows={3}
              placeholder="Notas de manutenção, histórico de chamados ou observações de sysadmin..."
              value={form.observacoes ?? ''}
              onChange={(e) => updateField('observacoes', e.target.value as any)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white text-xs outline-none transition focus:border-blue-500 focus:ring-0"
            />
          </Section>
        </form>
      </div>
    </div>
  );
}