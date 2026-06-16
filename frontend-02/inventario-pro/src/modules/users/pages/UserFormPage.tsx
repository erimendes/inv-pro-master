// src/modules/users/pages/UserFormPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  const isEdit = id !== undefined && id !== 'new';

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
    if (isEdit && id && id !== 'new') {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Trava de segurança no submit caso o cliente burle botões desabilitados
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

      if (isEdit && id) {
        await usersService.update(id, payload);
        alert('Usuário atualizado com sucesso!');
      } else {
        await usersService.create(payload);
        alert('Usuário criado com sucesso!');
      }

      navigate('/users');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Erro ao processar requisição no servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-3">
            {isEdit ? 'Editar Usuário' : 'Criar Conta'}
          </h1>
          <p className="text-slate-400">
            {isEdit ? 'Atualize as permissões e dados cadastrais' : 'Cadastre um novo usuário institucional'}
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all"
        >
          Voltar
        </button>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* TIPO DE AUTENTICAÇÃO */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 block">Tipo de Autenticação</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isEdit}
              onClick={() => setForm({ ...form, authProvider: 'AD' })}
              className={`py-3 rounded-2xl font-bold border transition-all text-sm ${
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
              className={`py-3 rounded-2xl font-bold border transition-all text-sm ${
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
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Nome Completo</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Ex: João Silva"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* USERNAME */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Username institucional</label>
          <input
            type="text"
            name="username"
            required
            placeholder="joao.silva"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="voce@empresa.com"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* DEPARTAMENTO */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Departamento / Setor</label>
          <input
            type="text"
            name="departamento"
            placeholder="Ex: Infraestrutura, Desenvolvimento, Operações"
            value={form.departamento}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* SENHAS */}
        {form.authProvider === 'LOCAL' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400 block">Senha</label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400 block">Confirmar Senha</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
        )}

        {/* PERFIL / ROLE */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400 block">Nível de Acesso (Silo Operacional)</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
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
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !canSave} // Bloqueia o botão fisicamente se a role logada não for writeRoles
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:hover:bg-emerald-500"
          >
            {!canSave ? 'Acesso de Leitura Apenas' : loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Conta'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="w-1/3 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}