// src/app/components/assets/InfoCard.tsx
import React from 'react';

interface InfoCardProps {
  label: string;
  value?: string | null;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="font-semibold text-white">
        {value || '-'}
      </div>
    </div>
  );
};