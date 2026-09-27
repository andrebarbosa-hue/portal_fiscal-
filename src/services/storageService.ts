import { ServicoFiscal, ItemNBS, PrefeituraNacional } from '../types/fiscal';
import { initialServicosData } from '../data/servicosData';
import { getNbsList } from '../data/nbsData';
import { rawPrefeiturasList } from '../data/prefeiturasData';
import { firestoreService } from './firestoreService';

const KEYS = {
  SERVICOS: 'portal_fiscal_servicos_v5',
  NBS: 'portal_fiscal_nbs_v5',
  PREFEITURAS: 'portal_fiscal_prefeituras_v5'
};

export const storageService = {
  // --- SERVIÇOS ---
  getServicos(): ServicoFiscal[] {
    try {
      const stored = localStorage.getItem(KEYS.SERVICOS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  },

  saveServicos(data: ServicoFiscal[]): void {
    localStorage.setItem(KEYS.SERVICOS, JSON.stringify(data));
  },

  async clearAllServicos(): Promise<void> {
    this.saveServicos([]);
    try {
      await firestoreService.clearAllServicos();
    } catch (err) {
      console.warn('Erro ao limpar serviços do Firestore:', err);
    }
  },

  addServico(servico: Omit<ServicoFiscal, 'id'>): ServicoFiscal {
    const list = this.getServicos();
    const newId = `srv-${Date.now()}`;
    const newRecord: ServicoFiscal = { ...servico, id: newId };
    list.unshift(newRecord);
    this.saveServicos(list);

    // Sync with Firestore Cloud
    firestoreService.saveServico(newRecord).catch(err => {
      console.warn('Background firestore saveServico failed:', err);
    });

    return newRecord;
  },

  updateServico(id: string, updated: Partial<ServicoFiscal>): void {
    const list = this.getServicos();
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      const fullUpdated = { ...list[index], ...updated };
      list[index] = fullUpdated;
      this.saveServicos(list);

      // Sync with Firestore Cloud
      firestoreService.saveServico(fullUpdated).catch(err => {
        console.warn('Background firestore updateServico failed:', err);
      });
    }
  },

  deleteServico(id: string): void {
    const list = this.getServicos().filter(s => s.id !== id);
    this.saveServicos(list);

    // Sync with Firestore Cloud
    firestoreService.deleteServico(id).catch(err => {
      console.warn('Background firestore deleteServico failed:', err);
    });
  },

  // --- NBS ---
  getNbs(): ItemNBS[] {
    try {
      const stored = localStorage.getItem(KEYS.NBS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  },

  saveNbs(data: ItemNBS[]): void {
    localStorage.setItem(KEYS.NBS, JSON.stringify(data));
  },

  addNbs(item: ItemNBS): void {
    const list = this.getNbs();
    const cleanCode = item.codigo.replace(/\D/g, '');
    const idx = list.findIndex(n => n.codigo.replace(/\D/g, '') === cleanCode);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.unshift(item);
    }
    this.saveNbs(list);

    // Sync with Firestore Cloud
    firestoreService.saveNBS(item).catch(err => {
      console.warn('Background firestore saveNBS failed:', err);
    });
  },

  // --- PREFEITURAS ---
  getPrefeituras(): PrefeituraNacional[] {
    try {
      const stored = localStorage.getItem(KEYS.PREFEITURAS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return rawPrefeiturasList;
  },

  savePrefeituras(data: PrefeituraNacional[]): void {
    localStorage.setItem(KEYS.PREFEITURAS, JSON.stringify(data));
  },

  addPrefeitura(pref: Omit<PrefeituraNacional, 'id'>): PrefeituraNacional {
    const list = this.getPrefeituras();
    const newId = `pref-${Date.now()}`;
    const newRecord: PrefeituraNacional = { ...pref, id: newId };
    list.unshift(newRecord);
    this.savePrefeituras(list);

    // Sync with Firestore Cloud
    firestoreService.savePrefeitura(newRecord).catch(err => {
      console.warn('Background firestore savePrefeitura failed:', err);
    });

    return newRecord;
  },

  updatePrefeitura(id: string, updated: Partial<PrefeituraNacional>): void {
    const list = this.getPrefeituras();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      const fullUpdated = { ...list[index], ...updated };
      list[index] = fullUpdated;
      this.savePrefeituras(list);

      // Sync with Firestore Cloud
      firestoreService.savePrefeitura(fullUpdated).catch(err => {
        console.warn('Background firestore updatePrefeitura failed:', err);
      });
    }
  },

  deletePrefeitura(id: string): void {
    const list = this.getPrefeituras().filter(p => p.id !== id);
    this.savePrefeituras(list);

    // Sync with Firestore Cloud
    firestoreService.deletePrefeitura(id).catch(err => {
      console.warn('Background firestore deletePrefeitura failed:', err);
    });
  },

  // --- BATCH IMPORTS ---
  async batchImportPrefeituras(
    newList: PrefeituraNacional[],
    mode: 'replace' | 'merge',
    onProgress?: (percent: number) => void
  ): Promise<number> {
    let final: PrefeituraNacional[];
    if (mode === 'replace') {
      final = newList;
      try {
        await firestoreService.clearAllPrefeituras();
      } catch (err) {
        console.warn('Erro ao limpar prefeituras do Firestore:', err);
      }
    } else {
      const existing = this.getPrefeituras();
      const existingMap = new Map<string, PrefeituraNacional>(
        existing.map(p => [`${p.cidade.toUpperCase().trim()}-${p.uf.toUpperCase().trim()}`, p])
      );
      
      // Update existing or add new
      newList.forEach(item => {
        const key = `${item.cidade.toUpperCase().trim()}-${item.uf.toUpperCase().trim()}`;
        const prev = existingMap.get(key);
        if (prev) {
          existingMap.set(key, { ...prev, ...item, id: prev.id });
        } else {
          existingMap.set(key, item);
        }
      });
      final = Array.from(existingMap.values());
    }
    this.savePrefeituras(final);

    // Sync directly to Firestore Cloud Database
    await firestoreService.batchSavePrefeituras(final, onProgress);

    return final.length;
  },

  async batchImportNbs(
    newList: ItemNBS[],
    mode: 'replace' | 'merge',
    onProgress?: (percent: number) => void
  ): Promise<number> {
    let final: ItemNBS[];
    if (mode === 'replace') {
      final = newList;
      try {
        await firestoreService.clearAllNBS();
      } catch (err) {
        console.warn('Erro ao limpar NBS do Firestore:', err);
      }
    } else {
      const existing = this.getNbs();
      const existingCodes = new Set(existing.map(n => n.codigo.replace(/\D/g, '')));
      const freshToAdd = newList.filter(n => !existingCodes.has(n.codigo.replace(/\D/g, '')));
      final = [...freshToAdd, ...existing];
    }
    this.saveNbs(final);

    // Sync batch directly to Firestore
    await firestoreService.batchSaveNBS(final, onProgress);

    return final.length;
  },

  async batchImportServicos(
    newList: ServicoFiscal[],
    mode: 'replace' | 'merge',
    onProgress?: (percent: number) => void
  ): Promise<number> {
    let final: ServicoFiscal[];
    if (mode === 'replace') {
      final = newList;
      try {
        await firestoreService.clearAllServicos();
      } catch (err) {
        console.warn('Erro ao limpar serviços do Firestore:', err);
      }
    } else {
      const existing = this.getServicos();
      const existingCodes = new Set(existing.map(s => s.codigoNovo.trim()));
      const freshToAdd = newList.filter(s => !existingCodes.has(s.codigoNovo.trim()));
      final = [...freshToAdd, ...existing];
    }
    this.saveServicos(final);

    // Sync batch directly to Firestore
    await firestoreService.batchSaveServicos(final, onProgress);

    return final.length;
  },

  exportAllBackup(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '3.0.0',
      database: 'Firebase Firestore',
      servicos: this.getServicos(),
      nbs: this.getNbs(),
      prefeituras: this.getPrefeituras()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.servicos && Array.isArray(parsed.servicos)) {
        this.saveServicos(parsed.servicos);
        firestoreService.batchSaveServicos(parsed.servicos).catch(console.warn);
      }
      if (parsed.prefeituras && Array.isArray(parsed.prefeituras)) {
        this.savePrefeituras(parsed.prefeituras);
        firestoreService.batchSavePrefeituras(parsed.prefeituras).catch(console.warn);
      }
      if (parsed.nbs && Array.isArray(parsed.nbs)) {
        this.saveNbs(parsed.nbs);
        firestoreService.batchSaveNBS(parsed.nbs).catch(console.warn);
      }
      return true;
    } catch {
      return false;
    }
  },

  resetDefaults(): void {
    localStorage.removeItem(KEYS.SERVICOS);
    localStorage.removeItem(KEYS.NBS);
    localStorage.removeItem(KEYS.PREFEITURAS);
  }
};
