import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">

      {/* HEADER GLOBAL */}
      <header className="h-20 border-b border-white/10">
        {/* menu, avatar, etc */}
      </header>

      {/* CONTEÚDO DINÂMICO */}
      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  );
}