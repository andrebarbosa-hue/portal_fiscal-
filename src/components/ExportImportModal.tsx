import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const jsonStr = storageService.exportAllBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal_fiscal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (table: 'servicos' | 'nbs' | 'prefeituras') => {
    let csvContent = '';
    let filename = '';

    if (table === 'servicos') {
      filename = 'servicos_lc116.csv';
      const items = storageService.getServicos();
      csvContent = 'Codigo_Antigo;Codigo_Novo;Item_LC116;Descricao;NBS;Aliquota;Retencao_ISS;Local_Incidencia;Permite_Deducao\n' +
        items.map(i => `"${i.codigoAntigo}";"${i.codigoNovo}";"${i.itemLC116}";"${i.descricao.replace(/"/g, '""')}";"${i.nbs}";"${i.aliquotaSugerida}%";"${i.retencaoISS}";"${i.localIncidencia}";"${i.permiteDeducao ? 'Sim' : 'Não'}"`).join('\n');
    } else if (table === 'nbs') {
      filename = 'catalogo_nbs_aptas.csv';
      const items = storageService.getNbs();
      csvContent = 'Codigo_NBS;Descricao;Capitulo;Nome_Capitulo\n' +
        items.map(i => `"${i.codigo}";"${i.descricao.replace(/"/g, '""')}";"${i.capitulo}";"${i.nomeCapitulo || ''}"`).join('\n');
    } else if (table === 'prefeituras') {
      filename = 'prefeituras_padrao_nacional.csv';
      const items = storageService.getPrefeituras();
      csvContent = 'Cidade;UF;CNPJ;Status;Emissor;Provedor;Codigo_IBGE\n' +
        items.map(i => `"${i.cidade}";"${i.uf}";"${i.cnpj}";"${i.status}";"${i.emissor}";"${i.provedor || ''}";"${i.codigoIbge || ''}"`).join('\n');
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackup(content);
      if (success) {
        setImportStatus('success');
        setStatusMessage('Base de dados restaurada com sucesso!');
        onDataReloaded();
      } else {
        setImportStatus('error');
        setStatusMessage('Arquivo JSON inválido. Verifique a estrutura.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as tabelas para o padrão inicial do sistema? Todas as alterações manuais serão resetadas.')) {
      storageService.resetDefaults();
      setImportStatus('success');
      setStatusMessage('Tabelas redefinidas para o padrão inicial de fábrica!');
      onDataReloaded();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Gerenciador de Dados & Backup</h3>
              <p className="text-[11px] text-slate-400">Exportação e importação de tabelas fiscais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {importStatus !== 'idle' && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
            importStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importStatus === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Export section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1.5">1. Exportar Arquivos de Dados</span>
            <p className="text-slate-500 mb-3 text-[11px]">
              Gere cópias de segurança em JSON ou planilhas CSV compatíveis com Excel.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Backup Completo (JSON)
              </button>
              <button
                onClick={() => handleExportCSV('servicos')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Serviços LC 116 (CSV)
              </button>
              <button
                onClick={() => handleExportCSV('nbs')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Catálogo NBS (CSV)
              </button>
              <button
                onClick={() => handleExportCSV('prefeituras')}
                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Prefeituras Padrão Nacional (CSV)
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">2. Importar / Restaurar Base (JSON)</span>
            <p className="text-slate-500 mb-2.5 text-[11px]">
              Carregue backup completo com todas as tabelas e dados customizados.
            </p>
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-slate-300 hover:border-red-500 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-red-600" />
              <span>Selecionar Arquivo JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset factory section */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Restaurar Padrão de Fábrica do Sistema
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
