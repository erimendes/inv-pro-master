// src/app/components/applications/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border border-slate-800 bg-[#0b1120] px-4 py-2 text-sm font-bold text-slate-400 transition hover:bg-slate-900 disabled:opacity-40"
      >
        Anterior
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
            currentPage === page
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'border border-slate-800 bg-[#0b1120] text-slate-400 hover:bg-slate-900'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border border-slate-800 bg-[#0b1120] px-4 py-2 text-sm font-bold text-slate-400 transition hover:bg-slate-900 disabled:opacity-40"
      >
        Próximo
      </button>
    </div>
  );
};