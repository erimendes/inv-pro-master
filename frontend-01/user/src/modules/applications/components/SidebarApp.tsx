interface SidebarAppProps {
  filters: {
    categoria: string;
    criticidade: string;
  };

  setFilters: (filters: any) => void;
}

export function SidebarApp({
  filters,
  setFilters,
}: SidebarAppProps) {
  const categorias = [
    'TODOS',
    'ADMINISTRATIVO',
    'OPERACIONAL',
  ];

  const criticidades = [
    'TODOS',
    'BAIXA',
    'MEDIA',
    'ALTA',
    'CRITICA',
  ];

  const handleFilter = (
    key: string,
    value: string
  ) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <aside className="w-72 bg-slate-950 border-r border-white/5 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-emerald-500 font-black tracking-widest text-sm uppercase">
          Catálogo
        </h2>
      </div>

      <nav className="p-4 space-y-8">
        <div>
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Categoria
          </p>

          <div className="space-y-1">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  handleFilter('categoria', cat)
                }
                className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filters.categoria === cat
                    ? 'bg-emerald-500 text-black'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Criticidade
          </p>

          <div className="space-y-1">
            {criticidades.map((crit) => (
              <button
                key={crit}
                onClick={() =>
                  handleFilter(
                    'criticidade',
                    crit
                  )
                }
                className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filters.criticidade === crit
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {crit}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
