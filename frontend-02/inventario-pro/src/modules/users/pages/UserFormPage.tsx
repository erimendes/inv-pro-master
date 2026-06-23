// src/modules/users/pages/UserFormPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usersService } from '../services/users.service';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { canModifyModule } from '../../../shared/constants/roles';

type UserFormData = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  departamento: string;
  authProvider: string;
};

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  // Garante uma avaliação booleana limpa e imutável do estado da rota
  const isEdit = useMemo(() => {
    return id !== undefined && id !== 'new' && id !== '';
  }, [id]);

  // Validação em tempo real se o usuário conectado possui direito de escrita em usuários
  const canSave = useMemo(() => {
    return canModifyModule(currentUser?.role, 'users');
  }, [currentUser]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UserFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    departamento: '',
    authProvider: 'AD',
  });

  // Limpa o formulário caso mude de estado de forma abrupta
  useEffect(() => {
    if (!isEdit) {
      setForm({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
        departamento: '',
        authProvider: 'AD',
      });
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit && id) {
      loadUser(id);
    }
  }, [id, isEdit]);

  async function loadUser(userId: string) {
    try {
      setLoading(true);
      const data = await usersService.getById(userId);

      setForm({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        password: '',
        confirmPassword: '',
        role: data.role || 'USER',
        departamento: data.departamento || '',
        authProvider: data.authProvider || 'AD',
      });
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do usuário.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  function validatePasswords() {
    if (form.authProvider === 'AD') return true;

    if (isEdit && form.password === '' && form.confirmPassword === '') {
      return true;
    }

    if (form.password.trim() === '') {
      setError('A senha é obrigatória para usuários com estratégia de banco local.');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return false;
    }

    if (form.password.length < 6) {
      setError('A senha precisa conter no mínimo 6 caracteres.');
      return false;
    }

    return true;
  }

  // 🟢 FUNÇÃO DE RETORNO INTELIGENTE: Avalia se existe histórico empilhado para voltar
  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // Voltar exatamente para a página de onde veio (Listagem ou Ficha do Detalhe)
    } else {
      navigate('/users'); // Fallback de segurança se for acessado por link externo direto
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!canSave) {
      setError('Operação cancelada: Seu perfil possui permissões apenas de leitura.');
      return;
    }

    if (!validatePasswords()) return;

    try {
      setLoading(true);

      const payload: any = {
        name: form.name || null,
        username: form.username,
        email: form.email,
        role: form.role,
        departamento: form.departamento || null,
        authProvider: form.authProvider,
      };

      if (form.authProvider === 'LOCAL' && form.password.trim() !== '') {
        payload.password = form.password;
      }

      if (isEdit && id && id !== 'new') {
        await usersService.update(id, payload);
        alert('Usuário atualizado com sucesso!');
      } else {
        await usersService.create(payload);
        alert('Usuário criado com sucesso!');
      }

      // Após salvar com sucesso, retorna para a tela que invocou o formulário
      handleGoBack();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Erro ao processar requisição no servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-full bg-[#070a13] px-8 pt-2 pb-1 text-slate-100 antialiased font-sans flex flex-col overflow-hidden min-h-0">
      <div className="max-w-2xl w-full h-full mx-auto flex flex-col min-h-0 overflow-hidden">
        
        {/* HEADER COMPACTADO FIXO */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-black text-white leading-none">
              {isEdit ? 'Editar Usuário' : 'Criar Conta'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-none">
              {isEdit ? 'Atualize as permissões e dados cadastrais' : 'Cadastre um novo usuário institucional'}
            </p>
          </div>
          
          {/* 🟢 CORREÇÃO: Botão superior ajustado para disparar o handleGoBack */}
          <button
            type="button"
            onClick={handleGoBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Voltar
          </button>
        </div>

        {/* CONTAINER DO FORMULÁRIO COM ROLAGEM INDEPENDENTE ISOLADA */}
        <div className="flex-1 overflow-y-auto pr-1 pb-4 min-h-0 custom-scrollbar mb-4">
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5 content-start">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            {/* TIPO DE AUTENTICAÇÃO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Tipo de Autenticação</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isEdit}
                  onClick={() => setForm({ ...form, authProvider: 'AD' })}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs cursor-pointer ${
                    form.authProvider === 'AD'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950/80 border-white/10 text-slate-400 hover:border-white/20'
                  } disabled:opacity-50`}
                >
                  Active Directory (AD)
                </button>
                <button
                  type="button"
                  disabled={isEdit}
                  onClick={() => setForm({ ...form, authProvider: 'LOCAL' })}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs cursor-pointer ${
                    form.authProvider === 'LOCAL'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950/80 border-white/10 text-slate-400 hover:border-white/20'
                  } disabled:opacity-50`}
                >
                  Banco Local
                </button>
              </div>
            </div>

            {/* NOME COMPLETO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Nome Completo</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ex: João Silva"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            {/* USERNAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Username institucional</label>
              <input
                type="text"
                name="username"
                required
                placeholder="joao.silva"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all font-mono font-medium"
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="voce@empresa.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            {/* DEPARTAMENTO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Departamento / Setor</label>
              <input
                type="text"
                name="departamento"
                placeholder="Ex: Infraestrutura, Desenvolvimento, Operações"
                value={form.departamento}
                onChange={handleChange}
                className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            {/* SENHAS */}
            {form.authProvider === 'LOCAL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Senha</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Confirmar Senha</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="********"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* PERFIL / ROLE */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Nível de Acesso (Silo Operacional)</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 transition-all cursor-pointer font-bold"
              >
                <option value="USER">USER (Comum de ponta)</option>
                <option value="SUPER_ADMIN">SUPER ADMIN (Global Geral)</option>
                <option value="ADMIN">ADMIN (Global)</option>
                <optgroup label="Silo de Infraestrutura">
                  <option value="USER_INFRA">USER INFRA (Técnico)</option>
                  <option value="MANAGER_INFRA">MANAGER INFRA (Gerência)</option>
                  <option value="ADMIN_INFRA">ADMIN INFRA (Diretor)</option>
                </optgroup>
                <optgroup label="Silo de Desenvolvimento">
                  <option value="USER_DEV">USER DEV (Engenheiro de Software)</option>
                  <option value="MANAGER_DEV">MANAGER DEV (Tech Lead)</option>
                  <option value="ADMIN_DEV">ADMIN DEV (Diretor Dev)</option>
                </optgroup>
                <optgroup label="Silo DevOps / Engenharia SRE">
                  <option value="MANAGER_DEVOPS">MANAGER DEVOPS</option>
                  <option value="ADMIN_DEVOPS">ADMIN DEVOPS</option>
                </optgroup>
              </select>
            </div>

            {/* BOTOES DE AÇÃO */}
            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading || !canSave}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/5 disabled:opacity-30 cursor-pointer"
              >
                {!canSave ? 'Acesso de Leitura Apenas' : loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Conta'}
              </button>
              
              {/* 🟢 CORREÇÃO: Botão inferior "Cancelar" ajustado para disparar o handleGoBack */}
              <button
                type="button"
                onClick={handleGoBack}
                className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}