import { ServicoFiscal } from '../types/fiscal';

// Os serviços fiscais agora são armazenados exclusivamente no Banco de Dados Cloud Firestore
export const initialServicosData: ServicoFiscal[] = [];

export function getServicosIniciais(): ServicoFiscal[] {
  return [];
}
