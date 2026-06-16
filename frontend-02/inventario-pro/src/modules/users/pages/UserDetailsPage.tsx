import { useNavigate } from 'react-router-dom';
import { useUserDetailsController } from '../controllers/user-details.controller';
import { Users, ArrowLeft, Shield, Network, Building2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { user, loading, error } = useUserDetailsController();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-slate-400">
        Carregando detalhes do usuário...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-red-400">
        {error || 'Usuário não encontrado.'}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[680px] flex flex-col bg-[#070a13] text-slate-100 p-8 justify-start items-center">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-[#090d1a] p-8 shadow-2xl">
        
        {/* HEADER DO CARD */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Ficha do Usuário</h1>
              <p className="text-sm text-slate-400">Visualização detalhada de escopo e metadados</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all flex-shrink-0"
          >
            <ArrowLeft size={16} />
            Voltar para Lista
          </button>
        </div>

        {/* LISTA DE DADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* NOME COMPLETO */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Nome Completo</p>
            <p className="text-white text-lg font-bold">{user.name || 'Não informado'}</p>
          </div>

          {/* USERNAME INSTITUCIONAL */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Username Institucional</p>
            <p className="text-cyan-400 text-lg font-mono font-semibold">@{user.username}</p>
          </div>

          {/* EMAIL */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60 md:col-span-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Endereço de E-mail</p>
            <p className="text-white text-lg font-medium">{user.email}</p>
          </div>

          {/* DEPARTAMENTO */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Building2 size={14} />
              <p className="text-xs font-bold uppercase tracking-wider">Departamento / Setor</p>
            </div>
            <p className="text-white text-lg font-semibold">{user.departamento || 'Não alocado'}</p>
          </div>

          {/* PROVEDOR DE AUTENTICAÇÃO */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Network size={14} />
              <p className="text-xs font-bold uppercase tracking-wider">Estratégia Auth</p>
            </div>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
              user.authProvider === 'AD' 
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}>
              {user.authProvider === 'AD' ? '⚡ Active Directory' : '🗄️ Banco Local'}
            </span>
          </div>

          {/* PERFIL / ROLE */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Shield size={14} />
              <p className="text-xs font-bold uppercase tracking-wider">Nível de Acesso (Role)</p>
            </div>
            <p className="text-emerald-400 font-mono font-bold text-base mt-0.5 uppercase tracking-wide">
              {user.role}
            </p>
          </div>

          {/* STATUS DA CONTA */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              {user.ativo ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} className="text-slate-500" />}
              <p className="text-xs font-bold uppercase tracking-wider">Estado do Cadastro</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 mt-1 text-sm font-bold ${
              user.ativo ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              <span className={`h-2 w-2 rounded-full ${user.ativo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              {user.ativo ? 'Conta Ativa / Operacional' : 'Conta Suspensa / Inativa'}
            </span>
          </div>

        </div>

        {/* SEÇÃO DO RODAPÉ (INFORMAÇÕES ADICIONAIS) */}
        {user.createdAt && (
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap gap-x-6 gap-y-2 justify-between text-xs text-slate-500 font-medium">
            <p>ID do Registro: <span className="font-mono text-slate-400">{user.id}</span></p>
            <p>Criado em: <span className="text-slate-400">{new Date(user.createdAt).toLocaleString('pt-BR')}</span></p>
          </div>
        )}

      </div>
    </div>
  );
}