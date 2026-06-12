import { useEffect, useState } from 'react';
import { useNavigate, useLocation,useParams } from 'react-router-dom';

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

  // Recupera a rota de origem ou define '/assets' como padrão se não houver histórico
  const backUrl = location.state?.from || '/assets';

  const { id } = useParams();

  const { notify } = useNotification();

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [physicalHosts, setPhysicalHosts] =
    useState<Asset[]>([]);

  const [racks, setRacks] =
    useState<Rack[]>([]);

  const [form, setForm] =
    useState<Partial<Asset>>({
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

      dataCompra: undefined,
      valor: 0,

      isVirtualizado: false,
      hyperVName: '',

      hostFisicoId: undefined,

      userId: undefined,

      rackId: undefined,

      observacoes: '',

      posicaoRack: undefined,
      tamanhoU: undefined,
    });

  /* ========================================================= */
  /* CARREGA ATIVO PARA EDIÇÃO */
  /* ========================================================= */

  useEffect(() => {
    async function loadAsset() {
      try {
        if (!id) return;

        const asset =
          await assetsService.getById(
            Number(id),
          );

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

  /* ========================================================= */
  /* CARREGA HOSTS FÍSICOS */
  /* ========================================================= */

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

  /* ========================================================= */
  /* CARREGA RACKS */
  /* ========================================================= */

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

  /* ========================================================= */
  /* SUBMIT */
  /* ========================================================= */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);

    setErrorMessage('');

    try {
      const payload = {
        patrimonio:
          form.patrimonio?.trim() ||
          null,

        tipo: form.tipo,

        fabricante:
          form.fabricante?.trim() ||
          null,

        hardware:
          form.hardware?.trim() ||
          null,

        modelo:
          form.modelo?.trim() || null,

        serial:
          form.serial?.trim() || null,

        hostname:
          form.hostname?.trim() ||
          null,

        apelido:
          form.apelido?.trim() || null,

        ipRede:
          form.ipRede?.trim() || null,

        oQueRoda:
          form.oQueRoda?.trim() ||
          null,

        sistOper:
          form.sistOper?.trim() ||
          null,

        cpu:
          form.cpu?.trim() || null,

        ram:
          form.ram?.trim() || null,

        discoFisico:
          form.discoFisico?.trim() ||
          null,

        status: form.status,

        emUso:
          form.emUso ?? true,

        dataCompra:
          form.dataCompra
            ? new Date(
                form.dataCompra,
              )
            : null,

        valor: Number(
          form.valor || 0,
        ),

        isVirtualizado:
          form.isVirtualizado ??
          false,

        hyperVName:
          form.hyperVName?.trim() ||
          null,

        hostFisicoId:
          form.hostFisicoId
            ? Number(
                form.hostFisicoId,
              )
            : null,

        userId: form.userId
          ? Number(form.userId)
          : null,

        rackId:
  form.rackId ?? null,

        observacoes:
          form.observacoes?.trim() ||
          null,

        posicaoRack:
          form.posicaoRack
            ? Number(
                form.posicaoRack,
              )
            : null,

        tamanhoU:
          form.tamanhoU
            ? Number(
                form.tamanhoU,
              )
            : null,
      };

      console.log(
        'Payload enviado:',
        payload,
      );

      if (
        !payload.patrimonio ||
        !payload.fabricante ||
        !payload.modelo ||
        !payload.tipo ||
        !payload.status
      ) {
        throw new Error(
          'Preencha todos os campos obrigatórios',
        );
      }

      if (id) {
        await assetsService.update(
          id,
          payload,
        );

        notify(
          'Ativo atualizado com sucesso!',
          'success',
        );
      } else {
        await assetsService.create(
          payload,
        );

        notify(
          'Ativo criado com sucesso!',
          'success',
        );
      }

      // navigate('/assets');
      // Redireciona de volta para onde o utilizador estava
      navigate(backUrl);
    } catch (err: any) {
      console.error(err);

      setErrorMessage(
        Array.isArray(
          err?.response?.data
            ?.message,
        )
          ? err.response.data.message.join(
              ', ',
            )
          : err?.response?.data
                ?.message ||
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

  /* ========================================================= */
  /* UPDATE FIELD */
  /* ========================================================= */

  function updateField<
    K extends keyof Asset,
  >(field: K, value: Asset[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {id
                ? 'Editar Ativo'
                : 'Novo Ativo'}
            </h1>

            <p className="mt-2 text-slate-400">
              Gerenciamento completo
              do ativo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              form="asset-form"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Salvando...'
                : 'Salvar'}
            </button>

            <button
              type="button" // Garante que é type button para não submeter o form
              onClick={() => navigate(backUrl)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <form
          id="asset-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* IDENTIFICAÇÃO */}
          <Section title="Identificação">
            <Grid>
              <Input
                label="Patrimônio *"
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
                label="Fabricante *"
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
                label="Modelo *"
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

              <SelectField
                label="Tipo *"
                value={
                  form.tipo ??
                  'LAPTOP'
                }
                onChange={(v) =>
                  updateField(
                    'tipo',
                    v as Asset['tipo'],
                  )
                }
                options={[
                  {
                    value: 'LAPTOP',
                    label: 'Laptop',
                  },
                  {
                    value: 'DESKTOP',
                    label: 'Desktop',
                  },
                  {
                    value:
                      'SERVIDOR_FISICO',
                    label:
                      'Servidor Físico',
                  },
                  {
                    value:
                      'SERVIDOR_VIRTUAL',
                    label:
                      'Servidor Virtual',
                  },
                  {
                    value: 'SWITCH',
                    label: 'Switch',
                  },
                  {
                    value:
                      'ROTEADOR',
                    label:
                      'Roteador',
                  },
                  {
                    value: 'STORAGE',
                    label: 'Storage',
                  },
                  {
                    value: 'MONITOR',
                    label: 'Monitor',
                  },
                ]}
              />

              <SelectField
                label="Status *"
                value={
                  form.status ??
                  'DISPONIVEL'
                }
                onChange={(v) =>
                  updateField(
                    'status',
                    v as Asset['status'],
                  )
                }
                options={[
                  {
                    value:
                      'DISPONIVEL',
                    label:
                      'Disponível',
                  },
                  {
                    value: 'EM_USO',
                    label: 'Em uso',
                  },
                  {
                    value:
                      'MANUTENCAO',
                    label:
                      'Manutenção',
                  },
                  {
                    value:
                      'DESCARTADO',
                    label:
                      'Descartado',
                  },
                ]}
              />
            </Grid>
          </Section>

          {/* RACK */}
          <Section title="Localização & Rack">
            <Grid>
              {/* <SelectField
                label="Rack"
                value={
                  form.rackId ?? ''
                }
                onChange={(v) =>
                  updateField(
                    'rackId',
                    v || undefined,
                  )
                }
                options={[
                  {
                    value: '',
                    label:
                      'Selecione um rack',
                  },

                  ...racks.map(
                    (rack) => ({
                      value: rack.id,
                      label: rack.nome,
                    }),
                  ),
                ]}
              /> */}
              <SelectField
  label="Rack"
  value={form.rackId ?? ''}
  onChange={(v) =>
    updateField(
      'rackId',
      v || undefined,
    )
  }
  options={[
    {
      value: '',
      label: 'Sem rack',
    },

    ...racks.map((rack) => ({
      value: rack.id,
      label: rack.nome,
    })),
  ]}
/>

              <NumberInput
                label="Posição Rack"
                value={
                  form.posicaoRack
                }
                onChange={(v) =>
                  updateField(
                    'posicaoRack',
                    v as any,
                  )
                }
              />

              <NumberInput
                label="Tamanho U"
                value={
                  form.tamanhoU
                }
                onChange={(v) =>
                  updateField(
                    'tamanhoU',
                    v as any,
                  )
                }
              />
            </Grid>
          </Section>

          {/* REDE */}
          <Section title="Rede / Sistema">
            <Grid>
              <Input
                label="IP Rede"
                value={form.ipPrincipal}
                onChange={(v) =>
                  updateField(
                    'ipPrincipal',
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
                  updateField(
                    'cpu',
                    v,
                  )
                }
              />

              <Input
                label="RAM"
                value={form.ram}
                onChange={(v) =>
                  updateField(
                    'ram',
                    v,
                  )
                }
              />

              <Input
                label="Disco"
                value={
                  form.discoFisico
                }
                onChange={(v) =>
                  updateField(
                    'discoFisico',
                    v,
                  )
                }
              />
            </Grid>
          </Section>

          {/* VIRTUALIZAÇÃO */}
          <Section title="Virtualização">
            <Grid>
              <Checkbox
                label="Em uso"
                checked={
                  form.emUso ??
                  false
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
                <SelectField
                  label="Host Físico"
                  value={
                    form.hostFisicoId
                      ? String(
                          form.hostFisicoId,
                        )
                      : ''
                  }
                  onChange={(v) =>
                    updateField(
                      'hostFisicoId',
                      (v
                        ? Number(v)
                        : undefined) as any,
                    )
                  }
                  options={[
                    {
                      value: '',
                      label:
                        'Selecione um host',
                    },

                    ...physicalHosts.map(
                      (host) => ({
                        value:
                          String(
                            host.id,
                          ),

                        label:
                          host.hostname ||
                          host.apelido ||
                          host.patrimonio ||
                          `Host ${host.id}`,
                      }),
                    ),
                  ]}
                />
              )}
            </Grid>
          </Section>

          {/* OBSERVAÇÕES */}
          <Section title="Observações">
            <textarea
              rows={5}
              value={
                form.observacoes ??
                ''
              }
              onChange={(e) =>
                updateField(
                  'observacoes',
                  e.target.value as any,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </Section>
        </form>
      </div>
    </div>
  );
}

/* ========================================================= */
/* COMPONENTES */
/* ========================================================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-200">
        {title}
      </h2>

      {children}
    </section>
  );
}

function Grid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

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
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
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
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
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
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked,
          )
        }
        className="h-4 w-4"
      />

      {label}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;

  options: {
    value: string;
    label: string;
  }[];
};

function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}