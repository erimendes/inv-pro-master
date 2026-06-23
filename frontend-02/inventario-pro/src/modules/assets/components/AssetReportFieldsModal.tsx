import { ArrowLeft, CheckSquare, Square } from 'lucide-react';

const AVAILABLE_FIELDS = [
  { key: 'id', label: 'ID do Ativo' },
  { key: 'hostname', label: 'Hostname' },
  { key: 'tipo', label: 'Tipo de Ativo' },
  { key: 'status', label: 'Status' },
  { key: 'ipPrincipal', label: 'IP Principal' },
  { key: 'fabricante', label: 'Fabricante' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'numSerie', label: 'Número de Série' },
  { key: 'localizacao', label: 'Localização / Data Center' },
];

interface ReportFieldsProps {
  selectedFields: string[];
  onToggleField: (key: string) => void;
  onToggleAll: () => void;
  onBack: () => void;
  onAdvance: () => void;
}

export default function AssetReportFieldsModal({ 
  selectedFields, 
  onToggleField, 
  onToggleAll, 
  onBack, 
  onAdvance 
}: ReportFieldsProps) {
  return (
    <div className="w-full h-full flex flex-col bg-[#070a13] text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft size={16} /> Voltar para a listagem
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Configurar Relatório</h1>
          <p className="text-xs text-slate-400">Selecione quais colunas devem ser incluídas. Os filtros da tela anterior serão aplicados.</p>
        </div>

        <div className="bg-[#090d1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campos do Ativo ({selectedFields.length})</span>
            <button onClick={onToggleAll} className="text-xs font-black text-cyan-400 hover:underline cursor-pointer bg-transparent border-0">
              {selectedFields.length === AVAILABLE_FIELDS.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABLE_FIELDS.map((field) => {
              const isChecked = selectedFields.includes(field.key);
              return (
                <div 
                  key={field.key}
                  onClick={() => onToggleField(field.key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                    isChecked ? 'border-cyan-500 bg-cyan-500/5 text-white' : 'border-slate-800 bg-[#0b1120] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isChecked ? <CheckSquare size={18} className="text-cyan-400" /> : <Square size={18} />}
                  <span className="text-xs font-bold tracking-wide">{field.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          disabled={selectedFields.length === 0}
          onClick={onAdvance}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-black text-xs uppercase tracking-wider text-slate-950 transition-all hover:bg-cyan-400 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
        >
          Avançar para o Preview
        </button>
      </div>
    </div>
  );
}
export { AVAILABLE_FIELDS };