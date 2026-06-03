import { useState } from 'react';

import { SidebarApp } from '../components/SidebarApp';

import { AppCard } from '../components/AppCard';

import { useApplications } from '../hooks/useApplications';

export default function AppListPage() {
  const [filters, setFilters] = useState({
    categoria: 'TODOS',
    criticidade: 'TODOS',
  });

  const {
    apps,
    loading,
    error,
  } = useApplications(
    filters.categoria,
    filters.criticidade
  );

  return (
    <div className="flex h-screen bg-black">
      <SidebarApp
        filters={filters}
        setFilters={setFilters}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Aplicações
            </h1>

            <div className="flex gap-2 mt-2">
              <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded tracking-widest uppercase">
                {filters.categoria}
              </span>

              <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded tracking-widest uppercase border border-emerald-500/20">
                {filters.criticidade}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-4xl font-black text-emerald-500">
              {apps.length}
            </span>

            <p className="text-slate-500 text-[10px] uppercase font-bold">
              Sistemas
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-t-2 border-emerald-500 rounded-full" />
          </div>
        ) : error ? (
          <div className="text-red-500">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {apps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
