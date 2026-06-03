// src/modules/racks/pages/RacksListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server } from 'lucide-react';

import { racksService } from '../services/racks.service';
import type { Rack } from '../types/rack.types';
import { useNotification } from '../../../app/providers/NotificationProvider';

// Novos componentes isolados
import { RackCard } from '../components/RackCard';

export default function RacksListPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [loading, setLoading] = useState(true);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [error, setError] = useState('');

  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  // FILTROS
  const [filterName, setFilterName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('');

  // PAGINAÇÃO (Garante no máximo 3 colunas por 2 linhas = 6 itens por página)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    loadRacks();
  }, []);

  async function loadRacks() {
    try {
      setLoading(true);
      const data = await racksService.getAll();
      setRacks(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar racks');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja remover este rack?')) return;
    try {
      await racksService.remove(id);
      setRacks((prev) => prev.filter((rack) => rack.id !== id));
      notify('Rack removido com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify('Erro ao remover rack', 'error');
    }
  }

  // FILTRAGEM
  const filteredRacks = useMemo(() => {
    setCurrentPage(1); // Reseta a página ao filtrar
    return racks.filter((rack) => {
      const matchesName = (rack.nome?.toLowerCase() || '').includes(filterName.toLowerCase());
      const matchesLocation = (rack.localizacao?.toLowerCase() || '').includes(filterLocation.toLowerCase());
      const matchesCapacity = filterCapacity === '' || String(rack.capacidade) === filterCapacity;

      return matchesName && matchesLocation && matchesCapacity;
    });
  }, [racks, filterName, filterLocation, filterCapacity]);

  // CAPACIDADES ÚNICAS PARA O SELECT
  const uniqueCapacities = useMemo(() => {
    const capacities = racks.map((r) => r.capacidade).filter(Boolean);
    return Array.from(new Set(capacities)).sort((a, b) => a - b);
  }, [racks]);

  // PAGINAÇÃO FRAGMENTADA
  const totalPages = Math.ceil(filteredRacks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRacks = useMemo(() => {
    return filteredRacks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRacks, startIndex]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070a13] text-slate-400">
        Carregando racks...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-400">{error}</div>;
  }

  return (
    <div className="flex bg-[#070a13] text-slate-100 min-h-screen">
      {/* SIDEBAR DE FILTROS */}
      <aside className="w-72 shrink-0 h-fit border-r border-slate-900 bg-[#0a0f1d] p-5">
        <div className="mb-10">
          <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.25em] text-cyan-400">
            <Server size={18} />
            Infraestrutura
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Nome</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="RACK-01..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Localização</label>
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="Sala segura..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Capacidade</label>
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500 transition"
            >
              <option value="">Todas</option>
              {uniqueCapacities.map((cap) => (
                <option key={cap} value={String(cap)}>{cap}U</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col justify-between p-8 gap-6">
        <div>
          {/* HEADER */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="mb-3 text-5xl font-black tracking-tight text-white">Racks</h1>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-cyan-400">
                  Localização: {filterLocation || 'TODAS'}
                </span>
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-violet-400">
                  Capacidade: {filterCapacity ? `${filterCapacity}U` : 'TODAS'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-5xl font-black leading-none text-cyan-400">
                  {filteredRacks.length}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total</span>
              </div>

              <button
                onClick={() => navigate('/racks/new')}
                className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 transition hover:scale-105 hover:bg-cyan-400"
              >
                <Plus size={18} /> Novo Rack
              </button>
            </div>
          </div>

          {/* GRID COM LIMITE DE 3 ITENS POR LINHA */}
          {filteredRacks.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500">
              Nenhum rack encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedRacks.map((rack) => (
                <RackCard
                  key={rack.id}
                  rack={rack}
                  isOpened={selectedRackId === rack.id}
                  onToggle={() => setSelectedRackId(selectedRackId === rack.id ? null : rack.id)}
                  onNavigate={navigate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-auto">
            <span className="text-sm text-slate-400">
              Página <span className="font-semibold text-white">{currentPage}</span> de{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </span>
            <div className="flex gap-2">
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