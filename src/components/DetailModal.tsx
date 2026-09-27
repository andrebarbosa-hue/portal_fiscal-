import React from 'react';
import { X, CheckCircle2, AlertCircle, Copy, Check, Sparkles, Users } from 'lucide-react';
import { ServicoFiscal, PrefeituraNacional } from '../types/fiscal';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ServicoFiscal | PrefeituraNacional | null;
  type: 'servico' | 'prefeitura';
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  data,
  type
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!isOpen || !data) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block">
              {type === 'servico' && 'Ficha do Serviço LC 116'}
              {type === 'prefeitura' && 'Cadastro Municipal & Emissão'}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              {type === 'servico' && (data as ServicoFiscal).descricao}
              {type === 'prefeitura' && `${(data as PrefeituraNacional).cidade} / ${(data as PrefeituraNacional).uf}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs">
          {type === 'servico' && (() => {
            const item = data as ServicoFiscal;
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Item LC 116</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{item.itemLC116}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Código Novo (DPS)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{item.codigoNovo}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Código Antigo</span>
                    <span className="font-mono text-slate-600">{item.codigoAntigo}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">NBS 2.0 Vinculada</span>
                    <span className="font-mono font-bold text-red-600 text-sm">{item.nbs}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.nbs, 'nbs')}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {copied === 'nbs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    {copied === 'nbs' ? 'Copiado' : 'Copiar NBS'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Alíquota Sugerida</span>
                    <span className="font-bold text-slate-900">{item.aliquotaSugerida}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Retenção ISS Tomador</span>
                    <span className={`font-bold ${item.retencaoISS === 'Sim' ? 'text-red-600' : 'text-slate-700'}`}>
                      {item.retencaoISS}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Local de Incidência (Art. 3º)</span>
                  <span className="font-semibold text-slate-800">{item.localIncidencia}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Dedução de Base de Cálculo</span>
                  <span className="font-semibold text-slate-800">
                    {item.permiteDeducao ? 'Permitida (Materiais incorporados/subempreitadas)' : 'Não permitida'}
                  </span>
                </div>

                <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100 text-slate-700">
                  <span className="text-[10px] text-red-700 font-bold uppercase block mb-1">Fundamentação Legal</span>
                  <p className="leading-relaxed text-slate-700">{item.baseLegal}</p>
                  {item.observacao && (
                    <p className="mt-2 text-slate-600 italic border-t border-red-100/80 pt-1.5">{item.observacao}</p>
                  )}
                </div>
              </>
            );
          })()}

          {type === 'prefeitura' && (() => {
            const pref = data as PrefeituraNacional;
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Município / UF</span>
                    <span className="font-bold text-slate-900 text-sm">{pref.cidade} / {pref.uf}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Região</span>
                    <span className="font-bold text-slate-800 text-sm">{pref.regiao || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Status Geral</span>
                    <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                      pref.status === 'Apta' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {pref.status === 'Apta' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {pref.status}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">CNPJ da Prefeitura</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{pref.cnpj || '—'}</span>
                  </div>
                  {pref.cnpj && (
                    <button
                      onClick={() => handleCopy(pref.cnpj, 'cnpj')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {copied === 'cnpj' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      {copied === 'cnpj' ? 'Copiado' : 'Copiar CNPJ'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Tipo de Emissor</span>
                    <span className="font-semibold text-slate-800">{pref.emissor}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">População Estimada</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {pref.populacao ? `${pref.populacao} habitantes` : 'Não informada'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Provedor / Sistema</span>
                  <span className="font-semibold text-slate-800">{pref.provedor || 'Ambiente Nacional'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Regra de Integração</span>
                  <p className="text-slate-600 leading-relaxed">
                    {pref.status === 'Apta'
                      ? 'Este município está ativo e conveniado junto ao Sistema Nacional de NFS-e (SEFIN / Receita Federal), permitindo a transmissão de DPS / NFS-e Nacional.'
                      : 'Município em fase de adequação cadastral ou webservice municipal legado.'}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 pt-3 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
