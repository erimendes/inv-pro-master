import { useNavigate } from 'react-router-dom';
import { ChevronRight, Mail, Shield, Eye, Pencil, Trash2, Crown, UserCog, User } from 'lucide-react';

interface UserCardProps {
  user: any;
  opened: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}

// Helpers isolados
function getRoleColor(role?: string) {
  switch (role) {
    case 'ADMIN': return 'text-red-400 border-red-500/30 bg-red-500/10';
    case 'MANAGER': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    case 'USER': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
  }
}

function getRoleIcon(role?: string) {
  switch (role) {
    case 'ADMIN': return <Crown size={18} />;
    case 'MANAGER': return <UserCog size={18} />;
    default: return <User size={18} />;
  }
}

function getInitials(name?: string) {
  if (!name) return 'US';
  const parts = name.split(' ');
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-2 font-bold text-slate-200">
        {icon}
        <span className="max-w-[140px] truncate">{value}</span>
      </div>
    </div>
  );
}

export function UserCard({ user, opened, onToggle, onDelete }: UserCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={onToggle}
      className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1120] p-6 transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900 cursor-pointer min-h-[300px] h-full`}
    >
      {/* HEADER CARD */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-lg font-black text-cyan-400">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="max-w-[140px] truncate text-xl font-black leading-tight text-white">
              {user.name}
            </h2>
            <p className="mt-1 text-sm uppercase tracking-widest text-slate-500">
              {user.role}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`mt-1 text-slate-600 transition-transform duration-300 ${opened ? 'rotate-90' : ''}`}
        />
      </div>

      {/* ROLE TAG */}
      <div className="mt-6 flex flex-wrap gap-3">
        <span className={`flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
          {getRoleIcon(user.role)}
          {user.role}
        </span>
      </div>

      {/* INFO BODY */}
      <div className="mt-8 space-y-4">
        <InfoRow
          label="Email"
          value={user.email || '-'}
          icon={<Mail size={15} className="text-cyan-400" />}
        />
        <InfoRow
          label="Perfil"
          value={user.role || '-'}
          icon={<Shield size={15} className="text-emerald-400" />}
        />
      </div>

      {/* ACTIONS DRAWER */}
      <div
        className={`absolute inset-x-0 bottom-0 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 ${
          opened ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${user.id}`);
            }}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
          >
            <div className="flex items-center justify-center gap-2">
              <Eye size={16} /> Detalhes
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${user.id}/edit`);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-400"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(user.id);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}