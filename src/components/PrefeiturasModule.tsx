import React, { useState, useMemo } from 'react';
import { PrefeituraNacional } from '../types/fiscal';
import { allStatesUF } from '../data/prefeiturasData';
import { matchesQuery } from '../utils/searchUtils';
import { useAuth } from '../context/AuthContext';
import { Search, Building2, CheckCircle2, AlertCircle, Plus, Eye, Check, Copy, FileSpreadsheet, Lock, Users } from 'lucide-react';

interface PrefeiturasModuleProps {
  prefeituras: PrefeituraNacional[];
  onOpenDetail: (prefeitura: PrefeituraNacional) => void;
  onAddPrefeitura: (pref: Omit<PrefeituraNacional, 'id'>) => void;
  onClearPrefeituras?: () => void;
  onOpenExcelPaste: () => void;
}

export const PrefeiturasModule: React.FC<PrefeiturasModuleProps> = ({
  prefeituras,
  onOpenDetail,
  onAddPrefeitura,
  onOpenExcelPaste
}) => {
  const { isAdmin, requireAdminAction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegiao, setSelectedRegiao] = useState('TODAS');
  const [selectedUf, setSelectedUf] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Apta' | 'Em Adequação' | 'Não Aderiu'>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // New municipality form state
  const [newCidade, setNewCidade] = useState('');
  const [newUf, setNewUf] = useState('DF');
  const [newRegiao, setNewRegiao] = useState('Centro-Oeste');
  const [newCnpj, setNewCnpj] = useState('');
  const [newIbge, setNewIbge] = useState('');
  const [newPopulacao, setNewPopulacao] = useState('');
  const [newStatus, setNewStatus] = useState<'Apta' | 'Em Adequação' | 'Não Aderiu'>('Apta');
  const [newEmissor, setNewEmissor] = useState<'Padrão Nacional' | 'Webservice Municipal'>('Padrão Nacional');

  const regioes = ['TODAS', 'Centro-Oeste', 'Sudeste', 'Sul', 'Nordeste', 'Norte'];

  const filteredPrefeituras = useMemo(() => {
    const term = searchTerm.trim();
    return prefeituras.filter(p => {
      const matchSearch =
        !term ||
        matchesQuery(p.cidade, term) ||
        matchesQuery(p.cnpj, term) ||
        (p.populacao && matchesQuery(p.populacao, term)) ||
        (p.codigoIbge && matchesQuery(p.codigoIbge, term)) ||
        (p.regiao && matchesQuery(p.regiao, term)) ||
        matchesQuery(p.uf, term);

      const matchRegiao = selectedRegiao === 'TODAS' || p.regiao === selectedRegiao;
      const matchUf = selectedUf === 'TODOS' || p.uf === selectedUf;
      const matchStatus = statusFilter === 'todos' || p.status === statusFilter;

      return matchSearch && matchRegiao && matchUf && matchStatus;
    });
  }, [prefeituras, searchTerm, selectedRegiao, selectedUf, statusFilter]);

  const totalPages = Math.ceil(filteredPrefeituras.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPrefeituras.slice(start, start + pageSize);
  }, [filteredPrefeituras, currentPage, pageSize]);

  const handleCopy = (cnpj: string, id: string) => {
    navigator.clipboard.writeText(cnpj);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPrefeitura({
      cidade: newCidade.toUpperCase().trim(),
      uf: newUf,
      regiao: newRegiao,
      cnpj: newCnpj.trim(),
      codigoIbge: newIbge.trim(),
      statusConvenioSEFIN: 'Conveniado Ativo',
      aderenteAmbienteNacional: 'Sim',
      aderenteEmissorNacional: 'Não',
      aderenteMAN: 'Não',
      ativoNaBase: 'Sim',
      ativoUltimoPeriodo: 'Sim',
      populacao: newPopulacao.trim(),
      status: newStatus,
      emissor: newEmissor,
      provedor: newEmissor === 'Padrão Nacional' ? 'Ambiente Nacional (API/DPS)' : 'Webservice Municipal'
    });
    setIsAddModalOpen(false);
    setNewCidade('');
    setNewCnpj('');
    setNewIbge('');
    setNewPopulacao('');
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Padrão Nacional
              </h2>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onOpenExcelPaste}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 relative group"
                title="Colar planilha completa do Excel de prefeituras"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Colar do Excel</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                title="Adicionar município ao Padrão Nacional"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Cidade</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por Cidade, CNPJ ou UF..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 bg-slate-50/50"
            />
          </div>

          {/* UF State Select */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-bold text-slate-400">UF:</span>
            <select
              value={selectedUf}
              onChange={e => {
                setSelectedUf(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none font-bold text-slate-800 cursor-pointer"
            >
              {allStatesUF.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-bold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none font-bold text-slate-800 cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="Apta">Somente Aptas (Padrão Nacional)</option>
              <option value="Em Adequação">Em Adequação / Webservice</option>
              <option value="Não Aderiu">Não Aderiu</option>
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

      {/* Table of Prefeituras */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap min-w-[60px]">UF</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[200px]">Município</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[160px]">CNPJ</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[130px]">Aptidão</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[120px]">População</th>
                <th className="py-3 px-3 text-right whitespace-nowrap min-w-[90px]">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">Nenhum município encontrado com os filtros atuais</p>
                    <p className="text-[11px] text-slate-400 mt-1">Experimente mudar o filtro de UF ou clique em "Colar do Excel" para importar sua tabela oficial.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map(item => {
                  const isCopied = copiedId === item.id;
                  const isApta = item.status === 'Apta';
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors align-middle">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded">
                          {item.uf}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.cidade}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => handleCopy(item.cnpj, item.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 hover:text-red-600 transition-colors whitespace-nowrap"
                          title="Clique para copiar CNPJ"
                        >
                          <span>{item.cnpj || '—'}</span>
                          {item.cnpj && (isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />)}
                        </button>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border whitespace-nowrap ${
                          isApta
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isApta ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.populacao ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60 font-semibold">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{item.populacao} hab.</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
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

        {/* Pagination bar */}
        {filteredPrefeituras.length > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              Mostrando <strong>{((currentPage - 1) * pageSize) + 1}</strong> até <strong>{Math.min(currentPage * pageSize, filteredPrefeituras.length)}</strong> de <strong>{filteredPrefeituras.length}</strong> municípios
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100"
                >
                  Anterior
                </button>
                <span className="px-2 font-mono text-slate-600 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Add Municipality */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Cadastrar Novo Município</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nome do Município</label>
                  <input
                    type="text"
                    required
                    value={newCidade}
                    onChange={e => setNewCidade(e.target.value)}
                    placeholder="Ex: BRASILIA"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">UF</label>
                  <select
                    value={newUf}
                    onChange={e => {
                      const u = e.target.value;
                      setNewUf(u);
                      if (['DF', 'GO', 'MT', 'MS'].includes(u)) setNewRegiao('Centro-Oeste');
                      else if (['SP', 'RJ', 'MG', 'ES'].includes(u)) setNewRegiao('Sudeste');
                      else if (['PR', 'SC', 'RS'].includes(u)) setNewRegiao('Sul');
                      else if (['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'PI', 'AL', 'SE'].includes(u)) setNewRegiao('Nordeste');
                      else if (['AM', 'PA', 'RO', 'TO', 'AC', 'AP', 'RR'].includes(u)) setNewRegiao('Norte');
                    }}
                    className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50 font-bold"
                  >
                    {allStatesUF.filter(u => u !== 'TODOS').map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Região</label>
                  <select
                    value={newRegiao}
                    onChange={e => setNewRegiao(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="Centro-Oeste">Centro-Oeste</option>
                    <option value="Sudeste">Sudeste</option>
                    <option value="Sul">Sul</option>
                    <option value="Nordeste">Nordeste</option>
                    <option value="Norte">Norte</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={newCnpj}
                    onChange={e => setNewCnpj(e.target.value)}
                    placeholder="26.994.533/0001-20"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">População (Habitantes)</label>
                  <input
                    type="text"
                    value={newPopulacao}
                    onChange={e => setNewPopulacao(e.target.value)}
                    placeholder="Ex: 20.763"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código IBGE (Opcional)</label>
                  <input
                    type="text"
                    value={newIbge}
                    onChange={e => setNewIbge(e.target.value)}
                    placeholder="Ex: 2303954"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status de Aptidão</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50 font-medium"
                  >
                    <option value="Apta">Apta (Padrão Nacional)</option>
                    <option value="Em Adequação">Em Adequação / Webservice</option>
                    <option value="Não Aderiu">Não Aderiu</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Emissor</label>
                  <select
                    value={newEmissor}
                    onChange={e => setNewEmissor(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-2 py-2 bg-slate-50 font-medium"
                  >
                    <option value="Padrão Nacional">Padrão Nacional</option>
                    <option value="Webservice Municipal">Webservice Municipal</option>
                  </select>
                </div>
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
                  Salvar Município
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
