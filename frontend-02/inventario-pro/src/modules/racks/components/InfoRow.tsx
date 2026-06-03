// src/modules/racks/components/InfoRow.tsx
import React, { type ReactNode } from 'react';

interface InfoRowProps {
  label: string;
  value: string | number;
  icon: ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-2 font-bold text-slate-200">
        {icon}
        {value}
      </div>
    </div>
  );
};