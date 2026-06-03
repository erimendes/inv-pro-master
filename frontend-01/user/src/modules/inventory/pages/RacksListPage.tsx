// src/modules/inventory/pages/RacksListPage.tsx
import { RackList } from '../components/RackList';

// 1. Adicionamos a prop onEditRack que o App.tsx envia
interface RacksListPageProps {
  onEditRack: (id: string) => void;
}

export default function InventoryPage({ onEditRack }: RacksListPageProps) {
  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <h1 className="text-2xl font-bold p-6 text-slate-800">Gerenciamento de Racks</h1>
      
      {/* 2. Passamos a função para o RackList usando a prop 'onEdit' que criamos lá */}
      <RackList onEdit={(id) => onEditRack(id)} />
    </div>
  );
}