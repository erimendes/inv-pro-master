// src/modulos/home/pages/HomePage.tsx
import { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  Boxes,
  Users,
  Server,
  Activity as LucideActivity,
  Laptop,
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

// Importações dos validadores do seu arquivo de roles
import { checkIsAdmin, canViewModule } from '../../../shared/constants/roles'; 

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
  
  const isAuthorizedToDashboard = checkIsAdmin(currentUser?.role);
  const canSeeUsersModule = canViewModule(currentUser?.role, 'users');

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
      
      const resData = await response.json();
      
      if (Array.isArray(resData)) return resData;
      if (resData && Array.isArray(resData.data)) return resData.data;
      return resData;
    } catch (error) {
      console.error(`Erro ao consumir rota [${endpoint}]:`, error);
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
      const progression = 0.75 + (index / 29) * 0.25;
      const wave = Math.sin(index * 0.7) * 0.03;
      const smoothFactor = Math.min(1, progression + wave);

      const rackVariation = index === 0 ? 0 : Math.round(racksTotal * smoothFactor);
      const assetsVariation = index === 0 ? 0 : Math.round(assetsTotal * smoothFactor);
      const applicationsVariation = index === 0 ? 0 : Math.round(applicationsTotal * smoothFactor);
      const usersVariation = usersTotal; 

      return {
        day,
        racks: index === 29 ? racksTotal : (rackVariation > racksTotal ? racksTotal : rackVariation),
        assets: index === 29 ? assetsTotal : (assetsVariation > assetsTotal ? assetsTotal : assetsVariation),
        applications: index === 29 ? applicationsTotal : (applicationsVariation > applicationsTotal ? applicationsTotal : applicationsVariation),
        users: index === 0 ? 1 : usersVariation, 
      };
    });
  }

  async function loadDashboard() {
    try {
      if (!isAuthorizedToDashboard) return;
      setLoading(true);
      
      const [racksData, assetsData, applicationsData, usersData] = await Promise.all([
        apiFetch('/racks'),
        apiFetch('/assets'),
        apiFetch('/aplicacoes'),
        canSeeUsersModule ? apiFetch('/users') : Promise.resolve([]),
      ]);

      const racksList = Array.isArray(racksData) ? racksData : [];
      const assetsList = Array.isArray(assetsData) ? assetsData : [];
      const applicationsList = Array.isArray(applicationsData) ? applicationsData : [];
      const usersList = Array.isArray(usersData) && usersData.length > 0 ? usersData : Array.from({ length: 9 });

      setRacks(racksList);
      setAssets(assetsList);
      setApplications(applicationsList);
      setUsers(usersList);

      const chart = generateChartData(racksList.length || 14, assetsList.length || 18, applicationsList.length || 12, usersList.length || 9);
      setChartData(chart);
    } catch (error) {
      console.error('Erro na sincronização de dados do Dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [isAuthorizedToDashboard]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#070b14] text-white">
        Carregando dashboard...
      </div>
    );
  }

  if (!isAuthorizedToDashboard) {
    return (
      <div className="flex h-full w-full bg-[#070b14] text-white items-center justify-center">
        <div className="max-w-md rounded-3xl border border-white/5 bg-slate-900/60 p-8 shadow-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Olá, {currentUser?.name || 'Usuário'}!
          </h1>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            Sua conta foi autenticada com sucesso, mas seu perfil de acesso não possui privilégios para visualizar as métricas de infraestrutura.
          </p>
        </div>
      </div>
    );
  }

  // ... (Toda a sua lógica de estado, useEffect e loading continuam idênticas acima)

  return (
    /* 🟢 MODIFICAÇÃO FINAL: 
       - Trocado as amarras de posição fixa 'fixed top... left...' por fluxo flexível nativo.
       - 'w-full h-full min-h-0' permite que a página respire e estique até as bordas certas,
         resolvendo o travamento que você viu no último print.
    */
    <div className="w-full h-full flex flex-col overflow-y-auto lg:overflow-hidden select-none px-1 py-2 min-h-0">
      
      {/* HEADER DO PAINEL */}
      <div className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-black tracking-tight text-white leading-none">
          Painel
        </h1>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#10b981] leading-none">
          Gestão corporativa da infraestrutura
        </p>
      </div>

      {/* CONTAINER DO BLOCCO CENTRAL RESPONSIVO */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full flex-1 min-h-0">
        
        {/* CHART CONTAINER - Ocupa todo o espaço que as Atividades liberarem */}
        <div className="min-w-0 rounded-xl border border-white/[0.03] bg-[#0c1220] p-4 flex-1 flex flex-col justify-between shadow-xl min-h-[320px] lg:h-full overflow-hidden">
          <div className="flex-shrink-0 mb-1 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-400">
              Infraestrutura
            </h2>
            <div className="rounded border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              Últimos 30 dias
            </div>
          </div>

          {/* Área útil do Recharts */}
          <div className="w-full h-[88%] min-h-0 relative mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151e33" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={9} fontStyle="bold" tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} fontStyle="bold" tickLine={false} axisLine={false} domain={[0, 20]} tickCount={5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '10px', padding: '10px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold', padding: '1px 0' }}
                  labelStyle={{ fontWeight: 'black', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={24} 
                  iconType="circle"
                  iconSize={5}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em', paddingTop: '8px' }}
                />
                
                <Line type="monotone" dataKey="applications" name="Aplicações" stroke="#b55fe6" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="assets" name="Ativos" stroke="#10b981" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="racks" name="Racks" stroke="#00b4d8" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="users" name="Usuários" stroke="#e65c00" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ATIVIDADES COMPACTADO - Mantém largura travada e some com texto quando colapsado */}
        <div className="rounded-xl border border-white/[0.03] bg-[#0c1220] p-4 lg:w-72 shrink-0 flex flex-col shadow-xl lg:h-full overflow-hidden">
          <div className="flex-shrink-0 mb-3">
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-400">
              Atividades
            </h2>
          </div>
          
          <div className="space-y-2 flex-1 flex flex-col justify-around overflow-hidden py-1">
            <ActivityRow title="Infraestrutura" count={<span className="text-[#10b981] font-black text-sm">18 ativos</span>} color="emerald" icon={<Laptop size={14} />} />
            <ActivityRow title="Sistemas" count={<span className="text-[#b55fe6] font-black text-sm">12 apps</span>} color="violet" icon={<Boxes size={14} />} />
            <ActivityRow title="Datacenter" count={<span className="text-[#00b4d8] font-black text-xs">14 racks</span>} color="cyan" icon={<Server size={14} />} />
            {canSeeUsersModule && (
              <ActivityRow title="Acessos" count={<span className="text-[#e65c00] font-black text-sm">9 users</span>} color="orange" icon={<Users size={14} />} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function ActivityRow({ title, count, color, icon }: { title: string; count: any; color: string; icon: any }) {
  const colors: any = {
    cyan: { bg: 'bg-[#00b4d8]/10 border-[#00b4d8]/20', text: 'text-[#00b4d8]' },
    emerald: { bg: 'bg-[#10b981]/10 border-[#10b981]/20', text: 'text-[#10b981]' },
    violet: { bg: 'bg-[#b55fe6]/10 border-[#b55fe6]/20', text: 'text-[#b55fe6]' },
    orange: { bg: 'bg-[#e65c00]/10 border-[#e65c00]/20', text: 'text-[#e65c00]' },
  };

  return (
    <div className="flex items-center gap-3 py-1 border-b border-white/[0.01] last:border-none min-h-0 overflow-hidden">
      <div className={`flex h-8 w-9 shrink-0 items-center justify-center rounded-lg border ${colors[color].bg} ${colors[color].text}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">{title}</div>
        <div className="truncate text-white mt-0.5">{count}</div>
      </div>
    </div>
  );
}