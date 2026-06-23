// src/modulos/home/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/header/Header';
import Footer from '../../shared/components/footer/Footer';
import Sidebar from '../../shared/components/body/Sidebar';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { canViewModule } from '../../shared/constants/roles';

export default function MainLayout() {
  const { user } = useAuth();
  const isAdmin = canViewModule(user?.role, 'dashboard');

  return (
    <div className="h-screen w-screen bg-[#070a13] text-slate-100 flex flex-col overflow-hidden">
      {/* 🟢 CORREÇÃO: Passando prop para o Header controlar o menu em telas pequenas */}
      <Header hideMenuOnMobile={true} />

      <div className="flex flex-1 w-full relative min-h-0 overflow-hidden">
        {isAdmin && <Sidebar />}
        
        <main className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden">
          {/* 🟢 CORREÇÃO: Ajuste dinâmico de padding. 
              Se for Admin (com sidebar), usa padding menor em mobile.
              Se não for Admin, usa padding padrão. */}
          <div className={isAdmin ? "flex-1 h-full min-h-0 flex flex-col overflow-hidden p-2 md:p-0" : "flex-1 h-full min-h-0 flex flex-col overflow-hidden p-4"}>
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}