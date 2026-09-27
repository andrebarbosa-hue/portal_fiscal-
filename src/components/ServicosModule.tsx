import React, { useState, useMemo, useEffect } from 'react';
import { ServicoFiscal, ItemNBS } from '../types/fiscal';
import { matchesQuery } from '../utils/searchUtils';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Eye, 
  Copy, 
  Check, 
  FileSpreadsheet
} from 'lucide-react';

interface ServicosModuleProps {
  servicos: ServicoFiscal[];
  nbsList: ItemNBS[];
  onOpenDetail: (servico: ServicoFiscal) => void;
  onAddServico: (servico: Omit<ServicoFiscal, 'id'>) => void;
  onUpdateServico: (id: string, updated: Partial<ServicoFiscal>) => void;
  onOpenExcelPaste: () => void;
  onBulkUpdateServicos: (servicos: ServicoFiscal[]) => void;
}

export const ServicosModule: React.FC<ServicosModuleProps> = ({
  servicos,
  nbsList,
  onOpenDetail,
  onAddServico,
  onUpdateServico,
  onOpenExcelPaste,
  onBulkUpdateServicos
}) => {
  const { isAdmin, requireAdminAction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // New service modal state
  const [newDescricao, setNewDescricao] = useState('');
  const [newCodigoNovo, setNewCodigoNovo] = useState('');
  const [newCodigoAntigo, setNewCodigoAntigo] = useState('');
  const [newItemLC116, setNewItemLC116] = useState('01.01');
  const [newNbs, setNewNbs] = useState('1.1502.20.00');
  const [newAliquota, setNewAliquota] = useState(2.0);
  const [newRetencao, setNewRetencao] = useState<'Sim' | 'Não' | 'Depende do Local'>('Não');
  const [newLocal, setNewLocal] = useState<'Local do Prestador' | 'Local do Tomador (Art. 3º)' | 'Local da Execução'>('Local do Prestador');
  const [newDeducao, setNewDeducao] = useState(false);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredServicos = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return servicos;
    return servicos.filter(item => {
      return (
        matchesQuery(item.descricao, term) ||
        matchesQuery(item.codigoNovo, term) ||
        matchesQuery(item.codigoAntigo, term) ||
        matchesQuery(item.itemLC116, term) ||
        matchesQuery(item.nbs, term)
      );
    });
  }, [servicos, searchTerm]);

  const totalPages = Math.ceil(filteredServicos.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServicos.slice(start, start + pageSize);
  }, [filteredServicos, currentPage, pageSize]);

  const handleCopyNBS = (nbs: string, id: string) => {
    navigator.clipboard.writeText(nbs);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddServico({
      codigoAntigo: newCodigoAntigo || 'N/A',
      codigoNovo: newCodigoNovo,
      itemLC116: newItemLC116,
      descricao: newDescricao,
      nbs: newNbs,
      aliquotaSugerida: Number(newAliquota),
      retencaoISS: newRetencao,
      localIncidencia: newLocal,
      permiteDeducao: newDeducao,
      baseLegal: `LC 116/2003 Item ${newItemLC116}`,
      observacao: 'Registro cadastrado via NFSe Fiscal'
    });
    setIsAddModalOpen(false);
    setNewDescricao('');
    setNewCodigoNovo('');
  };

  return (
    <div className="space-y-4">
      {/* Header & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Tabela de Serviços Fiscais
            </h2>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onOpenExcelPaste}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                title="Colar dados do Excel com serviços fiscais"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Colar do Excel</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Serviço</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, código antigo, código novo (DPS), item LC 116 ou NBS..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table & Mobile Cards Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Vertical Cards (Phones in portrait mode) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredServicos.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-400">
              <p className="font-bold text-slate-700 text-sm">
                {servicos.length === 0
                  ? 'Nenhum serviço fiscal gravado no banco de dados'
                  : 'Nenhum serviço encontrado'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tente pesquisar por outros termos ou códigos.
              </p>
            </div>
          ) : (
            paginatedList.map(item => {
              const isCopied = copiedId === item.id;

              return (
                <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                  {/* Top row: Codes & Aliquota */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/80">
                        {item.codigoNovo}
                      </span>
                      {item.codigoAntigo && item.codigoAntigo !== 'N/A' && (
                        <span className="font-mono text-[10px] text-slate-500 font-semibold truncate">
                          Ant: {item.codigoAntigo}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-md border border-red-100/80 shrink-0">
                      {item.aliquotaSugerida}%
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {item.descricao}
                  </p>

                  {/* Bottom bar: NBS Copy button & Detalhes */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      onClick={() => handleCopyNBS(item.nbs, item.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold text-slate-700 bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
                      title="Clique para copiar NBS"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span>NBS: {item.nbs}</span>
                      {isCopied && <span className="text-[10px] text-emerald-600 font-sans font-bold">Copiado!</span>}
                    </button>

                    <button
                      onClick={() => onOpenDetail(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">Cód. Antigo</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[130px]">Cód. Novo (DPS)</th>
                <th className="py-3 px-4 min-w-[300px]">Descrição do Serviço (LC 116)</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">NBS Sugerida</th>
                <th className="py-3 px-4 whitespace-nowrap text-center min-w-[140px]">Alíquota Sugerida</th>
                <th className="py-3 px-4 text-right whitespace-nowrap min-w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredServicos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-slate-700 text-sm">
                      {servicos.length === 0
                        ? 'Nenhum serviço fiscal gravado no banco de dados'
                        : 'Nenhum serviço encontrado'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {servicos.length === 0
                        ? 'Os serviços foram desacoplados do código-fonte e serão armazenados exclusivamente no Cloud Firestore. Aguardando envio da tabela/PDF para gravação.'
                        : 'Tente pesquisar por outros termos ou códigos.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedList.map(item => {
                  const isCopied = copiedId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group align-middle">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-[12px] whitespace-nowrap tracking-tight">
                        {item.codigoAntigo}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[12px] whitespace-nowrap">
                        {item.codigoNovo}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="line-clamp-2" title={item.descricao}>
                          {item.descricao}
                        </div>
                      </td>

                      {/* NBS column - NBS Sugerida limpa e alinhada */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCopyNBS(item.nbs, item.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11.5px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors whitespace-nowrap group/btn cursor-pointer"
                          title="Clique para copiar código NBS"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400 group-hover/btn:text-slate-600" />}
                          <span>{item.nbs}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700 text-center whitespace-nowrap">
                        {item.aliquotaSugerida}%
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter Footer */}
        {filteredServicos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Exibindo <strong>{(currentPage - 1) * pageSize + 1}</strong> a{' '}
                <strong>{Math.min(currentPage * pageSize, filteredServicos.length)}</strong> de{' '}
                <strong>{filteredServicos.length}</strong> serviços
              </span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs text-slate-700 font-medium cursor-pointer"
              >
                <option value={25}>25 por pág.</option>
                <option value={50}>50 por pág.</option>
                <option value={100}>100 por pág.</option>
                <option value={200}>200 por pág.</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-2 font-mono text-slate-600 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Modal Add Service */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Cadastrar Novo Serviço Fiscal</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição do Serviço</label>
                <input
                  type="text"
                  required
                  value={newDescricao}
                  onChange={e => setNewDescricao(e.target.value)}
                  placeholder="Ex: Consultoria em TI e Governança"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código Novo (DPS)</label>
                  <input
                    type="text"
                    required
                    value={newCodigoNovo}
                    onChange={e => setNewCodigoNovo(e.target.value)}
                    placeholder="Ex: 01.06.01.001"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código Antigo Municipal</label>
                  <input
                    type="text"
                    value={newCodigoAntigo}
                    onChange={e => setNewCodigoAntigo(e.target.value)}
                    placeholder="Ex: 106-0/01-70"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Item LC 116</label>
                  <input
                    type="text"
                    required
                    value={newItemLC116}
                    onChange={e => setNewItemLC116(e.target.value)}
                    placeholder="Ex: 01.06"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NBS 2.0 Sugerida</label>
                  <input
                    type="text"
                    required
                    value={newNbs}
                    onChange={e => setNewNbs(e.target.value)}
                    placeholder="Ex: 1.1501.10.00"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alíquota (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="5"
                    value={newAliquota}
                    onChange={e => setNewAliquota(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retenção ISS Tomador</label>
                  <select
                    value={newRetencao}
                    onChange={e => setNewRetencao(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-semibold"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                    <option value="Depende do Local">Depende do Local</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="deducao"
                  checked={newDeducao}
                  onChange={e => setNewDeducao(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="deducao" className="font-bold text-slate-700 cursor-pointer">
                  Permite dedução legal de base de cálculo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
