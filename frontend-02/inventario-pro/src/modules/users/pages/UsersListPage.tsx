// src/modules/users/pages/UsersListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, ShieldAlert } from 'lucide-react';
import { useUsersController } from '../controllers/users.controller';
import { UserCard } from '../components/UserCard';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { canViewModule, canModifyModule } from '../../../shared/constants/roles';

export default function UsersListPage() {
  const navigate = useNavigate();
  const { users, loading, error, deleteUser } = useUsersController();
  const { user: currentUser } = useAuth();
  
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 🛡️ Validação centralizada de privilégios de leitura e modificação
  const canAccessUsersModule = useMemo(() => {
    return canViewModule(currentUser?.role, 'users');
  }, [currentUser]);

  const canEditUsers = useMemo(() => {
    return canModifyModule(currentUser?.role, 'users');
  }, [currentUser]);

  // Se a busca ou filtros mudarem, joga para a página 1 e fecha o card expandido
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCard(null);
  }, [searchTerm, roleFilter]);

  // Lógica de Silo Departamental + Filtros de Tela
  const filteredUsers = useMemo(() => {
    if (!canAccessUsersModule || !users) return [];

    return users.filter((user) => {
      const myRole = currentUser?.role || '';
      const targetRole = user.role || '';

      // Se eu não for um administrador global supremo, aplico o isolamento rígido
      // 🔄 CORREÇÃO: Garante que mesmo "admin" ou "super_admin" em minúsculo sejam validados corretamente
      if (myRole.toUpperCase() !== 'ADMIN' && myRole.toUpperCase() !== 'SUPER_ADMIN') {
        const iAmInfra  = myRole.includes('INFRA');
        const iAmDev    = myRole.includes('DEV') && !myRole.includes('DEVOPS');
        const iAmDevops = myRole.includes('DEVOPS');

        const targetIsAdmin  = targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN';
        const targetIsInfra  = targetRole.includes('INFRA');
        const targetIsDev    = targetRole.includes('DEV') && !targetRole.includes('DEVOPS');
        const targetIsDevops = targetRole.includes('DEVOPS');

        if (targetIsAdmin) return false;
        if (iAmInfra && !targetIsInfra) return false;
        if (iAmDev && !targetIsDev) return false;
        if (iAmDevops && !targetIsInfra && !targetIsDev && !targetIsDevops) return false;

        if (myRole === 'USER' && targetRole !== 'USER') return false;
        if (targetRole === 'USER' && myRole !== 'USER' && !iAmInfra && !iAmDev && !iAmDevops) return false;
      }

      // Filtros de busca
      const matchesSearch = 
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        
      const matchesRole = roleFilter === '' || targetRole === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter, currentUser, canAccessUsersModule]);

  // Bloqueio visual rígido caso a role não pertença aos allowedRoles de 'users' no roles.ts
  if (!canAccessUsersModule && !loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#070a13] text-red-400 gap-4">
        <ShieldAlert size={52} className="text-red-500 animate-bounce" />
        <h2 className="text-2xl font-black uppercase tracking-wide">Acesso Negado</h2>
        <p className="text-slate-400 text-sm max-w-sm text-center">
          Seu perfil de acesso atual não possui permissões configuradas para gerenciar a listagem de usuários.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition hover:bg-slate-700"
        >
          Ir para o Dashboard
        </button>
      </div>
    );
  }

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-slate-400">
        Carregando usuários...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-[680px] border-2 border-green-500 flex flex-col bg-[#070a13] text-slate-100 justify-between">
      
      {/* HEADER */}
      <div className="flex flex-col gap-6 border-b border-slate-800 px-8 py-6 lg:flex-row lg:items-center lg:justify-between flex-shrink-0">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">Usuários</h1>
              <p className="mt-1 text-sm text-slate-400">Gerenciamento de contas e isolamento de privilégios</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
              Silo Departamental
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-emerald-400">
              {filteredUsers.length} de {users?.length || 0} visíveis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-4xl font-black leading-none text-emerald-400">{filteredUsers.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Listados</span>
          </div>

          {/* Renderiza botão de Novo apenas se tiver direito de escrita no módulo */}
          {canEditUsers && (
            <button
              onClick={() => navigate('/users/new')}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition hover:scale-105 hover:bg-emerald-400"
            >
              <Plus size={18} />
              Novo Usuário
            </button>
          )}
        </div>
      </div>

      {/* FILTROS */}
      <div className="px-8 py-4 flex flex-col sm:flex-row gap-4 bg-[#090d1a] border-b border-slate-800/50 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
          />
        </div>

        <div className="relative min-w-[240px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
          >
            <option value="">Filtrar cargo do departamento</option>
            <option value="SUPER_ADMIN">SUPER ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ADMIN_INFRA">ADMIN INFRA</option>
            <option value="MANAGER_INFRA">MANAGER INFRA</option>
            <option value="USER_INFRA">USER INFRA</option>
            <option value="ADMIN_DEV">ADMIN DEV</option>
            <option value="MANAGER_DEV">MANAGER DEV</option>
            <option value="USER_DEV">USER DEV</option>
            <option value="ADMIN_DEVOPS">ADMIN DEVOPS</option>
            <option value="MANAGER_DEVOPS">MANAGER DEVOPS</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* CONTEÚDO CARD GRID */}
      <div className="flex-1 px-8 pt-6 pb-4 flex flex-col justify-between overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex h-32 flex-1 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium">
            Nenhum usuário visível para seu escopo ou correspondente aos filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-rows-1 gap-6 items-stretch">
            {currentUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                opened={selectedCard === user.id}
                onToggle={() => setSelectedCard(selectedCard === user.id ? null : user.id)}
                onDelete={canEditUsers ? deleteUser : undefined} // Se não puder editar, omite a lixeira interna do card
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setSelectedCard(null);
            setCurrentPage(page);
          }}
        />
      </div>
    </div>
  );
}