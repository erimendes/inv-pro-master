// src/modulos/auth/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      const isEmail = identifier.includes('@');
      
      // 💡 CORREÇÃO AQUI: Montamos o objeto de forma estática e limpa.
      // Se for e-mail, passamos a chave email. Se não, passamos username.
      await login({
        email: isEmail ? identifier : undefined,
        username: !isEmail ? identifier : undefined,
        password,
      });

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.response?.data?.message || 'Falha no login. Verifique suas credenciais.'
      );
    }
  }

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Login</h2>
        <p className="text-slate-400 text-sm">Entre utilizando seu login corporativo AD ou e-mail</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* IDENTIFICADOR (USERNAME OU EMAIL) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Usuário corporativo ou E-mail
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="nome.sobrenome ou voce@empresa.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
          className="w-full py-4 mt-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base transition-all shadow-lg shadow-emerald-500/20"
        >
          Entrar no Sistema
        </button>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-2">
            ❌ {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}