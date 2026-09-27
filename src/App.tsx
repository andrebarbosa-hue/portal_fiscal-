import React, { useState, useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';
import { ActiveTab, ServicoFiscal, ItemNBS, PrefeituraNacional } from './types/fiscal';
import { storageService } from './services/storageService';
import { firestoreService } from './services/firestoreService';
import { Sidebar } from './components/Sidebar';
import { ServicosModule } from './components/ServicosModule';
import { NBSModule } from './components/NBSModule';
import { PrefeiturasModule } from './components/PrefeiturasModule';
import { DetailModal } from './components/DetailModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ExcelPasteModal } from './components/ExcelPasteModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { useAuth } from './context/AuthContext';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Verifique a conexão do Firebase.');
    }
  }
}

export default function App() {
  const { requireAdminAction } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('servicos');
  
  // Decoupled datasets
  const [servicos, setServicos] = useState<ServicoFiscal[]>([]);
  const [nbsList, setNbsList] = useState<ItemNBS[]>([]);
  const [prefeituras, setPrefeituras] = useState<PrefeituraNacional[]>([]);

  // Modals state
  const [detailItem, setDetailItem] = useState<{
    data: ServicoFiscal | PrefeituraNacional | null;
    type: 'servico' | 'prefeitura';
  }>({ data: null, type: 'servico' });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  
  // Excel paste modal state
  const [isExcelPasteOpen, setIsExcelPasteOpen] = useState(false);
  const [excelTargetType, setExcelTargetType] = useState<'prefeituras' | 'nbs' | 'servicos'>('servicos');

  // Load initial local cached data for 0ms startup
  const loadAllDataFromLocal = () => {
    setServicos(storageService.getServicos());
    setNbsList(storageService.getNbs());
    setPrefeituras(storageService.getPrefeituras());
  };

  useEffect(() => {
    testConnection();
    loadAllDataFromLocal();

    // Sincronização em tempo real com o banco de dados Cloud Firestore
    const unsubPref = firestoreService.subscribePrefeituras((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setPrefeituras(cloudList);
        storageService.savePrefeituras(cloudList);
      }
    });

    const unsubNbs = firestoreService.subscribeNBS((cloudNbs) => {
      if (cloudNbs && cloudNbs.length > 0) {
        setNbsList(cloudNbs);
        storageService.saveNbs(cloudNbs);
      }
    });

    const unsubServicos = firestoreService.subscribeServicos((cloudServicos) => {
      if (cloudServicos && cloudServicos.length > 0) {
        setServicos(cloudServicos);
        storageService.saveServicos(cloudServicos);
      }
    });

    return () => {
      unsubPref();
      unsubNbs();
      unsubServicos();
    };
  }, []);

  const counts = {
    servicos: servicos.length,
    nbs: nbsList.length,
    prefeituras: prefeituras.length
  };

  const handleOpenDetail = (
    data: ServicoFiscal | PrefeituraNacional,
    type: 'servico' | 'prefeitura'
  ) => {
    setDetailItem({ data, type });
    setIsDetailModalOpen(true);
  };

  const handleAddServico = (novo: Omit<ServicoFiscal, 'id'>) => {
    storageService.addServico(novo);
    setServicos(storageService.getServicos());
  };

  const handleUpdateServico = (id: string, updated: Partial<ServicoFiscal>) => {
    storageService.updateServico(id, updated);
    setServicos(storageService.getServicos());
  };

  const handleBulkUpdateServicos = (updatedServicos: ServicoFiscal[]) => {
    storageService.saveServicos(updatedServicos);
    setServicos(storageService.getServicos());
  };

  const handleAddNBS = (item: ItemNBS) => {
    storageService.addNbs(item);
    setNbsList(storageService.getNbs());
  };

  const handleAddPrefeitura = (nova: Omit<PrefeituraNacional, 'id'>) => {
    storageService.addPrefeitura(nova);
    setPrefeituras(storageService.getPrefeituras());
  };

  const handleClearPrefeituras = () => {
    storageService.savePrefeituras([]);
    setPrefeituras([]);
    firestoreService.clearAllPrefeituras().catch(console.warn);
  };

  const handleOpenExcelForType = (type: 'prefeituras' | 'nbs' | 'servicos') => {
    requireAdminAction(() => {
      setExcelTargetType(type);
      setIsExcelPasteOpen(true);
    });
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 font-sans min-h-screen flex selection:bg-red-600 selection:text-white">
      {/* 1. Lateral Sidebar with the main modules */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5 animate-pulse"></span>
              <div>
                <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Painel interno para consultas e apoio às rotinas fiscais
                </h1>
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-slate-600 font-semibold">
                    Painel Corporativo de Inteligência Fiscal — ATS Informática
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Apenas para consultas internas (Não aplicar ao cliente sem consultar a contabilidade)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Clickable Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Serviços */}
            <button
              type="button"
              onClick={() => setActiveTab('servicos')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
                activeTab === 'servicos'
                  ? 'bg-white border-slate-300 shadow-sm ring-1 ring-slate-200'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  TABELA DE SERVIÇOS
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {counts.servicos} itens
                </span>
              </div>
              <h3 className="text-sm md:text-base font-black text-slate-900 mt-1">
                Serviços Fiscais
              </h3>
              <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-2 inline-flex items-center gap-1">
                Consultar regras →
              </span>
            </button>

            {/* Card 2: NBS */}
            <button
              type="button"
              onClick={() => setActiveTab('nbs')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
                activeTab === 'nbs'
                  ? 'bg-white border-slate-300 shadow-sm ring-1 ring-slate-200'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  TABELA RFB
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {counts.nbs} itens
                </span>
              </div>
              <h3 className="text-sm md:text-base font-black text-slate-900 mt-1">
                NBS
              </h3>
              <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-2 inline-flex items-center gap-1">
                Ver nomenclatura →
              </span>
            </button>

            {/* Card 3: Prefeituras */}
            <button
              type="button"
              onClick={() => setActiveTab('prefeituras')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
                activeTab === 'prefeituras'
                  ? 'bg-white border-slate-300 shadow-sm ring-1 ring-slate-200'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  EXPORTAÇÃO
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  {counts.prefeituras} cidades
                </span>
              </div>
              <h3 className="text-sm md:text-base font-black text-slate-900 mt-1">
                Padrão Nacional
              </h3>
              <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-2 inline-flex items-center gap-1">
                Validar cidades →
              </span>
            </button>
          </div>

          {/* Active Module View */}
          {activeTab === 'servicos' && (
            <ServicosModule
              servicos={servicos}
              nbsList={nbsList}
              onOpenDetail={(item) => handleOpenDetail(item, 'servico')}
              onAddServico={handleAddServico}
              onUpdateServico={handleUpdateServico}
              onOpenExcelPaste={() => handleOpenExcelForType('servicos')}
              onBulkUpdateServicos={handleBulkUpdateServicos}
            />
          )}

          {activeTab === 'nbs' && (
            <NBSModule
              nbsList={nbsList}
              onOpenExcelPaste={() => handleOpenExcelForType('nbs')}
              onAddNBS={handleAddNBS}
            />
          )}

          {activeTab === 'prefeituras' && (
            <PrefeiturasModule
              prefeituras={prefeituras}
              onOpenDetail={(pref) => handleOpenDetail(pref, 'prefeitura')}
              onAddPrefeitura={handleAddPrefeitura}
              onClearPrefeituras={handleClearPrefeituras}
              onOpenExcelPaste={() => handleOpenExcelForType('prefeituras')}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={detailItem.data}
        type={detailItem.type}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onDataReloaded={loadAllDataFromLocal}
      />

      <ExcelPasteModal
        isOpen={isExcelPasteOpen}
        onClose={() => setIsExcelPasteOpen(false)}
        targetType={excelTargetType}
        onImportSuccess={loadAllDataFromLocal}
      />

      <AdminAuthModal />
    </div>
  );
}
