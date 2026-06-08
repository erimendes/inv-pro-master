
// src/modulos/auth/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '', // Adicionado obrigatoriamente
    email: '',
    password: '',
    role: 'USER',
    authProvider: 'AD' // Padrão igual ao seu backend
  });

  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    // Ajuste defensivo: Se for AD, envia a senha em branco para o backend
    const payload = {
      ...form,
      password: form.authProvider === 'AD' ? '' : form.password,
    };

    try {
      await register(payload);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || err.message || 'Erro ao registrar');
    }
  }

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Criar Conta</h1>
        <p className="text-slate-400">Cadastre um novo usuário no ecossistema</p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* PROVEDOR DE AUTENTICAÇÃO */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 block">Tipo de Autenticação</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, authProvider: 'AD' })}
              className={`py-3 rounded-2xl font-bold border transition-all text-sm ${
                form.authProvider === 'AD'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950/80 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              Active Directory (AD)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, authProvider: 'LOCAL' })}
              className={`py-3 rounded-2xl font-bold border transition-all text-sm ${
                form.authProvider === 'LOCAL'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950/80 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              Banco Local
            </button>
          </div>
        </div>

        {/* NOME COMPLETO */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Nome Completo</label>
          <input
            type="text"
            required
            placeholder="João Silva"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* USERNAME */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Username institucional</label>
          <input
            type="text"
            required
            placeholder="joao.silva"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Email</label>
          <input
            type="email"
            required
            placeholder="voce@empresa.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* SENHA (Renderiza condicionalmente apenas se for LOCAL) */}
        {form.authProvider === 'LOCAL' && (
          <div className="space-y-2">
            <label className="text-sm text-slate-400 block">Senha</label>
            <input
              type="password"
              required={form.authProvider === 'LOCAL'}
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        )}

        {/* PERFIL / ROLE */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Nível de Acesso (Perfil)</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none"
          >
            <option value="USER">Usuário Padrão</option>
            <option value="ADMIN">Administrador do Sistema</option>
          </select>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-4 mt-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg transition-all shadow-lg shadow-emerald-500/20"
        >
          Provisionar Usuário
        </button>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-2">
            ⚠️ {errorMessage}
          </div>
        )}
      </form>

      {/* FOOTER */}
      <div className="mt-10 text-center">
        <p className="text-slate-500">Já possui conta ativa?</p>
        <Link
          to="/login"
          className="inline-flex mt-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}