export function AssetModal({ asset, onClose }: any) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

      <div className="bg-slate-900 p-6 rounded-2xl w-96 space-y-3">

        <h2 className="text-xl font-bold text-white">
          Ativo
        </h2>

        <p className="text-white">ID: {asset.id}</p>
        <p className="text-white">HostName: {asset.hostname}</p>
        <p className="text-white">Patrimonio: {asset.patrimonio}</p>
        <p className="text-white">Tipo: {asset.tipo}</p>

        <button
          className="w-full bg-red-500 p-2 rounded text-white"
          onClick={onClose}
        >
          Fechar
        </button>

      </div>
    </div>
  );
}
