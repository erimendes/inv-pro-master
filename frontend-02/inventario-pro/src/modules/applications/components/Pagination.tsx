// src/modules/applications/components/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    /* 🟢 CORREÇÃO VISUAL: 
       - Adicionado 'w-full' para ocupar toda a largura disponível.
       - Adicionado 'border-t border-slate-900/60' para criar a linha superior divisória.
       - Adicionado 'flex justify-between items-center' para jogar o texto para a esquerda e os botões para a direita.
       - Paddings e margens ('mt-2 pt-2') calibrados na mesma régua dos outros módulos.
    */
    <div className="mt-2 pt-2 border-t border-slate-900/60 flex justify-between items-center text-[11px] text-slate-400 w-full shrink-0 select-none">
      
      {/* Texto alinhado à esquerda */}
      <span>Página {currentPage} de {totalPages}</span>
      
      {/* Botões agrupados à direita */}
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition font-bold text-white text-[10px] cursor-pointer"
        >
          Anterior
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition font-bold text-white text-[10px] cursor-pointer"
        >
          Próxima
        </button>
      </div>

    </div>
  );
};