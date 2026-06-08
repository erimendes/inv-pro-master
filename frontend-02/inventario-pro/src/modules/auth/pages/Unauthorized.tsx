// src/modulos/auth/pages/Unauthorized.tsx

import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 px-4 text-center">
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-full mb-6 animate-pulse">
        <span className="text-5xl">🚫</span>
      </div>
      
      <h1 className="text-3xl font-black text-white mb-3">
        Acesso Negado
      </h1>
      
      <p className="text-slate-400 max-w-md mb-8 text-sm sm:text-base">
        Você não tem permissão para acessar esta página. Certifique-se de estar usando uma conta com privilégios administrativos.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10"
        >
          Voltar ao Início
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-6 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/10"
        >
          Trocar de Conta
        </button>
      </div>
    </div>
  );
}