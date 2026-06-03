interface AppCardProps {
  app: any;
}

export function AppCard({ app }: AppCardProps) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-white font-black text-lg">
            {app.nome}
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            {app.descricao || 'Sem descrição'}
          </p>
        </div>

        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">
          {app.criticidade || 'N/A'}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Categoria</span>
          <span className="text-slate-300">
            {app.categoria || 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Responsável</span>
          <span className="text-slate-300">
            {app.responsavel || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
