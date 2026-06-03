// /src/modules/assets/pages/AssetDetailsPage.tsx

import { useEffect, useState } from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Pencil,
  Server,
  Monitor,
  Network,
  HardDrive,
} from 'lucide-react';

import { assetsService } from '../services/assets.service';

import type { Asset } from '../types/asset.types';

export default function AssetDetailsPage() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [asset, setAsset] =
    useState<Partial<Asset> | null>(
      null,
    );

  useEffect(() => {

    async function loadAsset() {

      try {

        if (!id) {
          setErrorMessage(
            'ID do ativo não informado.',
          );

          return;
        }

        const assetId = Number(id);

        if (isNaN(assetId)) {

          setErrorMessage(
            'ID inválido.',
          );

          return;
        }

        setLoading(true);

        const response =
          await assetsService.getById(
            assetId,
          );

        setAsset(response);

      } catch (error) {

        console.error(error);

        setErrorMessage(
          'Erro ao carregar ativo.',
        );

      } finally {

        setLoading(false);
      }
    }

    loadAsset();

  }, [id]);

  /**
   * -------------------------------------------------------
   * FORMATADORES
   * -------------------------------------------------------
   */

  function formatDate(
    value?: string | Date | null,
  ) {

    if (!value) return '-';

    return new Date(value)
      .toLocaleDateString('pt-BR');
  }

  function formatCurrency(
    value?: number | null,
  ) {

    if (!value) return 'R$ 0,00';

    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    ).format(value);
  }

  /**
   * -------------------------------------------------------
   * LOADING
   * -------------------------------------------------------
   */

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-slate-400">
        Carregando ativo...
      </div>
    );
  }

  /**
   * -------------------------------------------------------
   * ERROR
   * -------------------------------------------------------
   */

  if (errorMessage) {

    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
          {errorMessage}
        </div>
      </div>
    );
  }

  /**
   * -------------------------------------------------------
   * NOT FOUND
   * -------------------------------------------------------
   */

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

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

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

            <p className="mt-3 text-slate-400">
              Visualização completa do ativo
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate(`/assets/${asset.id}/edit`)
              }
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400"
            >
              <Pencil size={16} />
              Editar
            </button>

            <button
              onClick={() =>
                navigate('/assets')
              }
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-300 transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>

          </div>
        </div>

        {/* ====================================================== */}
        {/* VMS DO HOST */}
        {/* ====================================================== */}

        {asset.vms &&
          asset.vms.length > 0 && (

          <section className="mb-8 rounded-2xl border border-emerald-500/20 bg-[#0a0f1d] p-6 shadow-2xl">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <Server size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  Máquinas Virtuais
                </h2>

                <p className="text-sm text-slate-400">
                  VMs hospedadas neste servidor
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {asset.vms.map((vm: any) => (

                <div
                  key={vm.id}
                  className="group rounded-xl border border-slate-800 bg-[#111625] p-5 transition-all hover:border-emerald-500/30 hover:bg-[#151b2d]"
                >

                  <div className="mb-4 flex items-start justify-between gap-3">

                    <div>

                      <h3 className="text-lg font-bold text-white">
                        {vm.hostname}
                      </h3>

                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        {vm.sistOper || 'Sem SO'}
                      </p>

                    </div>

                    <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      VM
                    </span>

                  </div>

                  <div className="space-y-3 text-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        IP
                      </span>

                      <span className="font-mono text-slate-300">
                        {vm.ipRede || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        CPU
                      </span>

                      <span className="text-slate-300">
                        {vm.cpu || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        RAM
                      </span>

                      <span className="text-slate-300">
                        {vm.ram || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        Disco
                      </span>

                      <span className="text-slate-300">
                        {vm.discoFisico || '-'}
                      </span>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      navigate(`/assets/${vm.id}`)
                    }
                    className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
                  >
                    Abrir VM
                  </button>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* ====================================================== */}
        {/* IDENTIFICAÇÃO */}
        {/* ====================================================== */}

        <SectionCard
          title="Identificação"
          icon={<Monitor size={20} />}
        >

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <DetailItem
              label="ID"
              value={asset.id}
            />

            <DetailItem
              label="Patrimônio"
              value={asset.patrimonio}
            />

            <DetailItem
              label="Hostname"
              value={asset.hostname}
            />

            <DetailItem
              label="Apelido"
              value={asset.apelido}
            />

            <DetailItem
              label="Fabricante"
              value={asset.fabricante}
            />

            <DetailItem
              label="Hardware"
              value={asset.hardware}
            />

            <DetailItem
              label="Modelo"
              value={asset.modelo}
            />

            <DetailItem
              label="Serial"
              value={asset.serial}
            />

          </div>
        </SectionCard>

        {/* ====================================================== */}
        {/* REDE */}
        {/* ====================================================== */}

        <SectionCard
          title="Rede / Sistema"
          icon={<Network size={20} />}
        >

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <DetailItem
              label="IP"
              value={asset.ipRede}
            />

            <DetailItem
              label="Sistema Operacional"
              value={asset.sistOper}
            />

            <DetailItem
              label="CPU"
              value={asset.cpu}
            />

            <DetailItem
              label="RAM"
              value={asset.ram}
            />

            <DetailItem
              label="Disco"
              value={asset.discoFisico}
            />

            <DetailItem
              label="O que roda"
              value={asset.oQueRoda}
            />

          </div>
        </SectionCard>

        {/* ====================================================== */}
        {/* HOST */}
        {/* ====================================================== */}

        {asset.host && (

          <SectionCard
            title="Servidor Host"
            icon={<Server size={20} />}
          >

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

              <DetailItem
                label="Hostname"
                value={asset.host.hostname}
              />

              <DetailItem
                label="Patrimônio"
                value={asset.host.patrimonio}
              />

              <DetailItem
                label="IP"
                value={asset.host.ipRede}
              />

              <DetailItem
                label="Sistema Operacional"
                value={asset.host.sistOper}
              />

            </div>

            <button
              onClick={() =>
                navigate(`/assets/${asset.host?.id}`)
              }
              className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20"
            >
              Abrir Host
            </button>

          </SectionCard>
        )}

        {/* ====================================================== */}
        {/* RACK */}
        {/* ====================================================== */}

        <SectionCard
          title="Rack"
          icon={<HardDrive size={20} />}
        >

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <DetailItem
              label="Rack"
              value={asset.rack?.nome}
            />

            <DetailItem
              label="Posição"
              value={
                asset.posicaoRack
                  ? `${asset.posicaoRack}U`
                  : '-'
              }
            />

            <DetailItem
              label="Tamanho"
              value={
                asset.tamanhoU
                  ? `${asset.tamanhoU}U`
                  : '-'
              }
            />

          </div>
        </SectionCard>

        {/* ====================================================== */}
        {/* AQUISIÇÃO */}
        {/* ====================================================== */}

        <SectionCard
          title="Aquisição"
          icon={<Monitor size={20} />}
        >

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <DetailItem
              label="Data Compra"
              value={formatDate(
                asset.dataCompra,
              )}
            />

            <DetailItem
              label="Valor"
              value={formatCurrency(
                asset.valor,
              )}
            />

          </div>
        </SectionCard>

        {/* ====================================================== */}
        {/* OBSERVAÇÕES */}
        {/* ====================================================== */}

        <SectionCard
          title="Observações"
          icon={<Monitor size={20} />}
        >

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-300">
            {asset.observacoes ||
              'Nenhuma observação cadastrada.'}
          </div>

        </SectionCard>

      </div>
    </div>
  );
}

/* ========================================================= */
/* SECTION CARD */
/* ========================================================= */

type SectionCardProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function SectionCard({
  title,
  icon,
  children,
}: SectionCardProps) {

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-[#0a0f1d] p-6 shadow-2xl">

      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
          {icon}
        </div>

        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
          {title}
        </h2>

      </div>

      {children}

    </section>
  );
}

/* ========================================================= */
/* DETAIL ITEM */
/* ========================================================= */

type DetailItemProps = {
  label: string;
  value?: any;
};

function DetailItem({
  label,
  value,
}: DetailItemProps) {

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111625] p-4">

      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-white">
        {value !== null &&
        value !== undefined &&
        value !== ''
          ? String(value)
          : '-'}
      </p>

    </div>
  );
}