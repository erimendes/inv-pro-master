import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { racksService } from '../services/racks.service';

import { useNotification } from '../../../app/providers/NotificationProvider';

import type { Rack } from '../types/rack.types';

export default function RackFormPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { notify } = useNotification();

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState<Partial<Rack>>({
    nome: '',
    localizacao: '',
    capacidade: 42,
  });

  useEffect(() => {
    async function loadRack() {
      try {
        if (!id) return;

        const data = await racksService.getById(id);

        setForm(data);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          'Erro ao carregar rack',
        );
      }
    }

    loadRack();
  }, [id]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Resolvemos o erro limpando e garantindo o fallback de string vazia ('') para o nome
      const nomeFormatado = form.nome?.trim() || '';

      // 2. Fazemos a validação obrigatória antes de montar o payload final
      if (!nomeFormatado) {
        throw new Error(
          'Nome é obrigatório',
        );
      }

      // 3. O payload agora está estritamente correto para o tipo 'CreateRack' (nome nunca será undefined)
      const payload = {
        nome: nomeFormatado,
        localizacao: form.localizacao?.trim() || null,
        capacidade: Number(form.capacidade) || 42,
      };

      if (id) {
        await racksService.update(
          id,
          payload,
        );

        notify(
          'Rack atualizado com sucesso!',
          'success',
        );
      } else {
        await racksService.create(
          payload,
        );

        notify(
          'Rack criado com sucesso!',
          'success',
        );
      }

      navigate('/racks');
    } catch (err: any) {
      console.error(err);

      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Erro ao salvar rack',
      );

      notify(
        'Erro ao salvar rack',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {id ? 'Editar Rack' : 'Novo Rack'}
          </h1>

          <p className="mt-2 text-slate-400">
            Gerenciamento de rack
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            form="rack-form"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/racks')}
            className="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 hover:bg-slate-800"
          >
            ← Voltar
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-300">
          {errorMessage}
        </div>
      )}

      <form
        id="rack-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Nome
              </label>

              <input
                type="text"
                value={form.nome ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Localização
              </label>

              <input
                type="text"
                value={form.localizacao ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    localizacao: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Capacidade (U)
              </label>

              <input
                type="number"
                value={form.capacidade ?? 42}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    capacidade: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}