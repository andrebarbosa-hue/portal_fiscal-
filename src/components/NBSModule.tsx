import React, { useState, useMemo } from 'react';
import { ItemNBS } from '../types/fiscal';
import { capitulosNBSDict } from '../data/nbsData';
import { matchesQuery } from '../utils/searchUtils';
import { useAuth } from '../context/AuthContext';
import { Search, Copy, Check, BookOpen, Plus, FileSpreadsheet, ShieldCheck, Lock } from 'lucide-react';

interface NBSModuleProps {
  nbsList: ItemNBS[];
  onOpenExcelPaste: () => void;
  onAddNBS: (item: ItemNBS) => void;
}

export const NBSModule: React.FC<NBSModuleProps> = ({ nbsList, onOpenExcelPaste, onAddNBS }) => {
  const { isAdmin, requireAdminAction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCapitulo, setSelectedCapitulo] = useState<string>('todos');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // New NBS form state
  const [newCodigo, setNewCodigo] = useState('');
  const [newDescricao, setNewDescricao] = useState('');
  const [newCapitulo, setNewCapitulo] = useState('15');

  const capitulosArray = useMemo(() => {
    return Object.entries(capitulosNBSDict).map(([num, nome]) => ({
      numero: num,
      nome
    }));
  }, []);

  const filteredNBS = useMemo(() => {
    const term = searchTerm.trim();
    return nbsList.filter(item => {
      const matchSearch =
        !term ||
        matchesQuery(item.codigo, term) ||
        matchesQuery(item.descricao, term) ||
        (item.nomeCapitulo && matchesQuery(item.nomeCapitulo, term));

      const matchCap =
        selectedCapitulo === 'todos' || item.capitulo === selectedCapitulo;

      return matchSearch && matchCap;
    });
  }, [nbsList, searchTerm, selectedCapitulo]);

  const totalPages = Math.ceil(filteredNBS.length / pageSize) || 1;
  const paginatedNBS = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNBS.slice(start, start + pageSize);
  }, [filteredNBS, currentPage, pageSize]);

  const handleCopy = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo || !newDescricao) return;
    onAddNBS({
      codigo: newCodigo.trim(),
      descricao: newDescricao.trim(),
      capitulo: newCapitulo,
      nomeCapitulo: capitulosNBSDict[newCapitulo] || 'Geral',
      statusApta: true
    });
    setIsAddModalOpen(false);
    setNewCodigo('');
    setNewDescricao('');
  };

  return (
    <div className="space-y-4">
      {/* Header & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Catálogo NBS 2.0
            </h2>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onOpenExcelPaste}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                title="Colar planilha do Excel com a lista de NBS"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Colar do Excel</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova NBS</span>
              </button>
            </div>
          )}
        </div>

        {/* Prominent Search Bar & Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por código NBS (ex: 1.1502.20.00) ou descrição da RFB..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 max-w-[280px]">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Capítulo:</span>
            <select
              value={selectedCapitulo}
              onChange={e => {
                setSelectedCapitulo(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none font-bold text-slate-800 cursor-pointer truncate"
            >
              <option value="todos">Todos os Capítulos</option>
              {capitulosArray.map(cap => (
                <option key={cap.numero} value={cap.numero}>
                  Cap. {cap.numero} - {cap.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Page size */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-600">
            <span className="text-[11px] text-slate-400">Exibir:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none font-bold text-slate-800 cursor-pointer"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table & Mobile Cards Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Vertical Cards (Phones in portrait mode) */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedNBS.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-400">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">
                {nbsList.length === 0
                  ? 'Nenhum item da NBS gravado no banco de dados'
                  : 'Nenhum item da NBS corresponde à busca'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {nbsList.length === 0
                  ? 'Importe a tabela oficial através do botão "Colar do Excel".'
                  : 'Limpe o filtro ou busque por termos mais genéricos.'}
              </p>
            </div>
          ) : (
            paginatedNBS.map(item => {
              const isCopied = copiedCode === item.codigo;
              return (
                <div key={item.codigo} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors">
                  {/* Top row: Code and Chapter badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-slate-900 text-sm px-2.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                      {item.codigo}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                      Cap. {item.capitulo} - {capitulosNBSDict[item.capitulo] || item.nomeCapitulo || 'Geral'}
                    </span>
                  </div>

                  {/* RFB Description */}
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {item.descricao}
                  </p>

                  {/* Copy button */}
                  <div className="pt-0.5">
                    <button
                      onClick={() => handleCopy(item.codigo)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      <span>{isCopied ? 'Código NBS Copiado com Sucesso!' : 'Copiar Código NBS'}</span>
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
                <th className="py-3 px-4 whitespace-nowrap min-w-[150px]">Código NBS</th>
                <th className="py-3 px-4 min-w-[320px]">Descrição Oficial da RFB</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[220px]">Capítulo</th>
                <th className="py-3 px-4 text-right whitespace-nowrap min-w-[110px]">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {paginatedNBS.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">
                      {nbsList.length === 0
                        ? 'Nenhum item da NBS gravado no banco de dados'
                        : 'Nenhum item da NBS corresponde à busca'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {nbsList.length === 0
                        ? 'O catálogo da NBS agora é armazenado diretamente no Cloud Firestore. Clique em "Colar do Excel / PDF" para importar a tabela oficial.'
                        : 'Limpe o filtro ou digite palavras-chave mais genéricas.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedNBS.map(item => {
                  const isCopied = copiedCode === item.codigo;
                  return (
                    <tr key={item.codigo} className="hover:bg-slate-50/70 transition-colors group align-middle">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-[13px]">
                          {item.codigo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 leading-relaxed">
                        {item.descricao}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200/60 whitespace-nowrap">
                          Cap. {item.capitulo} - {capitulosNBSDict[item.capitulo] || item.nomeCapitulo || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopy(item.codigo)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredNBS.length > 0 && (
          <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="text-slate-500 font-medium text-[11px]">
              Mostrando <span className="font-bold text-slate-800">{paginatedNBS.length}</span> de <span className="font-bold text-slate-800">{filteredNBS.length}</span> itens da NBS
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-2 font-mono text-slate-600 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Add NBS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Cadastrar Código NBS</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código NBS</label>
                <input
                  type="text"
                  required
                  value={newCodigo}
                  onChange={e => setNewCodigo(e.target.value)}
                  placeholder="Ex: 1.1502.30.00"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição Oficial da Receita Federal</label>
                <textarea
                  rows={3}
                  required
                  value={newDescricao}
                  onChange={e => setNewDescricao(e.target.value)}
                  placeholder="Descrição da atividade conforme NBS 2.0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Capítulo NBS</label>
                <select
                  value={newCapitulo}
                  onChange={e => setNewCapitulo(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-semibold"
                >
                  {capitulosArray.map(cap => (
                    <option key={cap.numero} value={cap.numero}>
                      Cap. {cap.numero} - {cap.nome}
                    </option>
                  ))}
                </select>
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
                  Salvar NBS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
