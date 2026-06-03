import { useState } from 'react';
import { RootLayout } from './layouts/RootLayout';

import LandingPage from './modules/landing/pages/LandingPage';
import AuthPage from './modules/auth/pages/AuthPage';

// ✅ Imports de Racks
import RackListPage from './modules/racks/pages/RackListPage';
import RackDetailsPage from './modules/racks/pages/RackDetailsPage';
import RackEditPage from './modules/racks/pages/RackEditPage'; // 👈 Certifique-se de importar

// 🔹 Outros módulos
import AssetsPage from './modules/assets/pages/AssetListPage';
import AppListPage from './modules/applications/pages/AppListPage';
// ... outros imports

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'racks' | 'assets' | 'software' | 'cloud' | 'services' | 'applications'>('landing');

  // 🔥 Controles do Rack
  const [activeRackId, setActiveRackId] = useState<string | null>(null);
  const [rackMode, setRackMode] = useState<'view' | 'edit'>('view');

  const handleNavigate = (page: any) => {
    setActiveRackId(null);
    setCurrentPage(page);
  };

  const renderContent = () => {
    try {
      switch (currentPage) {
        case 'landing': return <LandingPage />;
        case 'login': return <AuthPage mode="login" onBack={() => setCurrentPage('landing')} />;
        
        case 'racks':
          // 1. Se estiver em modo EDIÇÃO
          if (activeRackId && rackMode === 'edit') {
            return (
              <RackEditPage 
                rackId={activeRackId} 
                onBack={() => setActiveRackId(null)} 
              />
            );
          }

          // 2. Se estiver em modo VISUALIZAÇÃO
          if (activeRackId && rackMode === 'view') {
            return (
              <RackDetailsPage
                rackId={activeRackId}
                onBack={() => setActiveRackId(null)}
              />
            );
          }

          // 3. Senão, mostra a LISTA
          return (
            <RackListPage
              onViewRack={(id) => {
                setRackMode('view');
                setActiveRackId(id);
              }}
              onEditRack={(id) => {
                setRackMode('edit');
                setActiveRackId(id);
              }}
            />
          );

        case 'assets': return <AssetsPage />;
        case 'applications': return <AppListPage />;
        // ... outros cases
        default: return <LandingPage />;
      }
    } catch (error) {
      console.error("Erro na renderização:", error);
      return <div className="p-10 text-white">Erro ao carregar página.</div>;
    }
  };

  return (
    <RootLayout onNavigate={handleNavigate}>
      {renderContent()}
    </RootLayout>
  );
}