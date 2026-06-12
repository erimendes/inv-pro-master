import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/header/Header';
import Footer from '../../shared/components/footer/Footer';
import Sidebar from '../../shared/components/body/Sidebar';
import { useAuth } from '../../modules/auth/context/AuthContext';
// 🔄 Mude para o novo padrão de módulos:
import { canViewModule } from '../../shared/constants/roles';

export default function MainLayout() {
  const { user } = useAuth();
  
  // E onde ele fazia a validação (provavelmente para renderizar a Sidebar ou Header):
  const isAdmin = canViewModule(user?.role, 'dashboard');

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col">
      <Header />

      <div className="flex flex-1 w-full relative">
        {isAdmin && <Sidebar />}
        
        <main className="flex-1 min-w-0">
          <div className={isAdmin ? "p-8 lg:p-12" : "p-4"}>
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}