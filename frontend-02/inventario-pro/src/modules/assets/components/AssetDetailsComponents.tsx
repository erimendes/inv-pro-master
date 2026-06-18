import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-800/80 bg-[#0a0f1d] p-6 shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        {icon && (
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

interface DetailItemProps {
  label: string;
  value?: any;
}

export function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#111625] p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="break-words text-sm font-semibold text-white">
        {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
      </p>
    </div>
  );
}