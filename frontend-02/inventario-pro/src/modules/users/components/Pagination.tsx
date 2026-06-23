// src/shared/components/Pagination.tsx (ou o caminho correto onde armazena o componente global)
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="w-full mt-auto flex items-center justify-between pt-4 pb-2 border-t border-slate-800/60 text-xs text-slate-400 select-none shrink-0">
      {/* Texto descritivo alinhado à esquerda seguindo o padrão das imagens */}
      <span>Página {currentPage} de {totalPages}</span>

      {/* Botões empurrados e agrupados totalmente à direita */}
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition cursor-pointer"
        >
          Anterior
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition cursor-pointer"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}