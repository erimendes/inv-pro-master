import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' // valor padrão
  });

  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      await register(form);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao registrar');
    }
  }

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Criar Conta</h1>
        <p className="text-slate-400">Cadastre um novo usuário</p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NOME */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Nome</label>
          <input
            type="text"
            autoComplete="name"
            placeholder="João Silva"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white"
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Email</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white"
          />
        </div>

        {/* SENHA */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Senha</label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white"
          />
        </div>

        {/* ROLE */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Perfil</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white"
          >
            <option value="USER">Usuário</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg transition-all shadow-lg shadow-emerald-500/20"
        >
          Criar Conta
        </button>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </form>

      {/* FOOTER */}
      <div className="mt-10 text-center">
        <p className="text-slate-500">Já possui conta?</p>
        <Link
          to="/login"
          className="inline-flex mt-3 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
        >
          Voltar para login
        </Link>
      </div>
    </div>
  );
}
