import { ItemNBS, CapituloNBS } from '../types/fiscal';

export const capitulosNBSDict: Record<string, string> = {
  '01': 'Serviços de construção',
  '02': 'Serviços de intermediação na distribuição de mercadorias, despacho aduaneiro e comércio',
  '03': 'Fornecimento de alimentação e bebidas e serviços de hospedagem',
  '04': 'Serviços de transporte de passageiros',
  '05': 'Serviços de transporte de cargas',
  '06': 'Serviços de apoio aos transportes',
  '07': 'Serviços postais, remessa ou entrega de documentos e remessas expressas',
  '08': 'Serviços de transmissão e distribuição de eletricidade, gás e água',
  '09': 'Serviços financeiros e serviços relacionados',
  '10': 'Serviços imobiliários',
  '11': 'Arrendamento mercantil operacional, propriedade intelectual, franquias e outros direitos',
  '12': 'Serviços de pesquisa e desenvolvimento (P&D)',
  '13': 'Serviços jurídicos e contábeis',
  '14': 'Serviços profissionais, técnicos e empresariais',
  '15': 'Serviços de tecnologia da informação (TI)',
  '16': 'Serviços de telecomunicações e correlatos',
  '17': 'Serviços de telecomunicações, difusão e fornecimento de informações',
  '18': 'Serviços de apoio às atividades empresariais',
  '19': 'Serviços de apoio à agricultura, pecuária, silvicultura, pesca, aquicultura e mineração',
  '20': 'Serviços de manutenção, reparação e instalação (exceto construção)',
  '21': 'Serviços de publicação, impressão e reprodução',
  '22': 'Serviços educacionais',
  '23': 'Serviços relacionados à saúde humana e de assistência social',
  '24': 'Serviços de coleta, tratamento e eliminação de esgoto, resíduos e proteção ambiental',
  '25': 'Serviços recreativos, culturais e desportivos',
  '26': 'Serviços pessoais'
};

export const capitulosNBSList: CapituloNBS[] = Object.entries(capitulosNBSDict).map(([num, titulo]) => ({
  numero: num,
  titulo,
  totalItens: 0
}));

// Os dados agora são armazenados exclusivamente no Banco de Dados Cloud Firestore
export const rawNbsData: ItemNBS[] = [];

export const nbsCatalog = rawNbsData;

export function getNbsList(): ItemNBS[] {
  return rawNbsData.map(item => ({
    ...item,
    nomeCapitulo: capitulosNBSDict[item.capitulo] || 'Outros Serviços'
  }));
}

export function getNbsByCode(codigo: string): ItemNBS | undefined {
  const cleanCode = codigo.replace(/\D/g, '');
  return rawNbsData.find(item => item.codigo.replace(/\D/g, '') === cleanCode);
}
