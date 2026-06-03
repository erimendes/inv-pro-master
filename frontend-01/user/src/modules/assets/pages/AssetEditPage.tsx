import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface Props {
  assetId?: string;
  onBack: () => void;
}

export default function AssetEditPage({ assetId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    hostname: '',
    tipo: '',
    hardware: '',
    ipRede: '',
    tamanhoU: 1
  });

  useEffect(() => {
    async function loadAsset() {
      try {
        const res = await fetch(`http://localhost:3000/hardware/assets/${assetId}`);
        
        if (!res.ok) {
          throw new Error(`Ativo ${assetId} não encontrado (Erro ${res.status})`);
        }

        const data = await res.json();
        setFormData({
          hostname: data.hostname || '',
          tipo: data.tipo || '',
          hardware: data.hardware || '',
          ipRede: data.ipRede || '',
          tamanhoU: Number(data.tamanhoU) || 1
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (assetId) loadAsset();
  }, [assetId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/hardware/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao atualizar dados");
      
      onBack();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-emerald-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <p className="text-xl font-bold mb-4">{error}</p>
      <button onClick={onBack} className="bg-white text-black px-6 py-2 rounded-full font-bold">Voltar</button>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="text-white" />
        </button>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Editar Ativo</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-6 bg-slate-900/50 p-8 rounded-[2rem] border border-white/5">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Hostname</label>
            <input 
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition-all"
              value={formData.hostname}
              onChange={e => setFormData({...formData, hostname: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Tipo</label>
            <select 
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none appearance-none"
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
            >
              <option value="SERVIDOR_FISICO">Servidor Físico</option>
              <option value="SWITCH">Switch</option>
              <option value="STORAGE">Storage</option>
              <option value="FIREWALL">Firewall</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Tamanho (U)</label>
            <input 
              type="number"
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              value={formData.tamanhoU}
              onChange={e => setFormData({...formData, tamanhoU: Number(e.target.value)})}
            />
          </div>
        </div>

        <button 
          disabled={saving}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          SALVAR ALTERAÇÕES
        </button>
      </form>
    </div>
  );
}