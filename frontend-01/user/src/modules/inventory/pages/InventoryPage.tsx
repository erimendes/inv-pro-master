import { useState } from 'react';
import RackDetailPage from './RackDetailPage';
import RackViewPage from './RackViewPage';
import { RackSelectionModal } from '../components/RackSelectionModal';

// Definimos os estados possíveis da tela
type ViewMode = 'LIST' | 'EDIT' | 'VIEW';

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [selectedRackName, setSelectedRackName] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  // Mock de racks para exemplo - substitua pelo seu fetch de listagem
  const racks = [
    { id: '1', nome: 'Rack Principal - DataCenter 01' },
    { id: '2', nome: 'Rack Backup - Sala Técnica' },
  ];

  const handleRackClick = (id: string, nome: string) => {
    setSelectedRackId(id);
    setSelectedRackName(nome);
    setShowModal(true); // Abre o menu de opções (Script 18)
  };

  const openEdit = () => {
    setShowModal(false);
    setViewMode('EDIT');
  };

  const openView = () => {
    setShowModal(false);
    setViewMode('VIEW');
  };

  const backToList = () => {
    setViewMode('LIST');
    setSelectedRackId(null);
  };

  // RENDERIZAÇÃO CONDICIONAL
  if (viewMode === 'EDIT' && selectedRackId) {
    return <RackDetailPage rackId={selectedRackId} onBack={backToList} />;
  }

  if (viewMode === 'VIEW' && selectedRackId) {
    return <RackViewPage rackId={selectedRackId} onBack={backToList} />;
  }

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white">
      <h1 className="text-3xl font-black mb-8 tracking-tighter italic">INVENTÁRIO<span className="text-emerald-500">PRO</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {racks.map(rack => (
          <div 
            key={rack.id}
            onClick={() => handleRackClick(rack.id, rack.nome)}
            className="p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-emerald-500/50 cursor-pointer transition-all group shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
              </div>
            </div>
            <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{rack.nome}</h3>
            <p className="text-slate-500 text-sm mt-2 font-mono uppercase tracking-widest text-[10px]">Clique para gerenciar</p>
          </div>
        ))}
      </div>

      {/* Modal de Seleção (Script 18) */}
      {showModal && (
        <RackSelectionModal 
          rackName={selectedRackName}
          onClose={() => setShowModal(false)}
          onView={openView}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}
