import { Outlet } from 'react-router-dom';

import Header from '../../shared/components/header/Header';
import Footer from '../../shared/components/footer/Footer';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#060814] text-white flex flex-col font-sans antialiased">
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <main className="flex-1 flex items-start justify-center px-2 pt-1 pb-6 -mt-4 relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-[-150px] left-[-150px] w-[600px] h-[600px] bg-emerald-500/[0.07] blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-cyan-500/[0.07] blur-[130px] rounded-full pointer-events-none" />

        {/* AUTH CARD */}
        <div className="relative z-10 w-full max-w-md bg-[#0d1127]/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-4 sm:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
          <Outlet />
        </div>
        
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}