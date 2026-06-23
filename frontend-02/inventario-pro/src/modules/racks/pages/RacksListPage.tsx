// src/modules/racks/pages/RacksListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server } from 'lucide-react';

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

  // FILTROS (Todos agora aceitam digitação livre)
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

  // FILTRAGEM (Todos usando tratamento de limpeza para resetar ao apagar)
  const filteredRacks = useMemo(() => {
    setCurrentPage(1); // Reseta a página ao filtrar
    
    const searchName = filterName.trim().toLowerCase();
    const searchLocation = filterLocation.trim().toLowerCase();
    const searchCapacity = filterCapacity.trim().toLowerCase().replace('u', ''); // Remove o 'U' caso o usuário digite

    return racks.filter((rack) => {
      const matchesName = searchName === '' || 
        (rack.nome?.toLowerCase() || '').includes(searchName);
        
      const matchesLocation = searchLocation === '' || 
        (rack.localizacao?.toLowerCase() || '').includes(searchLocation);
        
      const matchesCapacity = searchCapacity === '' || 
        String(rack.capacidade || '').includes(searchCapacity);

      return matchesName && matchesLocation && matchesCapacity;
    });
  }, [racks, filterName, filterLocation, filterCapacity]);

  // FUNÇÃO PARA RESETAR TODOS OS FILTROS DE INFRAESTRUTURA
  const handleResetFilters = () => {
    setFilterName('');
    setFilterLocation('');
    setFilterCapacity('');
  };

  // LISTA DE NOMES ÚNICOS PARA O DATALIST
  const uniqueNames = useMemo(() => {
    const names = racks.map((r) => r.nome).filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [racks]);

  // LISTA DE LOCALIZAÇÕES ÚNICAS PARA O DATALIST
  const uniqueLocations = useMemo(() => {
    const locations = racks.map((r) => r.localizacao).filter(Boolean);
    return Array.from(new Set(locations)).sort((a, b) => a.localeCompare(b));
  }, [racks]);

  // CAPACIDADES ÚNICAS PARA O DATALIST
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
      <div className="flex h-full w-full items-center justify-center bg-[#070a13] text-slate-400">
        Carregando racks...
      </div>
    );
  }

  if (error) {
    return <div className="flex h-full w-full items-center justify-center p-8 text-red-400">{error}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#070a13] text-slate-100 overflow-hidden min-h-0">
      
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col gap-2 px-8 pt-2 pb-1 bg-[#070a13] shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">Racks</h1>
              
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-md">
                <Server size={10} />
                INFRAESTRUTURA
              </span>
            </div>

            {/* FILTROS HORIZONTAIS AJUSTADOS */}
            <div className="flex flex-wrap items-center gap-2 w-full max-w-3xl">
              
              {/* Input Buscável de Nome (Sempre visível) */}
              <div className="shrink-0">
                <input
                  list="racks-names"
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="NOME: TODOS"
                  className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:border-cyan-500 w-40 transition placeholder:text-slate-500 truncate"
                />
                <datalist id="racks-names">
                  {uniqueNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              {/* Input Buscável de Localização */}
              {/* 🟢 CORREÇÃO RESPONSIVA (image_dc8cc6.png): Adicionado 'hidden sm:block' */}
              <div className="shrink-0 hidden sm:block">
                <input
                  list="racks-locations"
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="LOCALIZAÇÃO: TODAS"
                  className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-400 outline-none focus:border-cyan-500 w-52 transition placeholder:text-cyan-500/60 truncate"
                />
                <datalist id="racks-locations">
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Input Buscável de Capacidade */}
              {/* 🟢 CORREÇÃO RESPONSIVA (image_dc8cc6.png): Adicionado 'hidden sm:block' */}
              <div className="shrink-0 hidden sm:block">
                <input
                  list="racks-capacities"
                  type="text"
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value)}
                  placeholder="CAPACIDADE: TODAS"
                  className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400 outline-none focus:border-purple-500 w-48 transition placeholder:text-purple-500/60 truncate"
                />
                <datalist id="racks-capacities">
                  {uniqueCapacities.map((cap) => (
                    <option key={cap} value={`${cap}U`} />
                  ))}
                </datalist>
              </div>

              {/* Botão Todos */}
              {/* 🟢 ADICIONAL RESPONSIVO: Adicionado 'hidden sm:block' para acompanhar os inputs ocultados */}
              <button
                onClick={handleResetFilters}
                className="hidden sm:block rounded-full border border-slate-800 bg-slate-950/60 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer shrink-0"
              >
                Todos
              </button>

            </div>
          </div>

          {/* TOTAL E BOTÃO NOVO RACK */}
          <div className="hidden sm:flex items-center gap-4 justify-between sm:justify-end">
            <div className="text-right">
              <span className="block text-3xl font-black leading-none text-cyan-400">
                {filteredRacks.length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</span>
            </div>

            <button
              onClick={() => navigate('/racks/new')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 font-black text-xs uppercase tracking-wider text-slate-950 transition-all hover:scale-[1.01] hover:bg-emerald-400 shadow-md shadow-emerald-500/5"
            >
              <span className="text-sm font-bold leading-none">+</span> Novo Rack
            </button>
          </div>

        </div>
      </div>

      {/* CORPO DO GRID */}
      <main className="flex-1 px-9 pt-2 pb-2 flex flex-col justify-between items-start overflow-y-auto w-full min-h-0">
        {filteredRacks.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-dashed border-slate-800 text-slate-500 font-medium bg-slate-900/10">
            Nenhum rack encontrado correspondente aos filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start w-full content-start flex-1 min-h-0 overflow-y-auto pr-1">
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

        {/* PAGINAÇÃO COMPACTA */}
        {totalPages > 1 && (
          <div className="mt-2 pt-2 border-t border-slate-900/60 flex justify-between items-center text-[11px] text-slate-400 w-full shrink-0">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition font-bold text-white text-[10px]"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition font-bold text-white text-[10px]"
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