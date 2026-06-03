import type { Asset } from '../types/asset.types';
import { useNavigate } from 'react-router-dom';

export default function AssetTable({
  assets,
  onDelete,
}: {
  assets: Asset[];
  onDelete?: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <table className="w-full border-collapse border border-slate-700">
      <thead>
        <tr>
          <th className="border border-slate-700 px-4 py-2">Nome</th>
          <th className="border border-slate-700 px-4 py-2">Categoria</th>
          <th className="border border-slate-700 px-4 py-2">Valor</th>
          <th className="border border-slate-700 px-4 py-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.id}>
            <td className="border border-slate-700 px-4 py-2">{asset.name}</td>
            <td className="border border-slate-700 px-4 py-2">{asset.category}</td>
            <td className="border border-slate-700 px-4 py-2">{asset.value}</td>
            <td className="border border-slate-700 px-4 py-2 space-x-2">
              <button
                onClick={() => navigate(`/assets/${asset.id}/edit`)}
                className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white text-sm"
              >
                Editar
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(asset.id)}
                  className="px-2 py-1 rounded bg-red-500 hover:bg-red-400 text-white text-sm"
                >
                  Excluir
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
