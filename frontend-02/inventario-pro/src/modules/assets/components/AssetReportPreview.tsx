import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, CheckSquare, Square, Filter, ChevronDown } from 'lucide-react';
import type { Asset } from '../types/asset.types';
import { AVAILABLE_FIELDS } from './AssetReportFieldsModal';

interface ReportPreviewProps {
  filteredAssets: Asset[];
  selectedFields: string[];
  onBack: () => void;
}

const MASTER_TYPES = ['DESKTOP', 'LAPTOP', 'MONITOR', 'STORAGE', 'ROTEADOR', 'SERVIDOR_FISICO', 'SERVIDOR_VIRTUAL', 'SWITCH'];
const MASTER_STATUS = ['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'DESCARTADO'];

const normalizeType = (typeString: string | undefined): string => {
  if (!typeString) return '';
  return typeString
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace('(VM)', '')
    .replace(/[^A-Z0-9_]/g, '')
    .trim();
};

const formatLabel = (text: string) => {
  if (!text) return '-';
  const clean = text.toUpperCase().replace(/_/g, ' ');
  if (clean.includes('VIRTUAL') || clean.includes('VM')) return 'Servidor Virtual (VM)';
  if (clean.includes('FISICO')) return 'Servidor Físico';
  
  return text
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace('MANUTENCAO', 'MANUTENÇÃO')
    .replace('DISPONIVEL', 'DISPONÍVEL')
    .replace('DESKTOP', 'Desktop')
    .replace('LAPTOP', 'Laptop')
    .replace('MONITOR', 'Monitor')
    .replace('STORAGE', 'Storage')
    .replace('ROTEADOR', 'Roteador')
    .replace('SWITCH', 'Switch');
};

export default function AssetReportPreview({ filteredAssets, selectedFields, onBack }: ReportPreviewProps) {
  const activeFields = AVAILABLE_FIELDS.filter(f => f.key !== 'id' && selectedFields.includes(f.key));
  const suggestedName = `relatorio_ativos_${new Date().toISOString().slice(0, 10)}`;

  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>(
    filteredAssets.map(asset => Number(asset.id))
  );

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const uniqueTypesInData = Array.from(
    new Set(filteredAssets.map(a => normalizeType(a.tipo)).filter(Boolean))
  ).filter(t => MASTER_TYPES.includes(t) || t.includes('SERVIDOR')) as string[];

  const uniqueStatusInData = Array.from(
    new Set(filteredAssets.map(a => a.status?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')).filter(Boolean))
  ).filter(s => MASTER_STATUS.includes(s)) as string[];

  const [typeFilters, setTypeFilters] = useState<string[]>(uniqueTypesInData);
  const [statusFilters, setStatusFilters] = useState<string[]>(uniqueStatusInData);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTypeFilters(uniqueTypesInData);
    setStatusFilters(uniqueStatusInData);
  }, [filteredAssets]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleScrollOutside(event: Event) {
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return;
      }
      setActiveDropdown(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOutside, true);
    window.addEventListener('resize', () => setActiveDropdown(null));
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOutside, true);
      window.removeEventListener('resize', () => setActiveDropdown(null));
    };
  }, [uniqueTypesInData, uniqueStatusInData]);

  const handleHeaderClick = (e: React.MouseEvent<HTMLDivElement>, key: string) => {
    e.stopPropagation();
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownEstimatedHeight = 210; 
      const spaceBelow = window.innerHeight - rect.bottom;
      let topPosition = rect.bottom + window.scrollY + 4;
      if (spaceBelow < dropdownEstimatedHeight && rect.top > dropdownEstimatedHeight) {
        topPosition = rect.top + window.scrollY - dropdownEstimatedHeight - 4;
      }
      setDropdownStyle({
        position: 'fixed',
        top: topPosition,
        left: rect.left + window.scrollX,
      });
      setActiveDropdown(key);
    }
  };

  const dataFilteredByColumns = filteredAssets.filter(asset => {
    const normType = normalizeType(asset.tipo);
    const normStatus = asset.status?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
    const matchesType = !asset.tipo || typeFilters.includes(normType) || typeFilters.some(t => normType.includes(t));
    const matchesStatus = !asset.status || statusFilters.includes(normStatus);
    return matchesType && matchesStatus;
  });

  // 🛠️ MAPEAMENTO MESTRE E FLEXÍVEL DO HOSTNAME PAI (Detecta objetos ou IDs em qualquer padrão)
  const getParentHostname = (vm: any): string => {
    // 1. Verifica se existe o objeto completo do pai injetado (Ex: vm.servidorPai.hostname)
    const parentObj = vm.servidorPai || vm.servidor_pai || vm.host || vm.parent;
    if (parentObj && parentObj.hostname) {
      return parentObj.hostname;
    }

    // 2. Coleta possíveis chaves de ID do pai no modelo de dados
    const pId = vm.servidorPaiId || vm.servidor_pai_id || vm.hostId || vm.host_id || vm.parentId || vm.parent_id;
    if (!pId) return '';
    
    // 3. Varre a lista completa para achar o Servidor Físico correspondente
    const parent = filteredAssets.find(a => 
      a.id?.toString().trim() === pId.toString().trim()
    );
    return parent ? (parent.hostname || 'Servidor Desconhecido') : '';
  };

  // Organiza de forma hierárquica baseada no mapeamento flexível
  const buildHierarchicalList = (assets: Asset[]): Asset[] => {
    const physicalServers = assets.filter(a => normalizeType(a.tipo).includes('SERVIDOR_FISICO'));
    const virtualMachines = assets.filter(a => normalizeType(a.tipo).includes('SERVIDOR_VIRTUAL'));
    const remainingAssets = assets.filter(a => !normalizeType(a.tipo).includes('SERVIDOR_FISICO') && !normalizeType(a.tipo).includes('SERVIDOR_VIRTUAL'));
    
    const orderedList: Asset[] = [];

    physicalServers.forEach(server => {
      orderedList.push(server);
      
      // Vincula a VM ao Servidor Físico comparando os IDs ou o hostname do objeto pai detectado
      const childrenVm = virtualMachines.filter((vm: any) => {
        const pObj = vm.servidorPai || vm.servidor_pai || vm.host || vm.parent;
        if (pObj && pObj.id) {
          return pObj.id.toString().trim() === server.id?.toString().trim();
        }
        
        const pId = vm.servidorPaiId || vm.servidor_pai_id || vm.hostId || vm.host_id || vm.parentId || vm.parent_id;
        return pId && pId.toString().trim() === server.id?.toString().trim();
      });
      
      orderedList.push(...childrenVm);
    });

    const orphanVms = virtualMachines.filter((vm: any) => 
      !orderedList.some(ordered => ordered.id?.toString().trim() === vm.id?.toString().trim())
    );

    return [...orderedList, ...orphanVms, ...remainingAssets];
  };

  const finalHierarchicalViewList = buildHierarchicalList(dataFilteredByColumns);
  const assetsToInclude = finalHierarchicalViewList.filter(asset => selectedAssetIds.includes(Number(asset.id)));

  const handleToggleAsset = (id: number) => {
    setSelectedAssetIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const visibleAndSelected = finalHierarchicalViewList.filter(a => selectedAssetIds.includes(Number(a.id)));
  const allVisibleSelected = visibleAndSelected.length === finalHierarchicalViewList.length;

  const handleToggleAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = finalHierarchicalViewList.map(a => Number(a.id));
      setSelectedAssetIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const visibleIds = finalHierarchicalViewList.map(a => Number(a.id));
      setSelectedAssetIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };
  const toggleAllTypes = () => {
    setTypeFilters(typeFilters.length === uniqueTypesInData.length ? [] : uniqueTypesInData);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };
  const toggleAllStatus = () => {
    setStatusFilters(statusFilters.length === uniqueStatusInData.length ? [] : uniqueStatusInData);
  };

  const generateHTMLTable = () => {
    const tableHeaders = activeFields.map(f => `<th style="border:1px solid #cbd5e1;padding:10px;background-color:#f8fafc;text-align:left;font-family:sans-serif;font-size:11px;font-weight:bold;color:#1e293b;">${f.label}</th>`).join('');
    const tableRows = assetsToInclude.map((asset: any) => {
      const isVm = normalizeType(asset.tipo).includes('SERVIDOR_VIRTUAL');
      
      const cells = activeFields.map((f) => {
        let displayVal = '';

        if (f.key === 'hostname') {
          if (isVm) {
            const pHost = getParentHostname(asset);
            const currentHost = asset.hostname || '-';
            displayVal = pHost 
              ? `<span style="color:#475569;font-weight:bold;">${pHost}</span> <span style="color:#0284c7;font-weight:bold;">&gt; ${currentHost}</span>`
              : `<span style="color:#0284c7;font-weight:bold;">${currentHost}</span>`;
          } else {
            displayVal = `<span style="color:#0f172a;font-weight:bold;">${asset.hostname || '-'}</span>`;
          }
        } else {
          const val = f.key === 'tipo' || f.key === 'status' ? formatLabel(asset[f.key]) : asset[f.key];
          displayVal = String(val || '-');
        }
        
        return `<td style="border:1px solid #e2e8f0;padding:8px;font-family:sans-serif;font-size:11px;color:#334155;word-break:break-word;${isVm ? 'background-color:#f8fafc;' : ''}">${displayVal}</td>`;
      }).join('');
      
      return `<tr style="page-break-inside:avoid;">${cells}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Ativos</title>
        <style>
          @page { size: A4 landscape; margin: 12mm 10mm; }
          body { font-family: sans-serif; margin: 0; padding: 10px; color: #192229; background-color: #ffffff; }
          h2 { margin: 0 0 4px 0; font-size: 20px; text-transform: uppercase; letter-spacing: -0.5px; }
          p { font-size: 11px; color: #64748b; margin: 0 0 20px 0; }
          table { border-collapse: collapse; width: 100%; table-layout: fixed; }
        </style>
      </head>
      <body>
        <h2>Relatório de Ativos Físicos e Virtuais</h2>
        <p>Gerado em: ${new Date().toLocaleString()} | Itens Incluídos: ${assetsToInclude.length}</p>
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `;
  };

  const exportReport = async (format: 'csv' | 'print' | 'html') => {
    if (assetsToInclude.length === 0) {
      alert('Por favor, selecione ou filtre ao menos um ativo marcado para exportação.');
      return;
    }

    if (format === 'csv') {
      const headerRow = activeFields.map(f => `"${f.label}"`).join(';');
      const dataRows = assetsToInclude.map((asset: any) => {
        const isVm = normalizeType(asset.tipo).includes('SERVIDOR_VIRTUAL');
        return activeFields.map((f) => {
          let val = '';
          if (f.key === 'hostname' && isVm) {
            const pHost = getParentHostname(asset);
            val = pHost ? `${pHost} > ${asset.hostname || '-'}` : (asset.hostname || '-');
          } else {
            val = f.key === 'tipo' || f.key === 'status' ? formatLabel(asset[f.key]) : asset[f.key];
          }
          return `"${String(val || '-').replace(/"/g, '""')}"`;
        }).join(';');
      });
      const csvContent = 'sep=;\n\uFEFF' + [headerRow, ...dataRows].join('\n');
      downloadBlob(csvContent, `${suggestedName}.csv`, 'text/csv;charset=utf-8;');
    } else if (format === 'html') {
      downloadBlob(generateHTMLTable(), `${suggestedName}.html`, 'text/html;charset=utf-8;');
    } else if (format === 'print') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generateHTMLTable());
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
      }
    }
  };

  const downloadBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070a13] text-slate-100 p-8 overflow-hidden min-h-0">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col space-y-5 min-h-0">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition cursor-pointer bg-transparent border-0 flex-shrink-0">
          <ArrowLeft size={16} /> Alterar colunas selecionadas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Visualização</h1>
            <p className="text-xs text-slate-400">
              Exportando <span className="text-cyan-400 font-bold">{assetsToInclude.length}</span> ativos selecionados e mapeados hierarquicamente.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportReport('csv')} disabled={assetsToInclude.length === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-xs font-black uppercase tracking-wide transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              <Download size={13} /> Planilha (CSV)
            </button>
            <button onClick={() => exportReport('print')} disabled={assetsToInclude.length === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-xs font-black uppercase tracking-wide transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              <Download size={13} /> Imprimir / PDF
            </button>
            <button onClick={() => exportReport('html')} disabled={assetsToInclude.length === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white text-xs font-black uppercase tracking-wide transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              <Download size={13} /> Baixar HTML
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#090d1a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-0 relative">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-[#0b1120] border-b border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-wider sticky top-0 z-10 select-none">
                  <th onClick={handleToggleAllVisible} className="px-4 py-3 w-14 text-center cursor-pointer hover:bg-slate-800/50 transition text-cyan-400">
                    {allVisibleSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-500" />}
                  </th>

                  {activeFields.map((field) => {
                    const isType = field.key === 'tipo';
                    const isStatus = field.key === 'status';
                    const hasFilter = isType || isStatus;

                    return (
                      <th key={field.key} className="px-4 py-3">
                        {hasFilter ? (
                          <div 
                            onClick={(e) => handleHeaderClick(e, field.key)}
                            className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white transition group w-fit"
                          >
                            <span>{field.label}</span>
                            <Filter size={11} className={`transition ${isType ? (typeFilters.length !== uniqueTypesInData.length ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300') : (statusFilters.length !== uniqueStatusInData.length ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300')}`} />
                            <ChevronDown size={11} className="text-slate-500" />
                          </div>
                        ) : (
                          <span>{field.label}</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
                {finalHierarchicalViewList.map((asset) => {
                  const assetId = Number(asset.id);
                  const isAssetMarked = selectedAssetIds.includes(assetId);
                  const isVm = normalizeType(asset.tipo).includes('SERVIDOR_VIRTUAL');
                  const parentHostname = getParentHostname(asset);

                  return (
                    <tr 
                      key={assetId} 
                      onClick={() => handleToggleAsset(assetId)}
                      className={`transition cursor-pointer ${
                        isAssetMarked 
                          ? isVm ? 'bg-sky-950/10 hover:bg-sky-900/20' : 'hover:bg-[#0c1324]/50' 
                          : 'opacity-30 bg-slate-950/10 hover:opacity-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-center w-14 select-none">
                        {isAssetMarked ? <CheckSquare size={15} className="text-cyan-400 inline" /> : <Square size={15} className="text-slate-600 inline" />}
                      </td>
                      
                      {activeFields.map((field) => (
                        <td key={field.key} className="px-4 py-3 font-medium truncate max-w-xs">
                          {field.key === 'hostname' ? (
                            isVm ? (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 mr-0.5">↳</span>
                                <span className="text-white font-semibold">
                                  {parentHostname || 'Orfã'}
                                </span>
                                <span className="text-slate-500 font-normal">&gt;</span>
                                <span className="text-cyan-400 font-bold">
                                  {asset.hostname || '-'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-white font-bold">{asset.hostname || '-'}</span>
                            )
                          ) : (
                            field.key === 'tipo' || field.key === 'status' ? formatLabel(asset[field.key]) : String((asset as any)[field.key] || '-')
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {finalHierarchicalViewList.length === 0 && (
                  <tr>
                    <td colSpan={activeFields.length + 1} className="text-center py-12 text-slate-500 font-medium">
                      Nenhum ativo corresponde aos filtros selecionados nas colunas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DROPDOWN FLUTUANTE (FIXED) */}
      {activeDropdown && (
        <div 
          ref={dropdownRef} 
          style={dropdownStyle}
          className="w-48 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-2 z-[9999] text-xs font-medium text-slate-200 flex flex-col h-[210px]"
        >
          {activeDropdown === 'tipo' && (
            <>
              <button onClick={toggleAllTypes} className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition font-bold text-cyan-400 bg-transparent border-0 cursor-pointer flex-shrink-0">
                {typeFilters.length === uniqueTypesInData.length ? <CheckSquare size={14} /> : <Square size={14} />} 
                Escolher Todos
              </button>
              <div className="border-t border-slate-800 my-1 flex-shrink-0" />
              <div className="overflow-y-auto flex-1 space-y-1 pr-1 border-0">
                {uniqueTypesInData.map(t => (
                  <button key={t} onClick={() => toggleTypeFilter(t)} className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 transition bg-transparent border-0 text-slate-300 cursor-pointer">
                    {typeFilters.includes(t) ? <CheckSquare size={13} className="text-cyan-500" /> : <Square size={13} />} 
                    {formatLabel(t)}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeDropdown === 'status' && (
            <>
              <button onClick={toggleAllStatus} className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition font-bold text-cyan-400 bg-transparent border-0 cursor-pointer flex-shrink-0">
                {statusFilters.length === uniqueStatusInData.length ? <CheckSquare size={14} /> : <Square size={14} />} 
                Escolher Todos
              </button>
              <div className="border-t border-slate-800 my-1 flex-shrink-0" />
              <div className="overflow-y-auto flex-1 space-y-1 pr-1 border-0">
                {uniqueStatusInData.map(s => (
                  <button key={s} onClick={() => toggleStatusFilter(s)} className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 transition bg-transparent border-0 text-slate-300 cursor-pointer">
                    {statusFilters.includes(s) ? <CheckSquare size={13} className="text-cyan-500" /> : <Square size={13} />} 
                    {formatLabel(s)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}