// /src/modules/assets/pages/AssetFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { assetsService } from '../services/assets.service';
import { racksService } from '../../racks/services/racks.service';

import type { Asset } from '../types/asset.types';

import { useNotification } from '../../../app/providers/NotificationProvider';


import { useAuth } from '../../../modules/auth/context/AuthContext';
import { canModifyModule } from '../../../shared/constants/roles';

// 🔄 Importação limpa apontando apenas para o diretório do Form
import { Section, Grid, Input, NumberInput, Checkbox, SelectField } from '../../../shared/components/Form';

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

  // 🔄 Estado inicial ajustado estritamente com os nomes das colunas do Prisma Schema
  const [form, setForm] = useState<Partial<Asset>>({
    patrimonio: '',
    tipo: 'LAPTOP',
    fabricante: '',
    hardware: '',
    modelo: '',
    serial: '',
    hostname: '',
    apelido: '',
    descricao: '',
    tag: '',
    ipPrincipal: '',
    sistemaOperacional: '',
    versaoSO: '',
    cpu: '',
    nucleosCPU: undefined,
    threadsCPU: undefined,
    ram: '',
    armazenamento: '',
    gpu: '',
    macAddress: '',
    status: 'DISPONIVEL',
    powerState: undefined,
    criticidade: 'MEDIA',
    emUso: true,
    monitorado: true,
    dataCompra: undefined,
    garantiaFim: undefined,
    valor: 0,
    fornecedor: '',
    observacoes: '',
    isVirtualizado: false,
    hypervisor: undefined,
    vmId: '',
    cluster: '',
    datacenter: '',
    hostFisicoId: undefined,
    userId: undefined,
    rackId: undefined,
    posicaoRack: undefined,
    tamanhoU: undefined,
    glpiId: undefined,
  });

  const { user, loading: authLoading } = useAuth();

  // Guarda de Segurança para escrita
  useEffect(() => {
    if (!authLoading) {
      if (!canModifyModule(user?.role, 'assets')) {
        console.warn(`🛑 Operação de escrita negada para a role: ${user?.role}`);
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadAsset() {
      try {
        if (!id) return;
        const asset = await assetsService.getById(Number(id));
        setForm(asset);
      } catch (error) {
        console.error(error);
        setErrorMessage('Erro ao carregar ativo');
      }
    }
    loadAsset();
  }, [id]);

  useEffect(() => {
    async function loadPhysicalHosts() {
      try {
        const assets = await assetsService.getAll();
        setPhysicalHosts(assets.filter((asset: Asset) => asset.tipo === 'SERVIDOR_FISICO'));
      } catch (error) {
        console.error('Erro ao carregar hosts físicos', error);
      }
    }
    loadPhysicalHosts();
  }, []);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 🔄 Montagem do DTO limpo baseado em tipos reais do Prisma
      const payload = {
        patrimonio: form.patrimonio?.trim() || null,
        tipo: form.tipo,
        fabricante: form.fabricante?.trim() || null,
        hardware: form.hardware?.trim() || null,
        modelo: form.modelo?.trim() || null,
        serial: form.serial?.trim() || null,
        hostname: form.hostname?.trim() || null,
        apelido: form.apelido?.trim() || null,
        descricao: form.descricao?.trim() || null,
        tag: form.tag?.trim() || null,
        ipPrincipal: form.ipPrincipal?.trim() || null,
        sistemaOperacional: form.sistemaOperacional?.trim() || null,
        versaoSO: form.versaoSO?.trim() || null,
        cpu: form.cpu?.trim() || null,
        nucleosCPU: form.nucleosCPU ? Number(form.nucleosCPU) : null,
        threadsCPU: form.threadsCPU ? Number(form.threadsCPU) : null,
        ram: form.ram?.trim() || null,
        armazenamento: form.armazenamento?.trim() || null,
        gpu: form.gpu?.trim() || null,
        macAddress: form.macAddress?.trim() || null,
        status: form.status,
        powerState: form.powerState || null,
        criticidade: form.criticidade,
        emUso: form.emUso ?? true,
        monitorado: form.monitorado ?? true,
        dataCompra: form.dataCompra ? new Date(form.dataCompra) : null,
        garantiaFim: form.garantiaFim ? new Date(form.garantiaFim) : null,
        valor: form.valor ? Number(form.valor) : null,
        fornecedor: form.fornecedor?.trim() || null,
        observacoes: form.observacoes?.trim() || null,
        isVirtualizado: form.isVirtualizado ?? false,
        hypervisor: form.hypervisor || null,
        vmId: form.vmId?.trim() || null,
        cluster: form.cluster?.trim() || null,
        datacenter: form.datacenter?.trim() || null,
        hostFisicoId: form.hostFisicoId ? Number(form.hostFisicoId) : null,
        userId: form.userId || null, // No Prisma schema é String?
        rackId: form.rackId || null, // No Prisma schema é String?
        posicaoRack: form.posicaoRack ? Number(form.posicaoRack) : null,
        tamanhoU: form.tamanhoU ? Number(form.tamanhoU) : null,
        glpiId: form.glpiId ? Number(form.glpiId) : null,
      };

      if (id) {
        await assetsService.update(id, payload);
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

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 p-6 text-white">Carregando permissões...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{id ? 'Editar Ativo' : 'Novo Ativo'}</h1>
            <p className="mt-2 text-slate-400">Sincronizado com os registros do Datacenter</p>
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
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <form id="asset-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* IDENTIFICAÇÃO */}
          <Section title="Identificação Corporativa">
            <Grid>
              <Input label="Patrimônio" value={form.patrimonio} onChange={(v) => updateField('patrimonio', v)} />
              <Input label="Hostname" value={form.hostname} onChange={(v) => updateField('hostname', v)} />
              <Input label="Apelido" value={form.apelido} onChange={(v) => updateField('apelido', v)} />
              <Input label="Fabricante" value={form.fabricante} onChange={(v) => updateField('fabricante', v)} />
              <Input label="Modelo" value={form.modelo} onChange={(v) => updateField('modelo', v)} />
              <Input label="Hardware" value={form.hardware} onChange={(v) => updateField('hardware', v)} />
              <Input label="Número de Série" value={form.serial} onChange={(v) => updateField('serial', v)} />
              <Input label="Asset Tag" value={form.tag} onChange={(v) => updateField('tag', v)} />
              
              <SelectField
                label="Tipo de Ativo"
                value={form.tipo ?? 'LAPTOP'}
                onChange={(v) => updateField('tipo', v as Asset['tipo'])}
                options={[
                  { value: 'LAPTOP', label: 'Laptop' },
                  { value: 'DESKTOP', label: 'Desktop' },
                  { value: 'SERVIDOR_FISICO', label: 'Servidor Físico' },
                  { value: 'SERVIDOR_VIRTUAL', label: 'Servidor Virtual' },
                  { value: 'SWITCH', label: 'Switch' },
                  { value: 'ROTEADOR', label: 'Roteador' },
                  { value: 'STORAGE', label: 'Storage' },
                  { value: 'MONITOR', label: 'Monitor' },
                ]}
              />

              <SelectField
                label="Status Operacional"
                value={form.status ?? 'DISPONIVEL'}
                onChange={(v) => updateField('status', v as Asset['status'])}
                options={[
                  { value: 'DISPONIVEL', label: 'Disponível' },
                  { value: 'EM_USO', label: 'Em uso' },
                  { value: 'MANUTENCAO', label: 'Manutenção' },
                  { value: 'DESCARTADO', label: 'Descartado' },
                ]}
              />

              <SelectField
                label="Criticidade"
                value={form.criticidade ?? 'MEDIA'}
                onChange={(v) => updateField('criticidade', v as Asset['criticidade'])}
                options={[
                  { value: 'BAIXA', label: 'Baixa' },
                  { value: 'MEDIA', label: 'Média' },
                  { value: 'ALTA', label: 'Alta' },
                  { value: 'CRITICA', label: 'Crítica' },
                ]}
              />
            </Grid>
            <div className="mt-4">
              <Input label="Descrição Curta" value={form.descricao} onChange={(v) => updateField('descricao', v)} />
            </div>
          </Section>

          {/* LOCALIZAÇÃO & INFRA */}
          <Section title="Infraestrutura & Topologia (Rack)">
            <Grid>
              <SelectField
                label="Rack de Destino"
                value={form.rackId || ''}
                onChange={(v) => updateField('rackId', v || undefined)}
                options={[
                  { value: '', label: 'Dispositivo fora de Rack / Desktop' },
                  ...racks.map((rack) => ({ value: rack.id, label: rack.nome })),
                ]}
              />
              <NumberInput label="Posição no Rack (U)" value={form.posicaoRack} onChange={(v) => updateField('posicaoRack', v)} />
              <NumberInput label="Tamanho Ocupado (U)" value={form.tamanhoU} onChange={(v) => updateField('tamanhoU', v)} />
            </Grid>
          </Section>

          {/* REDE E RECURSOS */}
          <Section title="Especificações de Rede & Hardware">
            <Grid>
              <Input label="Endereço IP Principal" value={form.ipPrincipal} onChange={(v) => updateField('ipPrincipal', v)} />
              <Input label="Endereço MAC" value={form.macAddress} onChange={(v) => updateField('macAddress', v)} />
              <Input label="Sistema Operacional" value={form.sistemaOperacional} onChange={(v) => updateField('sistemaOperacional', v)} />
              <Input label="Versão do S.O." value={form.versaoSO} onChange={(v) => updateField('versaoSO', v)} />
              <Input label="Processador (CPU)" value={form.cpu} onChange={(v) => updateField('cpu', v)} />
              <NumberInput label="Núcleos Físicos" value={form.nucleosCPU} onChange={(v) => updateField('nucleosCPU', v)} />
              <NumberInput label="Threads" value={form.threadsCPU} onChange={(v) => updateField('threadsCPU', v)} />
              <Input label="Memória RAM" value={form.ram} onChange={(v) => updateField('ram', v)} />
              <Input label="Armazenamento total" value={form.armazenamento} onChange={(v) => updateField('armazenamento', v)} />
              <Input label="Placa de Vídeo (GPU)" value={form.gpu} onChange={(v) => updateField('gpu', v)} />
            </Grid>
          </Section>

          {/* VIRTUALIZAÇÃO */}
          <Section title="Camada de Virtualização">
            <Grid>
              <Checkbox label="Ativo em Produção (Em Uso)" checked={form.emUso ?? false} onChange={(v) => updateField('emUso', v)} />
              <Checkbox label="Ativo Monitorado por Agente" checked={form.monitorado ?? false} onChange={(v) => updateField('monitorado', v)} />
              <Checkbox label="Instância Virtualizada (VM)" checked={form.isVirtualizado ?? false} onChange={(v) => updateField('isVirtualizado', v)} />

              {form.isVirtualizado && (
                <>
                  <SelectField
                    label="Tecnologia Hypervisor"
                    value={form.hypervisor || ''}
                    onChange={(v) => updateField('hypervisor', (v || undefined) as any)}
                    options={[
                      { value: '', label: 'Não Definido' },
                      { value: 'VMWARE_ESXI', label: 'VMware ESXi' },
                      { value: 'PROXMOX_VE', label: 'Proxmox VE' },
                      { value: 'HYPER_V', label: 'Microsoft Hyper-V' },
                      { value: 'XEN_SERVER', label: 'XenServer' },
                      { value: 'KVM', label: 'KVM puro' },
                    ]}
                  />
                  <Input label="ID único da VM" value={form.vmId} onChange={(v) => updateField('vmId', v)} />
                  <Input label="Cluster" value={form.cluster} onChange={(v) => updateField('cluster', v)} />
                  <Input label="Datacenter Virtual" value={form.datacenter} onChange={(v) => updateField('datacenter', v)} />
                  <SelectField
                    label="Servidor Hospedeiro (Host)"
                    value={form.hostFisicoId ? String(form.hostFisicoId) : ''}
                    onChange={(v) => updateField('hostFisicoId', v ? Number(v) : undefined)}
                    options={[
                      { value: '', label: 'Vincular a um nó físico posterior' },
                      ...physicalHosts.map((host) => ({
                        value: String(host.id),
                        label: host.hostname || host.patrimonio || `Host ID ${host.id}`,
                      })),
                    ]}
                  />
                </>
              )}
            </Grid>
          </Section>

          {/* FINANCEIRO E COMPRAS */}
          <Section title="Dados de Aquisição e GLPI">
            <Grid>
              <Input label="Fornecedor" value={form.fornecedor} onChange={(v) => updateField('fornecedor', v)} />
              <NumberInput label="Valor do Ativo (R$)" value={form.valor ? Number(form.valor) : undefined} onChange={(v) => updateField('valor', v)} />
              <NumberInput label="ID GLPI (Sync)" value={form.glpiId} onChange={(v) => updateField('glpiId', v)} />
              <div>
                <label className="mb-1 block text-sm text-slate-400">Data de Compra</label>
                <input
                  type="date"
                  value={form.dataCompra ? new Date(form.dataCompra).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateField('dataCompra', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Fim da Garantia</label>
                <input
                  type="date"
                  value={form.garantiaFim ? new Date(form.garantiaFim).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateField('garantiaFim', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </Grid>
          </Section>

          {/* ANOTAÇÕES */}
          <Section title="Notas Internas">
            <textarea
              rows={4}
              value={form.observacoes ?? ''}
              onChange={(e) => updateField('observacoes', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              placeholder="Digite históricos de manutenção, observações de hardware adicionais..."
            />
          </Section>
        </form>
      </div>
    </div>
  );
}