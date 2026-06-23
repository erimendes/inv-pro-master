// src/modulos/home/layouts/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex-1 w-full bg-[#020617] text-slate-100 flex flex-col font-sans antialiased min-h-0 overflow-hidden">
      
      {/* 🟢 CORREÇÃO: Reduzido padding de p-4 para p-2 para ganhar espaço em mobile */}
      <main className="p-2 md:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>

    </div>
  );
}