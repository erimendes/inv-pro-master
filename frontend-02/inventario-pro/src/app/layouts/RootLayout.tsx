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

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col">
      {/* O seu Header antigo continua aqui, intacto */}
      <Header />

      {/* Container inferior estruturado em linha */}
      <div className="flex flex-1 w-full relative">
        
        {/* Sidebar totalmente isolada que empurra o conteúdo sozinha */}
        <Sidebar />
        
        {/* O Main se adapta sozinho sem precisar saber o tamanho da barra */}
        <main className="flex-1 min-w-0">
          <div className="p-8 lg:p-12">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}