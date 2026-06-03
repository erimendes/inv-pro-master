// src/app/pages/AssetsListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { assetsService } from '../services/assets.service';
import type { Asset, AssetTipo } from '../types/asset.types'; // 💡 Importando seu tipo real
import { useNotification } from '../../../app/providers/NotificationProvider';
import { AssetRow } from '../components/AssetRow';

// Criamos uma união para o estado do filtro (Tipos reais + a opção 'TODOS')
type FilterTipo = AssetTipo | 'TODOS';

// Array para iterar no menu lateral baseado estritamente nas suas strings de tipo
const LISTA_TIPOS: FilterTipo[] = [
  'TODOS',
  'LAPTOP',
  'DESKTOP',
  'SERVIDOR_FISICO',
  'SERVIDOR_VIRTUAL',
  'SWITCH',
  'ROTEADOR',
  'STORAGE',
  'MONITOR'
];

export default function AssetsListPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<FilterTipo>('TODOS');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 4;

  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      setLoading(true);
      const data = await assetsService.getAll();
      setAssets(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar ativos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deseja remover este ativo?')) return;
    try {
      await assetsService.remove(String(id));
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      notify('Ativo removido com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify('Erro ao remover ativo', 'error');
    }
  }

  const filteredAssets = useMemo(() => {
    setCurrentPage(1); 
    return assets.filter((a) => {
      const hostname = (a.hostname ?? '').toLowerCase();
      const fabricante = (a.fabricante ?? '').toLowerCase();
      const modelo = (a.modelo ?? '').toLowerCase();

      const matchesSearch =
        hostname.includes(search.toLowerCase()) ||
        fabricante.includes(search.toLowerCase()) ||
        modelo.includes(search.toLowerCase());

      const matchesTipo = selectedTipo === 'TODOS' || a.tipo === selectedTipo;
      return matchesSearch && matchesTipo;
    });
  }, [assets, search, selectedTipo]);

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = useMemo(() => {
    return filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAssets, startIndex]);

  if (loading) return <div className="p-6 text-white">Carregando...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6">
      {/* MENU LATERAL */}
      <aside className="xl:w-72 rounded-3xl border border-white/5 bg-slate-900/60 p-6 h-fit">
        <h2 className="mb-6 text-2xl font-black text-white">Tipos</h2>
        <div className="space-y-2">
          {LISTA_TIPOS.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setSelectedTipo(tipo)}
              className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${
                selectedTipo === tipo
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tipo.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col justify-between min-h-[600px]">
        <div>
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">Ativos</h1>
              <p className="mt-2 text-slate-400">Gestão da infraestrutura de TI</p>
            </div>
            <button
              onClick={() => navigate('/assets/new')}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/20 px-5 py-3 font-bold text-cyan-400 transition hover:bg-cyan-500/30"
            >
              <Plus size={18} /> Novo Ativo
            </button>
          </div>

          {/* BUSCA */}
          <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
            <input
              type="text"
              placeholder="Buscar hostname, fabricante ou modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          {/* CONTAINER DA LISTA */}
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40">
            {paginatedAssets.length === 0 ? (
              <div className="p-10 text-center text-slate-500">Nenhum ativo encontrado</div>
            ) : (
              paginatedAssets.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  isOpen={selectedAssetId === asset.id}
                  onToggle={() => setSelectedAssetId(selectedAssetId === asset.id ? null : asset.id)}
                  onNavigate={navigate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* CONTROLADOR DE PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-sm text-slate-400">
              Página <span className="font-semibold text-white">{currentPage}</span> de{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </span>
            <div className="inline-flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}