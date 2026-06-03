interface SidebarProps {
  selectedType: string;
  onSelectType: (id: string) => void;
}

const categories = [
  { id: 'TODOS', label: 'Todos os Ativos' },
  { id: 'LAPTOP', label: 'Laptops' },
  { id: 'DESKTOP', label: 'Desktops' },
  { id: 'SERVIDOR_FISICO', label: 'Servidores Físicos' },
  { id: 'SERVIDOR_VIRTUAL', label: 'Máquinas Virtuais' },
  { id: 'SWITCH', label: 'Switches' },
  { id: 'ROTEADOR', label: 'Roteadores' },
  { id: 'STORAGE', label: 'Storages' },
  { id: 'MONITOR', label: 'Monitores' },
];

export function Sidebar({ selectedType, onSelectType }: SidebarProps) {
  return (
    <aside className="w-72 bg-slate-950 border-r border-white/5 flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-emerald-500 font-black tracking-widest text-sm uppercase">
          Inventário IT
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectType(cat.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedType === cat.id 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
              : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}