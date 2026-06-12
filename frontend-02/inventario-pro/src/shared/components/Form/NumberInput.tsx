import React from 'react';

interface NumberInputProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-400">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
      />
    </div>
  );
};