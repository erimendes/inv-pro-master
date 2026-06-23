// src/modules/users/pages/UserDetailsPage.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDetailsController } from '../controllers/user-details.controller';
import { Users, ArrowLeft, Shield, Network, Building2, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { canModifyModule } from '../../../shared/constants/roles';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { user, loading, error } = useUserDetailsController();
  const { user: currentUser } = useAuth();

  // Validação se o usuário logado possui permissão para editar
  const canEditUsers = useMemo(() => {
    return canModifyModule(currentUser?.role, 'users');
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-slate-400 font-medium">
        Carregando detalhes do usuário...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-red-400 font-medium p-6">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-300 max-w-md text-center">
          {error || 'Usuário não encontrado.'}
        </div>
      </div>
    );
  }

  return (
    /* CASCA COMPACTA DO VIEWPORT */
    <div className="h-screen w-full bg-[#070a13] px-8 pt-2 pb-1 text-slate-100 antialiased font-sans flex flex-col overflow-hidden min-h-0">
      <div className="max-w-3xl w-full h-full mx-auto flex flex-col min-h-0 overflow-hidden">
        
        {/* HEADER COMPACTADO FIXO */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Voltar para Lista
          </button>

          {/* 🟢 CORREÇÃO DEFINITIVA DA ROTA:
              Alinhado exatamente com o padrão do roteador do módulo (/users/edit/:id)
              evitando que o sistema interprete como rota inválida e jogue para o dashboard.
          */}
          {canEditUsers && (
            <button
              onClick={() => navigate(`/users/${user.id}/edit`)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/5 cursor-pointer"
            >
              <Pencil size={12} />
              Editar Usuário
            </button>
          )}
        </div>

        {/* FICHA TÉCNICA COM ROLAGEM INDEPENDENTE ISOLADA */}
        <div className="bg-[#090d1a] border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex-1 overflow-y-auto min-h-0 custom-scrollbar mb-4 space-y-6">
          
          {/* HEADER DO CARD INTERNO */}
          <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">Ficha do Usuário</h1>
              <p className="text-xs text-slate-400 mt-1 leading-none">Visualização detalhada de escopo e metadados</p>
            </div>
          </div>

          {/* GRID DE INFORMAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            
            {/* NOME COMPLETO */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Nome Completo</p>
              <p className="text-white text-base font-bold truncate">{user.name || 'Não informado'}</p>
            </div>

            {/* USERNAME INSTITUCIONAL */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Username Institucional</p>
              <p className="text-cyan-400 text-base font-mono font-bold truncate">@{user.username}</p>
            </div>

            {/* EMAIL */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60 md:col-span-2">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Endereço de E-mail</p>
              <p className="text-white text-base font-medium truncate">{user.email}</p>
            </div>

            {/* DEPARTAMENTO */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Building2 size={13} />
                <p className="text-[10px] font-black uppercase tracking-wider">Departamento / Setor</p>
              </div>
              <p className="text-white text-base font-semibold truncate">{user.departamento || 'Não alocado'}</p>
            </div>

            {/* PROVEDOR DE AUTENTICAÇÃO */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Network size={13} />
                <p className="text-[10px] font-black uppercase tracking-wider">Estratégia Auth</p>
              </div>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {user.authProvider === 'AD' ? '⚡ Active Directory' : '🗄️ Banco Local'}
              </span>
            </div>

            {/* PERFIL / ROLE */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Shield size={13} />
                <p className="text-[10px] font-black uppercase tracking-wider">Nível de Acesso (Role)</p>
              </div>
              <p className="text-emerald-400 font-mono font-black text-sm uppercase tracking-wide">
                {user.role}
              </p>
            </div>

            {/* STATUS DA CONTA */}
            <div className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                {user.ativo ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} className="text-slate-500" />}
                <p className="text-[10px] font-black uppercase tracking-wider">Estado do Cadastro</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 mt-0.5 text-xs font-bold ${
                user.ativo ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user.ativo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                {user.ativo ? 'Conta Ativa / Operacional' : 'Conta Suspensa / Inativa'}
              </span>
            </div>

          </div>

          {/* SEÇÃO DO RODAPÉ (METADADOS ADICIONAIS) */}
          {user.createdAt && (
            <div className="pt-3 border-t border-slate-800/60 flex flex-wrap gap-x-6 gap-y-1 justify-between text-[11px] text-slate-500 font-medium shrink-0">
              <p>ID do Registro: <span className="font-mono text-slate-400">{user.id}</span></p>
              <p>Criado em: <span className="text-slate-400">{new Date(user.createdAt).toLocaleString('pt-BR')}</span></p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}