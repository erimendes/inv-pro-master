import { useState, useEffect } from 'react';
import { getAssets } from '../services/assets.service';
import { Sidebar } from '../components/Sidebar';
import { AssetCard } from '../components/AssetCard';
import AssetEditPage from './AssetEditPage';
import AssetDetailsPage from './AssetDetailsPage';

export default function AssetListPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  // 1. Ajustado o estado para suportar 'id' ou o objeto completo 'data'
  const [view, setView] = useState<{ 
    mode: 'list' | 'edit' | 'details', 
    id?: string,
    data?: any 
  }>({ mode: 'list' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAssets(selectedType);
        setAssets(data || []);
      } catch (err) {
        console.error("Erro ao carregar ativos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedType]);

  // 2. Lógica de Renderização Condicional Corrigida
  if (view.mode === 'edit') {
    // Se tivermos os dados completos no estado 'data', usamos eles, senão usamos o ID
    return (
      <AssetEditPage 
        assetId={view.id} 
        assetData={view.data} 
        onBack={() => setView({ mode: 'list' })} 
      />
    );
  }

  if (view.mode === 'details') {
    return (
      <AssetDetailsPage 
        assetId={view.id} 
        onBack={() => setView({ mode: 'list' })} 
        // ✅ CORREÇÃO: onEdit agora está DENTRO da tag do componente
        onEdit={(assetData) => setView({ mode: 'edit', data: assetData, id: assetData.id })}
      />
    );
  }

  return (
    <div className="flex h-screen bg-black text-slate-200">
      <Sidebar selectedType={selectedType} onSelectType={setSelectedType} />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-end mb-12">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            {selectedType.replace('_', ' ')}
          </h1>
          <div className="text-right">
            <span className="text-4xl font-black text-emerald-500">{assets.length}</span>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Ativos</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                // Ao clicar em editar na lista, passamos o ID
                onEdit={(id) => setView({ mode: 'edit', id })}
                // Ao clicar em detalhes, passamos o ID para o fetch interno
                onDetails={(id) => setView({ mode: 'details', id })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}