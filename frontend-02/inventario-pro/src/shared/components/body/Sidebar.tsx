import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { 
  LayoutDashboard, 
  Server, 
  Laptop, 
  Layers3, 
  Users, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const allMenuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Racks', path: '/racks', icon: <Server size={20} /> },
    { label: 'Ativos', path: '/assets', icon: <Laptop size={20} /> },
    { label: 'Aplicações', path: '/applications', icon: <Layers3 size={20} /> },
    { label: 'Usuários', path: '/users', icon: <Users size={20} /> },
  ];

  // ==========================================
  // FILTRO DO MENU LATERAL POR CARGO
  // ==========================================
  const menuItems = user?.role !== 'ADMIN'
    ? allMenuItems.filter(item => ['/dashboard', '/applications'].includes(item.path))
    : allMenuItems;

  return (
    <div className="relative sticky top-20 z-40 shrink-0 h-[calc(100vh-80px)]">
      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          h-full
          border-r
          border-white/5
          bg-slate-950/40
          backdrop-blur-xl
          flex
          flex-col
          pt-8
          px-3
          transition-all
          duration-300
          ease-in-out
          ${isExpanded ? 'w-64' : 'w-16'}
        `}
      >
        {/* ITENS DO MENU */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-2 w-full list-none m-0 p-0">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/');

              return (
                <li key={item.path} className="w-full">
                  <button
                    onClick={() => navigate(item.path === '/dashboard' ? '/' : item.path)}
                    title={!isExpanded ? item.label : undefined}
                    className={`
                      flex items-center w-full rounded-xl py-3 transition-all duration-200
                      ${isExpanded ? 'px-4 gap-4 justify-start' : 'justify-center px-0'} 
                      ${isActive
                        ? 'bg-cyan-500/10 text-cyan-400 font-bold border-l-2 border-cyan-400'
                        : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                      }
                    `}
                  >
                    <div className={`${isActive ? 'text-cyan-400' : 'text-slate-500'} shrink-0 transition-colors`}>
                      {item.icon}
                    </div>
                    
                    <span
                      className={`text-sm tracking-wide transition-all duration-200 truncate ${
                        isExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* BOTÃO FLUTUANTE RECOLHER/EXPANDIR */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          absolute -right-3 top-6 
          w-6 h-6 
          rounded-full 
          bg-slate-900 
          border border-white/10 
          flex items-center justify-center 
          text-slate-400 hover:text-cyan-400 
          shadow-md shadow-black/50
          transition-colors z-50
          cursor-pointer
        "
        title={isExpanded ? 'Recolher menu' : 'Expandir menu'}
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
}