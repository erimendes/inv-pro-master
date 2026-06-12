import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 select-none hover:bg-slate-950/80 transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
      />
      {label}
    </label>
  );
};