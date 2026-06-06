// import { Outlet } from 'react-router-dom';
// import Header from '../../shared/components/header/Header';
// import Footer from '../../shared/components/footer/Footer';
// import Sidebar from '../../shared/components/body/Sidebar';

// export default function RootLayout() {
//   return (
//     <div className="min-h-screen bg-[#060814] text-white flex flex-col font-sans antialiased">
//       <Header />

//       {/* O Menu Lateral Fixo */}
//       <Sidebar />

//       {/* flex-1 sem nenhuma restrição de altura permite que os filhos estiquem o layout pai naturalmente */}
//   {/* <main className="max-w-7xl mx-auto w-full px-8 pt-0 pb-4 h-[500px] border-2 border-yellow-500 flex flex-col"> */}
//   {/* <main className="max-w-7xl mx-auto w-full px-8 pt-0 pb-4 flex-1 border-2 border-yellow-500 flex flex-col"> */}
//       <main className="h-full max-w-7xl mx-auto w-full px-2 pt-2 pb-2 bg-[#020617] text-slate-100 flex flex-col border-2 border-red-500 font-sans antialiased">
        
//         <Outlet />
//       </main>

//       <Footer />
//     </div>
//   );
// }

import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/header/Header';
import Footer from '../../shared/components/footer/Footer';
import Sidebar from '../../shared/components/body/Sidebar';
import { useAuth } from '../../modules/auth/context/AuthContext'; // Importe o seu hook de autenticação

export default function MainLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col">
      {/* O Header gerencia internamente a Navbar baseado no role */}
      <Header />

      {/* Container inferior estruturado em linha */}
      <div className="flex flex-1 w-full relative">
        
        {/* CONDICIONAL: A Sidebar só aparece e empurra o conteúdo se for ADMIN */}
        {isAdmin && <Sidebar />}
        
        {/* O Main se adapta sozinho */}
        <main className="flex-1 min-w-0">
          {/* Se for ADMIN mantém os paddings grandes originais.
              Se for USER comum, deixamos o padding reduzido ou zerado para não espremer a tela. */}
          <div className={isAdmin ? "p-8 lg:p-12" : "p-4"}>
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}