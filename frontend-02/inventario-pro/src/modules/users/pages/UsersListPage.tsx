import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { useUsersController } from '../controllers/users.controller';
import { UserCard } from '../components/UserCard';
import { Pagination } from '../components/Pagination';

export default function UsersListPage() {
  const navigate = useNavigate();
  const { users, loading, error, deleteUser } = useUsersController();
  
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Controle de Paginação (Fixo: máximo 4 itens em 1 linha)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Lógica de Filtragem (Memorizada para performance)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRole = roleFilter === '' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Cálculos da paginação baseados na lista FILTRADA
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Reseta para a página 1 sempre que o usuário digita algo no filtro
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setSelectedCard(null);
  };

  const handleRoleChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
    setSelectedCard(null);
  };

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
              <p className="mt-1 text-sm text-slate-400">Gerenciamento de usuários do sistema</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
              Controle de acesso
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-emerald-400">
              {filteredUsers.length} de {users.length} usuários
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-4xl font-black leading-none text-emerald-400">{filteredUsers.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Filtrados</span>
          </div>

          <button
            onClick={() => navigate('/users/new')}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition hover:scale-105 hover:bg-emerald-400"
          >
            <Plus size={18} />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* SEÇÃO DE FILTROS (INPUTS) */}
      <div className="px-8 py-4 flex flex-col sm:flex-row gap-4 bg-[#090d1a] border-b border-slate-800/50 flex-shrink-0">
        {/* Busca por Texto */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
          />
        </div>

        {/* Filtro por Perfil (Role) */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <select
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
          >
            <option value="">Todos os perfis</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* REGIAO DO CONTEÚDO */}
      <div className="flex-1 px-8 pt-6 pb-4 flex flex-col justify-between overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex h-32 flex-1 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium">
            Nenhum usuário correspondente aos filtros.
          </div>
        ) : (
          /* Mantém rigidamente 1 linha com no máximo 4 itens */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-rows-1 gap-6 items-stretch">
            {currentUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                opened={selectedCard === user.id}
                onToggle={() => setSelectedCard(selectedCard === user.id ? null : user.id)}
                onDelete={deleteUser}
              />
            ))}
          </div>
        )}

        {/* PAINEL DE PAGINAÇÃO */}
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