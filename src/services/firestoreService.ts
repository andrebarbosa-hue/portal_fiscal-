import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  onSnapshot, 
  writeBatch, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ServicoFiscal, ItemNBS, PrefeituraNacional } from '../types/fiscal';

const COLLECTIONS = {
  SERVICOS: 'servicos',
  NBS: 'nbs',
  PREFEITURAS: 'prefeituras',
  CONFIG: 'config'
};

// Helper for sanitize IDs for Firestore doc keys
function cleanDocId(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\/\s#?\[\]]/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .trim();
}

export const firestoreService = {
  // --- REAL-TIME LISTENERS ---
  subscribeServicos(onUpdate: (data: ServicoFiscal[]) => void, onError?: (err: Error) => void) {
    try {
      const colRef = collection(db, COLLECTIONS.SERVICOS);
      return onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: ServicoFiscal[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as ServicoFiscal);
          });
          onUpdate(list);
        }
      }, (err) => {
        console.warn('Firestore Servicos subscription error:', err);
        if (onError) onError(err);
      });
    } catch (e) {
      console.warn('Failed to subscribe to servicos in firestore:', e);
      return () => {};
    }
  },

  subscribeNBS(onUpdate: (data: ItemNBS[]) => void, onError?: (err: Error) => void) {
    try {
      const colRef = collection(db, COLLECTIONS.NBS);
      return onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: ItemNBS[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as ItemNBS);
          });
          onUpdate(list);
        }
      }, (err) => {
        console.warn('Firestore NBS subscription error:', err);
        if (onError) onError(err);
      });
    } catch (e) {
      console.warn('Failed to subscribe to NBS in firestore:', e);
      return () => {};
    }
  },

  subscribePrefeituras(onUpdate: (data: PrefeituraNacional[]) => void, onError?: (err: Error) => void) {
    try {
      const colRef = collection(db, COLLECTIONS.PREFEITURAS);
      return onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: PrefeituraNacional[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as PrefeituraNacional);
          });
          onUpdate(list);
        }
      }, (err) => {
        console.warn('Firestore Prefeituras subscription error:', err);
        if (onError) onError(err);
      });
    } catch (e) {
      console.warn('Failed to subscribe to Prefeituras in firestore:', e);
      return () => {};
    }
  },

  // --- FETCH ONE-TIME ---
  async fetchAll(): Promise<{
    servicos: ServicoFiscal[] | null;
    nbs: ItemNBS[] | null;
    prefeituras: PrefeituraNacional[] | null;
  }> {
    try {
      const [servicosSnap, nbsSnap, prefSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.SERVICOS)),
        getDocs(collection(db, COLLECTIONS.NBS)),
        getDocs(collection(db, COLLECTIONS.PREFEITURAS))
      ]);

      const servicos = !servicosSnap.empty ? servicosSnap.docs.map(d => d.data() as ServicoFiscal) : null;
      const nbs = !nbsSnap.empty ? nbsSnap.docs.map(d => d.data() as ItemNBS) : null;
      const prefeituras = !prefSnap.empty ? prefSnap.docs.map(d => d.data() as PrefeituraNacional) : null;

      return { servicos, nbs, prefeituras };
    } catch (err) {
      console.warn('Firestore fetchAll error, using local fallback:', err);
      return { servicos: null, nbs: null, prefeituras: null };
    }
  },

  // --- CRUD SERVIÇOS ---
  async saveServico(servico: ServicoFiscal): Promise<void> {
    const docId = cleanDocId(servico.id || `srv-${Date.now()}`);
    const docRef = doc(db, COLLECTIONS.SERVICOS, docId);
    await setDoc(docRef, { ...servico, id: servico.id || docId, updatedAt: new Date().toISOString() }, { merge: true });
  },

  async deleteServico(id: string): Promise<void> {
    const docId = cleanDocId(id);
    const docRef = doc(db, COLLECTIONS.SERVICOS, docId);
    await deleteDoc(docRef);
  },

  async clearAllServicos(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.SERVICOS));
      const CHUNK_SIZE = 400;
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const d of chunk) {
          batch.delete(d.ref);
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Erro ao limpar serviços do Firestore:', err);
    }
  },

  // --- CRUD NBS ---
  async saveNBS(item: ItemNBS): Promise<void> {
    const docId = cleanDocId(item.codigo);
    const docRef = doc(db, COLLECTIONS.NBS, docId);
    await setDoc(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
  },

  async deleteNBS(codigo: string): Promise<void> {
    const docId = cleanDocId(codigo);
    const docRef = doc(db, COLLECTIONS.NBS, docId);
    await deleteDoc(docRef);
  },

  async clearAllNBS(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.NBS));
      const CHUNK_SIZE = 400;
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const d of chunk) {
          batch.delete(d.ref);
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Erro ao limpar NBS do Firestore:', err);
    }
  },

  // --- CRUD PREFEITURAS ---
  async savePrefeitura(pref: PrefeituraNacional): Promise<void> {
    const docId = cleanDocId(pref.id || `pref-${pref.uf}-${pref.cidade}`);
    const docRef = doc(db, COLLECTIONS.PREFEITURAS, docId);
    await setDoc(docRef, { ...pref, id: pref.id || docId, updatedAt: new Date().toISOString() }, { merge: true });
  },

  async deletePrefeitura(id: string): Promise<void> {
    const docId = cleanDocId(id);
    const docRef = doc(db, COLLECTIONS.PREFEITURAS, docId);
    await deleteDoc(docRef);
  },

  async clearAllPrefeituras(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.PREFEITURAS));
      const CHUNK_SIZE = 400;
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const d of chunk) {
          batch.delete(d.ref);
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Erro ao limpar prefeituras do Firestore:', err);
    }
  },

  // --- CHUNKED BATCH IMPORTS (Firestore has 500 ops per batch limit) ---
  async batchSaveServicos(list: ServicoFiscal[], onProgress?: (percent: number) => void): Promise<number> {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < list.length; i += CHUNK_SIZE) {
      const chunk = list.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        const docId = cleanDocId(item.id || `srv-${item.codigoNovo || item.codigoAntigo}`);
        const ref = doc(db, COLLECTIONS.SERVICOS, docId);
        batch.set(ref, { ...item, id: item.id || docId, updatedAt: new Date().toISOString() }, { merge: true });
      }
      await batch.commit();
      if (onProgress) {
        onProgress(Math.round(((i + chunk.length) / list.length) * 100));
      }
    }
    return list.length;
  },

  async batchSaveNBS(list: ItemNBS[], onProgress?: (percent: number) => void): Promise<number> {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < list.length; i += CHUNK_SIZE) {
      const chunk = list.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        const docId = cleanDocId(item.codigo);
        const ref = doc(db, COLLECTIONS.NBS, docId);
        batch.set(ref, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
      }
      await batch.commit();
      if (onProgress) {
        onProgress(Math.round(((i + chunk.length) / list.length) * 100));
      }
    }
    return list.length;
  },

  async batchSavePrefeituras(list: PrefeituraNacional[], onProgress?: (percent: number) => void): Promise<number> {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < list.length; i += CHUNK_SIZE) {
      const chunk = list.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        const docId = cleanDocId(item.id || `pref-${item.uf}-${item.cidade}`);
        const ref = doc(db, COLLECTIONS.PREFEITURAS, docId);
        batch.set(ref, { ...item, id: item.id || docId, updatedAt: new Date().toISOString() }, { merge: true });
      }
      await batch.commit();
      if (onProgress) {
        onProgress(Math.round(((i + chunk.length) / list.length) * 100));
      }
    }
    return list.length;
  },

  // --- ADMIN SECURITY CONFIG IN CLOUD FIRESTORE ---
  async getAdminPasswordConfig(): Promise<{ passwordHash: string; salt: string; updatedBy?: string; updatedAt?: string } | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CONFIG, 'admin_security');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as { passwordHash: string; salt: string; updatedBy?: string; updatedAt?: string };
      }
      return null;
    } catch (err) {
      console.warn('Erro ao ler configuração de senha de administrador do Firestore:', err);
      return null;
    }
  },

  async saveAdminPasswordConfig(passwordHash: string, salt: string, updatedBy: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CONFIG, 'admin_security');
    await setDoc(docRef, {
      passwordHash,
      salt,
      updatedBy,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
};
