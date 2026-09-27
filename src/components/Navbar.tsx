import React from 'react';
import { ActiveTab } from '../types/fiscal';
import { Download, FileSpreadsheet } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExportImport: () => void;
  onOpenExcelPaste: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportImport,
  onOpenExcelPaste
}) => {
  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'servicos', label: 'Consultar Serviços' },
    { id: 'nbs', label: 'Catálogo NBS' },
    { id: 'prefeituras', label: 'Prefeituras' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight whitespace-nowrap">
          NFSe Fiscal
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden sm:flex items-center gap-1">
        {navLinks.map(link => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Empty right zone for balance */}
      <div className="w-4"></div>
    </header>
  );
};
