import { useEffect, useState } from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { usersService } from '../services/users.service';

type UserFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

export default function UserFormPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  // =========================
  // DEFINE SE É EDIÇÃO
  // =========================
  const isEdit =
    id !== undefined &&
    id !== 'new';

  // =========================
  // STATES
  // =========================
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [form, setForm] =
    useState<UserFormData>({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
    });

  // =========================
  // RESET FORM QUANDO FOR NOVO
  // =========================
  useEffect(() => {
    if (!isEdit) {
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
      });
    }
  }, [isEdit]);

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    if (
      isEdit &&
      id &&
      id !== 'new'
    ) {
      loadUser(id);
    }
  }, [id]);

  async function loadUser(
    userId: string,
  ) {
    try {
      setLoading(true);

      const data =
        await usersService.getById(
          userId,
        );

      setForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
        confirmPassword: '',
        role: data.role || 'USER',
      });
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao carregar usuário',
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // HANDLE CHANGE
  // =========================
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // limpa erro ao digitar
    setError('');
  }

  // =========================
  // VALIDAR SENHAS
  // =========================
  function validatePasswords() {
    // no editar pode deixar vazio
    if (
      isEdit &&
      form.password === '' &&
      form.confirmPassword === ''
    ) {
      return true;
    }

    if (
      form.password.trim() === ''
    ) {
      setError(
        'A senha é obrigatória',
      );

      return false;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        'As senhas não coincidem',
      );

      return false;
    }

    if (
      form.password.length < 6
    ) {
      setError(
        'A senha deve ter pelo menos 6 caracteres',
      );

      return false;
    }

    return true;
  }

  // =========================
  // SUBMIT
  // =========================
  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    setError('');

    // valida senha
    const valid =
      validatePasswords();

    if (!valid) return;

    try {
      setLoading(true);

      const payload: any = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      // Só envia senha se existir
      if (
        form.password &&
        form.password.trim() !== ''
      ) {
        payload.password =
          form.password;
      }

      if (isEdit && id) {
        await usersService.update(
          id,
          payload,
        );

        alert(
          'Usuário atualizado com sucesso!',
        );
      } else {
        await usersService.create(
          payload,
        );

        alert(
          'Usuário criado com sucesso!',
        );

        // limpa formulário
        setForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'USER',
        });
      }

      navigate('/users');
    } catch (error) {
      console.error(error);

      setError(
        'Erro ao salvar usuário',
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isEdit
              ? 'Editar Usuário'
              : 'Novo Usuário'}
          </h1>

          <p className="mt-2 text-slate-400">
            {isEdit
              ? 'Atualize os dados do usuário'
              : 'Cadastro de novo usuário'}
          </p>
        </div>

        {/* VOLTAR */}
        <button
          onClick={() =>
            navigate('/users')
          }
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Voltar
        </button>
      </div>

      {/* FORM */}
      <div className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-5"
        >
          {/* ERRO */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* NOME */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nome
            </label>

            <input
              type="text"
              name="name"
              autoComplete="off"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              autoComplete="new-email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Senha
            </label>

            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                isEdit
                  ? 'Deixe vazio para não alterar'
                  : 'Digite a senha'
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* CONFIRMAR SENHA */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirmar Senha
            </label>

            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={
                form.confirmPassword
              }
              onChange={handleChange}
              placeholder={
                isEdit
                  ? 'Confirme a nova senha'
                  : 'Confirme a senha'
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Perfil
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            >
              <option value="USER">
                USER
              </option>

              <option value="ADMIN">
                ADMIN
              </option>
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-5 py-3 font-medium text-black transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading
                ? 'Salvando...'
                : isEdit
                ? 'Atualizar Usuário'
                : 'Criar Usuário'}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/users')
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}