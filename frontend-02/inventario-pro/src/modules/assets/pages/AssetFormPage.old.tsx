// /src/modules/assets/pages/AssetFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { id } = useParams();

  const { notify } = useNotification();

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [physicalHosts, setPhysicalHosts] = useState<
    Asset[]
  >([]);

  const [racks, setRacks] = useState<Rack[]>([]);

  const [form, setForm] = useState<Partial<Asset>>({
    patrimonio: '',
    tipo: 'LAPTOP',

    fabricante: '',
    hardware: '',
    modelo: '',
    serial: '',
    hostname: '',
    apelido: '',

    ipRede: '',
    oQueRoda: '',
    sistOper: '',
    cpu: '',
    ram: '',
    discoFisico: '',

    status: 'DISPONIVEL',
    emUso: true,

    dataCompra: '',
    valor: 0,

    // Virtualização
    isVirtualizado: false,
    hyperVName: '',
    hostFisicoId: undefined,

    // Relacionamentos
    userId: '',
    rackId: '',

    observacoes: '',

    posicaoRack: undefined,
    tamanhoU: undefined,
  });

  useEffect(() => {
    async function loadAsset() {
      try {
        if (!id) return;

        const asset =
          await assetsService.getById(Number(id));

        setForm(asset);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          'Erro ao carregar ativo',
        );
      }
    }

    loadAsset();
  }, [id]);

  useEffect(() => {
    async function loadPhysicalHosts() {
      try {
        const assets =
          await assetsService.getAll();

        const hosts = assets.filter(
          (asset: Asset) =>
            asset.tipo ===
            'SERVIDOR_FISICO',
        );

        setPhysicalHosts(hosts);
      } catch (error) {
        console.error(
          'Erro ao carregar hosts físicos',
          error,
        );
      }
    }

    loadPhysicalHosts();
  }, []);

  useEffect(() => {
    async function loadRacks() {
      try {
        const response =
          await racksService.getAll();

        setRacks(response);
      } catch (error) {
        console.error(
          'Erro ao carregar racks',
          error,
        );
      }
    }

    loadRacks();
  }, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);

    setErrorMessage('');

    try {
      if (id) {
        await assetsService.update(
          Number(id),
          form as Asset,
        );

        notify(
          'Ativo atualizado com sucesso!',
          'success',
        );
      } else {
        await assetsService.create(
          form as Asset,
        );

        notify(
          'Ativo criado com sucesso!',
          'success',
        );
      }

      navigate('/assets');
    } catch (err: any) {
      console.error(err);

      setErrorMessage(
        err?.message ||
          'Erro ao salvar ativo',
      );

      notify(
        'Erro ao salvar ativo',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof Asset>(
    field: K,
    value: Asset[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {id
            ? 'Editar Ativo'
            : 'Novo Ativo'}
        </h1>

        <p className="mt-2 text-slate-400">
          Gerenciamento completo do ativo
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-300">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* IDENTIFICAÇÃO */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Identificação
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Patrimônio"
              value={form.patrimonio}
              onChange={(v) =>
                updateField(
                  'patrimonio',
                  v,
                )
              }
            />

            <Input
              label="Hostname"
              value={form.hostname}
              onChange={(v) =>
                updateField(
                  'hostname',
                  v,
                )
              }
            />

            <Input
              label="Apelido"
              value={form.apelido}
              onChange={(v) =>
                updateField(
                  'apelido',
                  v,
                )
              }
            />

            <Input
              label="Fabricante"
              value={form.fabricante}
              onChange={(v) =>
                updateField(
                  'fabricante',
                  v,
                )
              }
            />

            <Input
              label="Hardware"
              value={form.hardware}
              onChange={(v) =>
                updateField(
                  'hardware',
                  v,
                )
              }
            />

            <Input
              label="Modelo"
              value={form.modelo}
              onChange={(v) =>
                updateField(
                  'modelo',
                  v,
                )
              }
            />

            <Input
              label="Serial"
              value={form.serial}
              onChange={(v) =>
                updateField(
                  'serial',
                  v,
                )
              }
            />

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Tipo
              </label>

              <select
                value={
                  form.tipo ?? 'LAPTOP'
                }
                onChange={(e) =>
                  updateField(
                    'tipo',
                    e.target
                      .value as Asset['tipo'],
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="LAPTOP">
                  Laptop
                </option>

                <option value="DESKTOP">
                  Desktop
                </option>

                <option value="SERVIDOR_FISICO">
                  Servidor Físico
                </option>

                <option value="SERVIDOR_VIRTUAL">
                  Servidor Virtual
                </option>

                <option value="SWITCH">
                  Switch
                </option>

                <option value="ROTEADOR">
                  Roteador
                </option>

                <option value="STORAGE">
                  Storage
                </option>

                <option value="MONITOR">
                  Monitor
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Status
              </label>

              <select
                value={
                  form.status ??
                  'DISPONIVEL'
                }
                onChange={(e) =>
                  updateField(
                    'status',
                    e.target
                      .value as Asset['status'],
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="DISPONIVEL">
                  Disponível
                </option>

                <option value="EM_USO">
                  Em uso
                </option>

                <option value="MANUTENCAO">
                  Manutenção
                </option>

                <option value="DESCARTADO">
                  Descartado
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* REDE */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Rede / Sistema
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              label="IP Rede"
              value={form.ipRede}
              onChange={(v) =>
                updateField(
                  'ipRede',
                  v,
                )
              }
            />

            <Input
              label="O que roda"
              value={form.oQueRoda}
              onChange={(v) =>
                updateField(
                  'oQueRoda',
                  v,
                )
              }
            />

            <Input
              label="Sistema Operacional"
              value={form.sistOper}
              onChange={(v) =>
                updateField(
                  'sistOper',
                  v,
                )
              }
            />

            <Input
              label="CPU"
              value={form.cpu}
              onChange={(v) =>
                updateField('cpu', v)
              }
            />

            <Input
              label="RAM"
              value={form.ram}
              onChange={(v) =>
                updateField('ram', v)
              }
            />

            <Input
              label="Disco Físico"
              value={form.discoFisico}
              onChange={(v) =>
                updateField(
                  'discoFisico',
                  v,
                )
              }
            />
          </div>
        </section>

        {/* AQUISIÇÃO */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Aquisição
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Data Compra
              </label>

              <input
                type="date"
                value={
                  form.dataCompra
                    ? String(
                        form.dataCompra,
                      ).substring(
                        0,
                        10,
                      )
                    : ''
                }
                onChange={(e) =>
                  updateField(
                    'dataCompra',
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Valor
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  form.valor ?? 0
                }
                onChange={(e) =>
                  updateField(
                    'valor',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
          </div>
        </section>

        {/* VIRTUALIZAÇÃO */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Virtualização
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Checkbox
              label="Em uso"
              checked={
                form.emUso ?? false
              }
              onChange={(v) =>
                updateField(
                  'emUso',
                  v,
                )
              }
            />

            <Checkbox
              label="Virtualizado"
              checked={
                form.isVirtualizado ??
                false
              }
              onChange={(v) =>
                updateField(
                  'isVirtualizado',
                  v,
                )
              }
            />

            <Input
              label="Hyper-V Name"
              value={
                form.hyperVName
              }
              onChange={(v) =>
                updateField(
                  'hyperVName',
                  v,
                )
              }
            />

            {form.isVirtualizado && (
              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Host Físico
                </label>

                <select
                  value={
                    form.hostFisicoId ??
                    ''
                  }
                  onChange={(e) =>
                    updateField(
                      'hostFisicoId',
                      e.target.value
                        ? Number(
                            e.target.value,
                          )
                        : undefined,
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="">
                    Selecione um host
                  </option>

                  {physicalHosts.map(
                    (host) => (
                      <option
                        key={host.id}
                        value={host.id}
                      >
                        {host.hostname ||
                          host.apelido ||
                          host.patrimonio ||
                          `Host ${host.id}`}
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* RACK */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Rack
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Nome Rack
              </label>

              <select
                value={form.rackId ?? ''}
                onChange={(e) =>
                  updateField(
                    'rackId',
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="">
                  Selecione um rack
                </option>

                {racks.map((rack) => (
                  <option
                    key={rack.id}
                    value={rack.id}
                  >
                    {rack.nome}
                  </option>
                ))}
              </select>
            </div>

            <NumberInput
              label="Posição Rack"
              value={
                form.posicaoRack
              }
              onChange={(v) =>
                updateField(
                  'posicaoRack',
                  v,
                )
              }
            />

            <NumberInput
              label="Tamanho U"
              value={form.tamanhoU}
              onChange={(v) =>
                updateField(
                  'tamanhoU',
                  v,
                )
              }
            />
          </div>
        </section>

        {/* RELACIONAMENTOS */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Relacionamentos
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              label="User ID"
              value={form.userId}
              onChange={(v) =>
                updateField(
                  'userId',
                  v,
                )
              }
            />
          </div>
        </section>

        {/* OBSERVAÇÕES */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Observações
          </h2>

          <textarea
            rows={6}
            value={
              form.observacoes ?? ''
            }
            onChange={(e) =>
              updateField(
                'observacoes',
                e.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </section>

        {/* BOTÕES */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Salvando...'
              : 'Salvar'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/assets')
            }
            className="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

/* ========================================================= */
/* COMPONENTES AUXILIARES */
/* ========================================================= */

type InputProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
};

function Input({
  label,
  value,
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type="text"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
      />
    </div>
  );
}

type NumberInputProps = {
  label: string;
  value?: number;
  onChange: (
    value: number | undefined,
  ) => void;
};

function NumberInput({
  label,
  value,
  onChange,
}: NumberInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type="number"
        value={value ?? ''}
        onChange={(e) =>
          onChange(
            e.target.value
              ? Number(
                  e.target.value,
                )
              : undefined,
          )
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
      />
    </div>
  );
}

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function Checkbox({
  label,
  checked,
  onChange,
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked,
          )
        }
      />

      {label}
    </label>
  );
}