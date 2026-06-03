import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    // Remova o w-full e min-h-screen se der conflito. 
    // Usar flex-1 aqui faz ele se adaptar ao tamanho exato do conteúdo da página atual de forma fluida.
    // <div className="flex-1 w-full bg-[#020617] text-slate-100 flex flex-col font-sans antialiased">
    <div className="h-full w-full bg-[#020617] text-slate-100 flex flex-col border-2 border-red-500 font-sans antialiased">
      
      <main className="p-4 flex-1 flex flex-col">
        <Outlet />
      </main>

    </div>
  );
}