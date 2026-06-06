import { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  Boxes,
  Users,
  Server,
  Bell,
  Search,
  Shield,
  Database,
  ActivityIcon,
} from 'lucide-react';

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const API_URL = 'http://localhost:3000';

type Rack = { id: string };
type Asset = { id: string };
type Application = { id: string };
type User = { id: string; name?: string; role?: string };

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser?.role === 'ADMIN';

  async function apiFetch(endpoint: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function generateLast30Days() {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    return days;
  }

  function generateChartData(racksTotal: number, assetsTotal: number, applicationsTotal: number, usersTotal: number) {
    const days = generateLast30Days();
    return days.map((day, index) => {
      const rackVariation = Math.max(1, Math.floor(racksTotal * ((index + 1) / 30)));
      const assetsVariation = Math.max(1, Math.floor(assetsTotal * ((index + 1) / 30)));
      const applicationsVariation = Math.max(1, Math.floor(applicationsTotal * ((index + 1) / 30)));
      const usersVariation = Math.max(1, Math.floor(usersTotal * ((index + 1) / 30)));
      return {
        day,
        racks: rackVariation,
        assets: assetsVariation,
        applications: applicationsVariation,
        users: usersVariation,
      };
    });
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      const [racksData, assetsData, applicationsData, usersData] = await Promise.all([
        apiFetch('/hardware/racks'),
        apiFetch('/hardware/assets'),
        apiFetch('/aplicacoes'),
        isAdmin ? apiFetch('/users') : Promise.resolve([]),
      ]);

      const racksList = Array.isArray(racksData) ? racksData : [];
      const assetsList = Array.isArray(assetsData) ? assetsData : [];
      const applicationsList = Array.isArray(applicationsData) ? applicationsData : [];
      const usersList = Array.isArray(usersData) ? usersData : [];

      setRacks(racksList);
      setAssets(assetsList);
      setApplications(applicationsList);
      setUsers(usersList);

      const chart = generateChartData(racksList.length, assetsList.length, applicationsList.length, usersList.length);
      setChartData(chart);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        Carregando dashboard...
      </div>
    );
  }

  // ==========================================
  // TELA PARA USUÁRIO COMUM (NÃO-ADMIN)
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-[#030712] text-white">
        <main className="min-w-0 flex-1 px-8 pt-10 pb-10 flex flex-col items-center justify-center text-center">
          <div className="max-w-md rounded-3xl border border-white/5 bg-slate-900/60 p-8 shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Olá, {currentUser?.name || 'Usuário'}!
            </h1>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              Sua conta foi autenticada com sucesso, mas você não possui privilégios de <strong>Administrador</strong> para gerenciar a infraestrutura e visualizar as métricas globais do Datacenter.
            </p>
            <div className="text-xs text-slate-500 border-t border-white/5 pt-4">
              Caso necessite de permissões elevadas, entre em contato com o administrador do sistema.
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // TELA ORIGINAL PARA ADMINISTRADOR
  // ==========================================
  return (
    <div className="flex min-h-screen bg-[#030712] text-white">
      {/* CONTENT */}
      <main className="min-w-0 flex-1 overflow-hidden px-8 pt-4 pb-10">
        
        {/* TOPBAR */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-base text-slate-400">
              Gestão corporativa da infraestrutura
            </p>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Kpi title="Racks" value={racks.length} icon={<Database />} color="cyan" />
          <Kpi title="Assets" value={assets.length} icon={<Server />} color="emerald" />
          <Kpi title="Aplicações" value={applications.length} icon={<Boxes />} color="violet" />
          {isAdmin && <Kpi title="Usuários" value={users.length} icon={<Users />} color="orange" />}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* CHART */}
          <div className="min-w-0 rounded-3xl border border-white/5 bg-slate-900/60 p-8 xl:col-span-2">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-black">
                Infraestrutura
              </h2>
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-2 text-sm text-slate-300">
                Últimos 30 dias
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <LineChart
                width={900}
                height={350}
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="racks" name="Racks" stroke="#06b6d4" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="assets" name="Assets" stroke="#22c55e" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="applications" name="Aplicações" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                {isAdmin && <Line type="monotone" dataKey="users" name="Usuários" stroke="#f97316" strokeWidth={3} dot={false} />}
              </LineChart>
            </div>
          </div>

          {/* ACTIVITIES */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-8">
            <h2 className="mb-8 text-3xl font-black">
              Atividades
            </h2>
            <div className="space-y-5">
              <Activity title={`${assets.length} assets carregados`} subtitle="Infraestrutura" color="emerald" />
              <Activity title={`${applications.length} aplicações`} subtitle="Sistemas" color="violet" />
              {isAdmin && <Activity title={`${users.length} usuários`} subtitle="Controle de acesso" color="orange" />}
              <Activity title={`${racks.length} racks`} subtitle="Datacenter" color="cyan" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// =====================================
// SIDEBAR ICON
// =====================================
function SidebarIcon({ icon, active }: any) {
  return (
    <button
      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
        active ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5'
      }`}
    >
      {icon}
    </button>
  );
}

// =====================================
// KPI
// =====================================
function Kpi({ title, value, icon, color }: any) {
  const colors: any = {
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-8 transition hover:scale-[1.02]">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color].bg} ${colors[color].text}`}>
        {icon}
      </div>
      <p className="mb-3 text-slate-400">{title}</p>
      <h2 className={`text-5xl font-black ${colors[color].text}`}>{value}</h2>
    </div>
  );
}

// =====================================
// ACTIVITY
// =====================================
function Activity({ title, subtitle, color }: any) {
  const colors: any = {
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };

  return (
    <div className="flex items-start gap-4 border-b border-white/5 pb-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color].bg}`}>
        <ActivityIcon size={18} className={colors[color].text} />
      </div>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-sm text-slate-400">{subtitle}</div>
      </div>
    </div>
  );
}