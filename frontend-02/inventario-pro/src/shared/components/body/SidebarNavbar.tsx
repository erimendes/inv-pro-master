import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, Laptop, Layers3, Users } from 'lucide-react';

interface SidebarNavbarProps {
  isExpanded: boolean;
}

export default function SidebarNavbar({ isExpanded }: SidebarNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Racks', path: '/racks', icon: <Server size={20} /> },
    { label: 'Ativo', path: '/assets', icon: <Laptop size={20} /> },
    { label: 'Aplicações', path: '/applications', icon: <Layers3 size={20} /> },
    { label: 'Usuários', path: '/users', icon: <Users size={20} /> },
  ];

  return (
    <ul className="flex flex-col gap-2 w-full list-none m-0 p-0">
      {menuItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);

        return (
          <li key={item.path} className="w-full">
            <button
              onClick={() => navigate(item.path)}
              title={!isExpanded ? item.label : undefined} // Mostra tooltip se estiver fechado
              className={`flex items-center w-full rounded-xl py-3 transition-all duration-200 ${
                isExpanded ? 'px-4 gap-4' : 'justify-center px-0 text-center'
              } ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              <div className={`${isActive ? 'text-cyan-400' : 'text-slate-500'} shrink-0`}>
                {item.icon}
              </div>
              
              {/* Texto com efeito de sumir/aparecer suave */}
              <span
                className={`text-sm font-bold tracking-wide transition-all duration-200 truncate ${
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
  );
}