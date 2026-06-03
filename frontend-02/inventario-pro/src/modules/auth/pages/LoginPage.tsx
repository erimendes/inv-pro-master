import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Falha no login. Verifique suas credenciais.');
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Login</h2>
        <p className="text-slate-400 text-sm">Entre com suas credenciais</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* EMAIL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* SENHA */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Senha
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black transition-all shadow-lg shadow-emerald-500/20"
        >
          Entrar
        </button>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </form>

      {/* FOOTER */}
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm">Não possui conta?</p>
        <Link
          to="/register"
          className="inline-flex mt-3 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
