export interface ServicoFiscal {
  id: string;
  codigoAntigo: string;
  codigoNovo: string; // Ex: 01.01.01.001 ou 01.01
  itemLC116: string;  // Ex: 01.01
  descricao: string;
  nbs: string;        // Ex: 1.1502.20.00
  aliquotaSugerida: number; // Ex: 2.0 a 5.0%
  retencaoISS: 'Sim' | 'Não' | 'Depende do Local';
  localIncidencia: 'Local do Prestador' | 'Local do Tomador (Art. 3º)' | 'Local da Execução';
  permiteDeducao: boolean;
  cnaePrincipal?: string;
  baseLegal: string;
  observacao?: string;
  nbsValidada?: boolean; // Se a NBS está validada contra o catálogo de aptas
  nbsSugerida?: string; // NBS calculada/sugerida pelo cruzamento
  scoreMatch?: number; // Pontuação de similaridade/cruzamento
  updatedAt?: string;
}

export interface ItemNBS {
  codigo: string;       // 1.0101.11.00
  descricao: string;
  capitulo: string;     // 01 a 26
  nomeCapitulo?: string;
  subposicao?: string;
  statusApta?: boolean; // Indicador de NBS apta/vigente
}

export interface CapituloNBS {
  numero: string;
  titulo: string;
  totalItens: number;
}

export interface PrefeituraNacional {
  id: string;
  cidade: string;
  uf: string;
  cnpj: string;
  regiao?: string;
  codigoIbge?: string;
  status: 'Apta' | 'Em Adequação' | 'Não Aderiu';
  emissor: 'Padrão Nacional' | 'Webservice Municipal' | 'Portal Próprio' | 'Homologação';
  provedor?: 'NFS-e Nacional' | 'Betha' | 'IPM' | 'Ginfes' | 'WebISS' | 'DBSeller' | 'GovBR' | 'Fiorilli' | 'Portal Próprio' | 'Outros' | string;
  statusConvenioSEFIN?: string; // Ex: "Conveniado Ativo", "Não Conveniado"
  aderenteAmbienteNacional?: string; // Sim / Não
  aderenteEmissorNacional?: string;  // Sim / Não
  aderenteMAN?: string;              // Sim / Não
  ativoNaBase?: string;              // Sim / Não
  ativoUltimoPeriodo?: string;       // Sim / Não
  populacao?: string;                // Ex: "2.982.818"
  versaoLayout?: string;
  observacoes?: string;
}

export type ActiveTab = 'servicos' | 'nbs' | 'prefeituras';

