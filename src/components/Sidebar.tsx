import React from 'react';
import { 
  Menu,
  BookOpen, 
  Building2, 
  FileText,
  ShieldCheck,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';
import { ActiveTab } from '../types/fiscal';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  counts?: {
    servicos: number;
    nbs: number;
    prefeituras: number;
  };
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { isAdmin, adminUser, logoutAdmin, setIsAuthModalOpen } = useAuth();
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'servicos',
      label: 'Consultar Serviços',
      icon: <Menu className="w-4 h-4" />
    },
    {
      id: 'nbs',
      label: 'Consultar NBS',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'prefeituras',
      label: 'Prefeituras Padrão Nacional',
      icon: <Building2 className="w-4 h-4" />
    }
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 text-slate-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-5 border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-md shadow-red-600/30 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                NFSe Fiscal
              </h1>
              <p className="text-[10px] text-red-500 font-bold tracking-wider uppercase mt-1">
                INTELIGÊNCIA TRIBUTÁRIA
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Fechar menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* System Module Section Title */}
        <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          MÓDULOS DO SISTEMA
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-150 text-left relative ${
                  isActive
                    ? 'bg-slate-800/95 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-red-600 rounded-r-full" />
                )}
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-2 pt-4 border-t border-slate-800/60 space-y-3">
        {/* Admin Session Badge */}
        {isAdmin ? (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-bold text-red-300 leading-tight">Admin Ativo</p>
                <p className="text-[9px] text-red-400/80 font-mono truncate">{adminUser}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Redefinir ou trocar senha mestra no banco"
                className="p-1.5 rounded-lg hover:bg-red-900/50 text-red-300 hover:text-white transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  logoutAdmin();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Sair do modo administrador"
                className="p-1.5 rounded-lg hover:bg-red-900/50 text-red-300 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsAuthModalOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-semibold transition-all group"
          >
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400 transition-colors" />
              <span>Modo Consulta</span>
            </div>
            <span className="text-[10px] text-red-400 font-bold underline">Entrar Admin</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate font-medium text-[10px] text-slate-400">
            Banco em Nuvem: <strong className="text-emerald-400">Ativo</strong>
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>NFSe Fiscal</span>
          <span className="font-bold text-slate-300">BY André Antunes</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111827] shrink-0 min-h-screen border-r border-slate-800/80">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#111827] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
