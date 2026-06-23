// src/modules/users/pages/UsersListPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, ShieldAlert } from 'lucide-react';
import { useUsersController } from '../controllers/users.controller';
import { UserCard } from '../components/UserCard';

// Caminho do import da Paginação Unificada
import { Pagination } from '../../applications/components/Pagination'; 

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

  // Limite expandido para 8 itens por página
  const itemsPerPage = 8;

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

  // Bloqueio visual rígido caso a role não pertença aos allowedRoles de 'users'
  if (!canAccessUsersModule && !loading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-[#070a13] text-red-400 gap-4 min-h-0">
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

  if (loading) return <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-slate-400">Carregando usuários...</div>;
  if (error) return <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-red-400">{error}</div>;

  return (
    <div className="w-full h-full flex flex-col bg-[#070a13] text-slate-100 overflow-hidden min-h-0">
      
      {/* HEADER COMPACTADO */}
      <div className="flex flex-col gap-2 px-8 pt-2 pb-1 bg-[#070a13] flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white leading-none">Usuários</h1>
                <p className="mt-1 text-xs text-slate-400 leading-none">Gerenciamento de contas e privilégios</p>
              </div>
            </div>
          </div>

          {/* TOTAL E BOTÃO NOVO USUÁRIO */}
          {/* 🟢 CORREÇÃO RESPONSIVA (image_dc9b8a.png): Adicionado 'hidden sm:flex' para esconder o bloco inteiro em telas móveis */}
          <div className="hidden sm:flex items-center gap-4 justify-between sm:justify-end">
            <div className="text-right">
              <span className="block text-3xl font-black leading-none text-emerald-400">{filteredUsers.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Listados</span>
            </div>

            {canEditUsers && (
              <button
                onClick={() => navigate('/users/new')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 font-black text-xs uppercase tracking-wider text-slate-950 transition-all hover:scale-[1.01] hover:bg-emerald-400 shadow-md shadow-emerald-500/5 cursor-pointer"
              >
                <Plus size={14} /> Novo Usuário
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="px-8 py-2 flex flex-col sm:flex-row gap-2 bg-[#090d1a] border-b border-slate-800/50 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
          />
        </div>

        <div className="relative min-w-[240px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
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

      {/* CONTEÚDO PRINCIPAL COMPACTO */}
      <main className="flex-1 px-9 pt-1 pb-2 flex flex-col justify-between items-start overflow-y-auto w-full min-h-0">
        {filteredUsers.length === 0 ? (
          <div className="flex h-32 flex-1 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium w-full bg-slate-900/10">
            Nenhum usuário visível para seu escopo ou correspondente aos filtros.
          </div>
        ) : (
          /* GRID RESPONSIVO COM ROLAGEM INDEPENDENTE */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 items-start w-full content-start flex-1 min-h-0 overflow-y-auto pr-1">
            {currentUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                opened={selectedCard === user.id}
                onToggle={() => setSelectedCard(selectedCard === user.id ? null : user.id)}
                onDelete={canEditUsers ? deleteUser : undefined}
              />
            ))}
          </div>
        )}

        {/* PAGINAÇÃO UNIFICADA NA BASE - Sempre visível */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setSelectedCard(null);
            setCurrentPage(page);
          }}
        />
      </main>
    </div>
  );
}