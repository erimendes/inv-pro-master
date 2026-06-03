// src/modules/inventory/pages/RacksPage.tsx
interface RacksPageProps {
  onEditRack: (id: string) => void;
}

export default function RacksPage({ onEditRack }: RacksPageProps) {
  // Dados fictícios (virão da sua API NestJS)
  const racks = [{ id: '1', nome: 'Rack_Principal_01' }];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase tracking-tighter">Racks</h1>
      <div className="grid gap-4 mt-6">
        {racks.map(rack => (
          <div key={rack.id} className="p-4 bg-slate-900 border border-white/5 rounded-lg flex justify-between items-center">
            <span>{rack.nome}</span>
            <button 
              onClick={() => onEditRack(rack.id)}
              className="text-[10px] font-black uppercase bg-primary/10 text-primary px-4 py-2 rounded hover:bg-primary/20 transition-colors"
            >
              Editar Rack
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}