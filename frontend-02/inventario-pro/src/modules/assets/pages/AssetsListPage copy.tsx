// import { useEffect, useMemo, useState } from 'react';

// import { useNavigate } from 'react-router-dom';

// import {
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   Pencil,
//   Plus,
//   Trash2,
//   Monitor,
//   Laptop,
//   Server,
//   Router,
//   HardDrive,
//   Network,
// } from 'lucide-react';

// import { assetsService } from '../services/assets.service';

// import type { Asset } from '../types/asset.types';

// import { useNotification } from '../../../app/providers/NotificationProvider';

// enum AtivoTipo {
//   TODOS = 'TODOS',

//   LAPTOP = 'LAPTOP',

//   DESKTOP = 'DESKTOP',

//   SERVIDOR_FISICO = 'SERVIDOR_FISICO',

//   SERVIDOR_VIRTUAL = 'SERVIDOR_VIRTUAL',

//   SWITCH = 'SWITCH',

//   ROTEADOR = 'ROTEADOR',

//   STORAGE = 'STORAGE',

//   MONITOR = 'MONITOR',
// }

// export default function AssetsListPage() {
//   const [assets, setAssets] = useState<
//     Asset[]
//   >([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState('');

//   const [search, setSearch] =
//     useState('');

//   const [selectedTipo, setSelectedTipo] =
//     useState<AtivoTipo>(
//       AtivoTipo.TODOS,
//     );

//   // LINHA EXPANDIDA
//   const [
//     selectedAssetId,
//     setSelectedAssetId,
//   ] = useState<number | null>(null);

//   const { notify } =
//     useNotification();

//   const navigate = useNavigate();

//   useEffect(() => {
//     loadAssets();
//   }, []);

//   async function loadAssets() {
//     try {
//       setLoading(true);

//       const data =
//         await assetsService.getAll();

//       setAssets(data);
//     } catch (error) {
//       console.error(error);

//       setError(
//         'Erro ao carregar ativos',
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(
//     id: number,
//   ) {
//     const confirmed = confirm(
//       'Deseja remover este ativo?',
//     );

//     if (!confirmed) return;

//     try {
//       await assetsService.remove(id);

//       setAssets((prev) =>
//         prev.filter(
//           (asset) =>
//             asset.id !== id,
//         ),
//       );

//       notify(
//         'Ativo removido com sucesso!',
//         'success',
//       );
//     } catch (error) {
//       console.error(error);

//       notify(
//         'Erro ao remover ativo',
//         'error',
//       );
//     }
//   }

//   // =========================
//   // FILTRO
//   // =========================

//   const filteredAssets = useMemo(() => {
//     return assets.filter((a) => {
//       const hostname =
//         (
//           a.hostname ?? ''
//         ).toLowerCase();

//       const fabricante =
//         (
//           a.fabricante ?? ''
//         ).toLowerCase();

//       const modelo = (
//         a.modelo ?? ''
//       ).toLowerCase();

//       const matchesSearch =
//         hostname.includes(
//           search.toLowerCase(),
//         ) ||
//         fabricante.includes(
//           search.toLowerCase(),
//         ) ||
//         modelo.includes(
//           search.toLowerCase(),
//         );

//       const matchesTipo =
//         selectedTipo ===
//           AtivoTipo.TODOS ||
//         a.tipo === selectedTipo;

//       return (
//         matchesSearch &&
//         matchesTipo
//       );
//     });
//   }, [
//     assets,
//     search,
//     selectedTipo,
//   ]);

//   // =========================
//   // ÍCONE DO TIPO
//   // =========================

//   function getAssetIcon(
//     tipo?: string,
//   ) {
//     switch (tipo) {
//       case 'LAPTOP':
//         return (
//           <Laptop size={22} />
//         );

//       case 'DESKTOP':
//         return (
//           <Monitor size={22} />
//         );

//       case 'SERVIDOR_FISICO':
//         return (
//           <Server size={22} />
//         );

//       case 'SERVIDOR_VIRTUAL':
//         return (
//           <Server size={22} />
//         );

//       case 'ROTEADOR':
//         return (
//           <Router size={22} />
//         );

//       case 'SWITCH':
//         return (
//           <Network size={22} />
//         );

//       case 'STORAGE':
//         return (
//           <HardDrive size={22} />
//         );

//       default:
//         return (
//           <Monitor size={22} />
//         );
//     }
//   }

//   // =========================
//   // LOADING
//   // =========================

//   if (loading) {
//     return (
//       <div className="p-6 text-white">
//         Carregando...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 text-red-400">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col xl:flex-row gap-6 p-6">
//       {/* MENU LATERAL */}
//       <aside
//         className="
//           xl:w-72
//           rounded-3xl
//           border
//           border-white/5
//           bg-slate-900/60
//           p-6
//           h-fit
//         "
//       >
//         <h2 className="mb-6 text-2xl font-black text-white">
//           Tipos
//         </h2>

//         <div className="space-y-2">
//           {Object.values(
//             AtivoTipo,
//           ).map((tipo) => (
//             <button
//               key={tipo}
//               onClick={() =>
//                 setSelectedTipo(
//                   tipo,
//                 )
//               }
//               className={`
//                 w-full
//                 rounded-2xl
//                 px-4
//                 py-3
//                 text-left
//                 font-semibold
//                 transition
//                 ${
//                   selectedTipo ===
//                   tipo
//                     ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
//                     : 'text-slate-400 hover:bg-white/5 hover:text-white'
//                 }
//               `}
//             >
//               {tipo.replaceAll(
//                 '_',
//                 ' ',
//               )}
//             </button>
//           ))}
//         </div>
//       </aside>

//       {/* CONTEÚDO */}
//       <main className="flex-1">
//         {/* HEADER */}
//         <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <h1 className="text-4xl font-black text-white">
//               Ativos
//             </h1>

//             <p className="mt-2 text-slate-400">
//               Gestão da
//               infraestrutura de TI
//             </p>
//           </div>

//           <button
//             onClick={() =>
//               navigate(
//                 '/assets/new',
//               )
//             }
//             className="
//               inline-flex
//               items-center
//               gap-2
//               rounded-2xl
//               border
//               border-cyan-500/30
//               bg-cyan-500/20
//               px-5
//               py-3
//               font-bold
//               text-cyan-400
//               transition
//               hover:bg-cyan-500/30
//             "
//           >
//             <Plus size={18} />
//             Novo Ativo
//           </button>
//         </div>

//         {/* BUSCA */}
//         <div
//           className="
//             mb-6
//             rounded-2xl
//             border
//             border-white/5
//             bg-slate-900/60
//             p-4
//           "
//         >
//           <input
//             type="text"
//             placeholder="Buscar hostname, fabricante ou modelo..."
//             value={search}
//             onChange={(e) =>
//               setSearch(
//                 e.target.value,
//               )
//             }
//             className="
//               w-full
//               rounded-xl
//               border
//               border-slate-700
//               bg-slate-950
//               px-4
//               py-3
//               text-white
//               outline-none
//               placeholder:text-slate-500
//               focus:border-cyan-500
//             "
//           />
//         </div>

//         {/* LISTA */}
//         <div
//           className="
//             overflow-hidden
//             rounded-3xl
//             border
//             border-white/5
//             bg-slate-900/40
//           "
//         >
//           {filteredAssets.length ===
//           0 ? (
//             <div className="p-10 text-center text-slate-500">
//               Nenhum ativo
//               encontrado
//             </div>
//           ) : (
//             filteredAssets.map(
//               (asset) => {
//                 const isOpen =
//                   selectedAssetId ===
//                   asset.id;

//                 return (
//                   <div
//                     key={asset.id}
//                     className="
//                       border-b
//                       border-white/5
//                       last:border-none
//                     "
//                   >
//                     {/* LINHA */}
//                     <button
//                       onClick={() =>
//                         setSelectedAssetId(
//                           isOpen
//                             ? null
//                             : asset.id,
//                         )
//                       }
//                       className="
//                         w-full
//                         px-6
//                         py-5
//                         text-left
//                         transition
//                         hover:bg-white/5
//                       "
//                     >
//                       <div className="flex items-center justify-between gap-4">
//                         {/* ESQUERDA */}
//                         <div className="flex items-center gap-5">
//                           {/* ÍCONE */}
//                           <div
//                             className="
//                               flex
//                               h-14
//                               w-14
//                               items-center
//                               justify-center
//                               rounded-2xl
//                               bg-cyan-500/20
//                               text-cyan-400
//                             "
//                           >
//                             {getAssetIcon(
//                               asset.tipo,
//                             )}
//                           </div>

//                           {/* DADOS */}
//                           <div>
//                             <div className="text-lg font-bold text-white">
//                               {asset.hostname ||
//                                 '-'}
//                             </div>

//                             <div className="mt-1 flex flex-wrap gap-2">
//                               <span
//                                 className="
//                                   rounded-lg
//                                   bg-violet-500/20
//                                   px-2
//                                   py-1
//                                   text-xs
//                                   font-semibold
//                                   text-violet-400
//                                 "
//                               >
//                                 {asset.tipo ||
//                                   '-'}
//                               </span>

//                               <span className="text-sm text-slate-400">
//                                 {asset.fabricante ||
//                                   '-'}{' '}
//                                 {asset.modelo ||
//                                   ''}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* DIREITA */}
//                         <div className="flex items-center gap-5">
//                           {/* STATUS */}
//                           <div
//                             className={`
//                               rounded-xl
//                               px-3
//                               py-2
//                               text-xs
//                               font-bold
//                               ${
//                                 asset.status ===
//                                 'ATIVO'
//                                   ? 'bg-emerald-500/20 text-emerald-400'
//                                   : 'bg-red-500/20 text-red-400'
//                               }
//                             `}
//                           >
//                             {asset.status ||
//                               '-'}
//                           </div>

//                           {isOpen ? (
//                             <ChevronUp className="text-slate-400" />
//                           ) : (
//                             <ChevronDown className="text-slate-400" />
//                           )}
//                         </div>
//                       </div>
//                     </button>

//                     {/* AÇÕES */}
//                     {isOpen && (
//                       <div
//                         className="
//                           border-t
//                           border-white/5
//                           bg-black/20
//                           px-6
//                           py-5
//                         "
//                       >
//                         {/* INFO */}
//                         <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
//                           <InfoCard
//                             label="IP"
//                             value={
//                               asset.ipRede
//                             }
//                           />

//                           <InfoCard
//                             label="Sistema"
//                             value={
//                               asset.sistOper
//                             }
//                           />

//                           <InfoCard
//                             label="Fabricante"
//                             value={`${asset.fabricante || '-'} ${asset.modelo || ''}`}
//                           />
//                         </div>

//                         {/* BOTÕES */}
//                         <div className="flex flex-wrap gap-3">
//                           {/* DETALHES */}
//                           <button
//                             onClick={() =>
//                               navigate(
//                                 `/assets/${asset.id}`,
//                               )
//                             }
//                             className="
//                               inline-flex
//                               items-center
//                               gap-2
//                               rounded-xl
//                               border
//                               border-emerald-500/30
//                               bg-emerald-500/20
//                               px-4
//                               py-2
//                               text-sm
//                               font-bold
//                               text-emerald-400
//                               transition
//                               hover:bg-emerald-500/30
//                             "
//                           >
//                             <Eye
//                               size={16}
//                             />
//                             Detalhes
//                           </button>

//                           {/* EDITAR */}
//                           <button
//                             onClick={() =>
//                               navigate(
//                                 `/assets/${asset.id}/edit`,
//                               )
//                             }
//                             className="
//                               inline-flex
//                               items-center
//                               gap-2
//                               rounded-xl
//                               border
//                               border-blue-500/30
//                               bg-blue-500/20
//                               px-4
//                               py-2
//                               text-sm
//                               font-bold
//                               text-blue-400
//                               transition
//                               hover:bg-blue-500/30
//                             "
//                           >
//                             <Pencil
//                               size={16}
//                             />
//                             Editar
//                           </button>

//                           {/* EXCLUIR */}
//                           <button
//                             onClick={() =>
//                               handleDelete(
//                                 asset.id,
//                               )
//                             }
//                             className="
//                               inline-flex
//                               items-center
//                               gap-2
//                               rounded-xl
//                               border
//                               border-red-500/30
//                               bg-red-500/20
//                               px-4
//                               py-2
//                               text-sm
//                               font-bold
//                               text-red-400
//                               transition
//                               hover:bg-red-500/30
//                             "
//                           >
//                             <Trash2
//                               size={16}
//                             />
//                             Excluir
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               },
//             )
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// function InfoCard({
//   label,
//   value,
// }: any) {
//   return (
//     <div
//       className="
//         rounded-2xl
//         border
//         border-white/5
//         bg-slate-950/70
//         p-4
//       "
//     >
//       <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
//         {label}
//       </div>

//       <div className="font-semibold text-white">
//         {value || '-'}
//       </div>
//     </div>
//   );
// }