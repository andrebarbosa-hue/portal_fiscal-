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
import { Menu, BookOpen, Building2, FileText, Lock, ShieldCheck } from 'lucide-react';

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
  const { isAdmin, adminUser, requireAdminAction, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('servicos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    <div className="bg-[#f8fafc] text-slate-800 font-sans min-h-screen flex flex-col md:flex-row selection:bg-red-600 selection:text-white antialiased">
      {/* 1. Mobile Top Navigation Bar (Shown only on small screens / portrait phone) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#111827] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Abrir Menu de Navegação"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black shadow-xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight leading-none block">
                NFSe Fiscal
              </span>
              <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block">
                ATS INFORMÁTICA
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2 py-1 bg-red-950/80 border border-red-700/60 rounded-lg text-[10px] font-bold text-red-300 flex items-center gap-1 shadow-xs"
            >
              <ShieldCheck className="w-3 h-3 text-red-400" />
              <span>Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-medium text-slate-300 hover:text-white flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Lateral Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Dynamic Main Workspace with mobile-friendly padding and bottom clearance */}
        <main className="flex-1 p-3 sm:p-5 md:p-8 pb-24 md:pb-8 space-y-4 md:space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1 animate-pulse"></span>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Painel interno para consultas e apoio às rotinas fiscais
                </h1>
                <div className="mt-0.5 space-y-0.5">
                  <p className="text-[11px] sm:text-xs text-slate-600 font-semibold">
                    Painel Corporativo de Inteligência Fiscal — ATS Informática
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                    Apenas para consultas internas (Não aplicar ao cliente sem consultar a contabilidade)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Action Summary Cards - Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Card 1: Serviços */}
            <button
              type="button"
              onClick={() => setActiveTab('servicos')}
              className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer group ${
                activeTab === 'servicos'
                  ? 'bg-white border-red-400/80 shadow-xs ring-1 ring-red-400/50'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  SERVIÇOS
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-700 rounded self-start sm:self-auto">
                  {counts.servicos}
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-black text-slate-900 mt-1 truncate">
                Serviços Fiscais
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-1 hidden sm:inline-flex items-center gap-1">
                Consultar regras →
              </span>
            </button>

            {/* Card 2: NBS */}
            <button
              type="button"
              onClick={() => setActiveTab('nbs')}
              className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer group ${
                activeTab === 'nbs'
                  ? 'bg-white border-red-400/80 shadow-xs ring-1 ring-red-400/50'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  TABELA RFB
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-700 rounded self-start sm:self-auto">
                  {counts.nbs}
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-black text-slate-900 mt-1 truncate">
                NBS
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-1 hidden sm:inline-flex items-center gap-1">
                Ver nomenclatura →
              </span>
            </button>

            {/* Card 3: Prefeituras */}
            <button
              type="button"
              onClick={() => setActiveTab('prefeituras')}
              className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer group ${
                activeTab === 'prefeituras'
                  ? 'bg-white border-red-400/80 shadow-xs ring-1 ring-red-400/50'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  CIDADES
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-700 rounded self-start sm:self-auto">
                  {counts.prefeituras}
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-black text-slate-900 mt-1 truncate">
                Padrão Nac.
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-600 transition-colors mt-1 hidden sm:inline-flex items-center gap-1">
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

      {/* 4. Mobile Bottom Navigation Bar (Visible only on phones in portrait/vertical mode) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('servicos')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            activeTab === 'servicos'
              ? 'text-red-600 font-bold bg-red-50/70'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Serviços ({counts.servicos})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nbs')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            activeTab === 'nbs'
              ? 'text-red-600 font-bold bg-red-50/70'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">NBS ({counts.nbs})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prefeituras')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            activeTab === 'prefeituras'
              ? 'text-red-600 font-bold bg-red-50/70'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Cidades ({counts.prefeituras})</span>
        </button>
      </nav>

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
