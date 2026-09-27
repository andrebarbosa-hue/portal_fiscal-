import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { servicesPart1 } from './servicesPart1';
import { servicesPart2 } from './servicesPart2';
import { servicesPart3 } from './servicesPart3';
import { ServicoFiscal, ItemNBS } from '../src/types/fiscal';

function cleanDocId(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\/\s#?\[\]]/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .trim();
}

// Function to calculate legal Aliquota, Retencao and Local based on LC 116/2003
function calculateTaxRules(dps: string, desc: string): {
  itemLC116: string;
  aliquota: number;
  retencao: 'Sim' | 'Não' | 'Depende do Local';
  local: 'Local do Prestador' | 'Local do Tomador (Art. 3º)' | 'Local da Execução';
  permiteDeducao: boolean;
  baseLegal: string;
} {
  const itemLC116 = dps.substring(0, 5); // Ex: "01.01", "07.02"
  const itemNum = parseFloat(itemLC116);
  const lowerDesc = desc.toLowerCase();

  let aliquota = 3.0; // Default
  let retencao: 'Sim' | 'Não' | 'Depende do Local' = 'Não';
  let local: 'Local do Prestador' | 'Local do Tomador (Art. 3º)' | 'Local da Execução' = 'Local do Prestador';
  let permiteDeducao = false;

  // LC 116 Article 3 exceptions where ISS is due at the place of execution (Local da Prestação / Tomador)
  // and withholding (retenção) is standard or mandatory:
  if (
    itemLC116.startsWith('03.05') || // cessão de andaimes, palcos
    itemLC116.startsWith('07.02') || // execução de obras
    itemLC116.startsWith('07.04') || // demolição
    itemLC116.startsWith('07.05') || // reformas e reparação
    itemLC116.startsWith('07.09') || // varrição e lixo
    itemLC116.startsWith('07.10') || // limpeza de vias e imóveis
    itemLC116.startsWith('07.11') || // jardinagem e decoração
    itemLC116.startsWith('07.12') || // controle de efluentes
    itemLC116.startsWith('07.16') || // florestamento
    itemLC116.startsWith('07.17') || // escoramento
    itemLC116.startsWith('07.18') || // dragagem
    itemLC116.startsWith('07.19') || // acompanhamento no local da obra
    itemLC116.startsWith('11.01') || // guarda e estacionamento
    itemLC116.startsWith('11.02') || // vigilância e segurança
    itemLC116.startsWith('11.04') || // armazenamento e carga
    itemLC116.startsWith('12.') ||    // eventos, diversões, shows
    itemLC116.startsWith('16.01') || // transporte municipal
    itemLC116.startsWith('17.05') || // fornecimento de mão de obra
    itemLC116.startsWith('17.10') || // feiras e exposições
    itemLC116.startsWith('20.')      // serviços portuários e aeroportuários
  ) {
    retencao = 'Sim';
    local = 'Local da Execução';
  } else if (itemLC116.startsWith('10.') || itemLC116.startsWith('15.')) {
    retencao = 'Não';
    local = 'Local do Prestador';
  }

  // Dedução de materiais em obras de construção civil (Art. 7, §2, I da LC 116)
  if (itemLC116 === '07.02' || itemLC116 === '07.05') {
    permiteDeducao = true;
  }

  // Aliquotas por grupo conforme LC 116 e Lei Municipal 8.725:
  if (itemNum >= 1.01 && itemNum <= 1.09) {
    // Informática e tecnologia: 2.0% a 2.5%
    aliquota = itemLC116 === '01.01' || itemLC116 === '01.04' || itemLC116 === '01.05' ? 2.0 : 2.5;
  } else if (itemNum >= 2.01 && itemNum <= 2.01) {
    aliquota = 2.5;
  } else if (itemNum >= 3.01 && itemNum <= 3.05) {
    aliquota = 5.0; // Cessão de direitos, locação e andaimes
  } else if (itemNum >= 4.01 && itemNum <= 4.23) {
    // Saúde e medicina: 2.0% se SUS ou incentivo básico, senão 2.5% a 3.0%
    if (lowerDesc.includes('sus') || lowerDesc.includes('único de saúde')) {
      aliquota = 2.0;
    } else if (itemLC116 === '04.01' || itemLC116 === '04.02' || itemLC116 === '04.03') {
      aliquota = 2.5;
    } else {
      aliquota = 3.0;
    }
  } else if (itemNum >= 5.01 && itemNum <= 5.09) {
    aliquota = 3.0; // Veterinária
  } else if (itemNum >= 6.01 && itemNum <= 6.06) {
    aliquota = 3.0; // Estética, cabeleireiro, massagem
  } else if (itemNum >= 7.01 && itemNum <= 7.22) {
    // Construção civil: 3.0% para obras e reformas, 4% ou 5% para consultoria/limpeza
    if (itemLC116 === '07.02' || itemLC116 === '07.05') {
      aliquota = 3.0;
    } else if (itemLC116 === '07.01' || itemLC116 === '07.03') {
      aliquota = 4.0;
    } else {
      aliquota = 3.5;
    }
  } else if (itemNum >= 8.01 && itemNum <= 8.02) {
    aliquota = 3.0; // Ensino e treinamento
  } else if (itemNum >= 9.01 && itemNum <= 9.03) {
    aliquota = 5.0; // Hospedagem e turismo
  } else if (itemNum >= 10.01 && itemNum <= 10.10) {
    aliquota = 5.0; // Intermediação, corretagem e agenciamento
  } else if (itemNum >= 11.01 && itemNum <= 11.04) {
    aliquota = itemLC116 === '11.02' ? 3.0 : 4.0; // Vigilância e guarda
  } else if (itemNum >= 12.01 && itemNum <= 12.17) {
    aliquota = 5.0; // Diversão, shows e espetáculos
  } else if (itemNum >= 13.01 && itemNum <= 13.05) {
    aliquota = 3.0; // Fotografia, reprografia e gráfica
  } else if (itemNum >= 14.01 && itemNum <= 14.14) {
    aliquota = itemLC116 === '14.01' ? 3.0 : 4.0; // Oficinas, manutenção, assistência
  } else if (itemNum >= 15.01 && itemNum <= 15.18) {
    aliquota = 5.0; // Serviços bancários e financeiros (teto legal)
  } else if (itemNum >= 16.01 && itemNum <= 16.02) {
    aliquota = 3.0; // Transporte municipal
  } else if (itemNum >= 17.01 && itemNum <= 17.25) {
    // Apoio administrativo, consultoria, advocacia, contabilidade
    aliquota = itemLC116 === '17.05' || itemLC116 === '17.19' ? 3.0 : 5.0;
  } else if (itemNum === 99.01) {
    aliquota = 0.0; // Não sujeitos à incidência do ISSQN
  } else {
    aliquota = 4.0;
  }

  const baseLegal = `LC 116/2003, Item ${itemLC116}; Art. 3º e 8º da LC 116/2003`;

  return { itemLC116, aliquota, retencao, local, permiteDeducao, baseLegal };
}

// Function to find best NBS from official database
function findBestNBS(desc: string, itemLC116: string, nbsList: ItemNBS[]): string {
  const lowerDesc = desc.toLowerCase();

  // 1. Direct Chapter heuristics based on LC 116
  let targetCapitulo = '';
  if (itemLC116.startsWith('01.')) targetCapitulo = '15'; // Serviços de TI
  else if (itemLC116.startsWith('02.')) targetCapitulo = '12'; // P&D
  else if (itemLC116.startsWith('03.')) targetCapitulo = '11'; // Cessão / Locação
  else if (itemLC116.startsWith('04.')) targetCapitulo = '23'; // Saúde e assistência humana
  else if (itemLC116.startsWith('05.')) targetCapitulo = '23'; // Veterinária / cuidados
  else if (itemLC116.startsWith('06.')) targetCapitulo = '27'; // Outros serviços pessoais
  else if (itemLC116.startsWith('07.')) targetCapitulo = '01'; // Construção civil
  else if (itemLC116.startsWith('08.')) targetCapitulo = '22'; // Educação e ensino
  else if (itemLC116.startsWith('09.')) targetCapitulo = '03'; // Alojamento e alimentação
  else if (itemLC116.startsWith('10.')) targetCapitulo = '18'; // Intermediação e apoio a negócios
  else if (itemLC116.startsWith('11.')) targetCapitulo = '18'; // Segurança e limpeza
  else if (itemLC116.startsWith('12.')) targetCapitulo = '25'; // Lazer, cultura e esportes
  else if (itemLC116.startsWith('13.')) targetCapitulo = '19'; // Serviços fotográficos e de som
  else if (itemLC116.startsWith('14.')) targetCapitulo = '14'; // Manutenção e reparação
  else if (itemLC116.startsWith('15.')) targetCapitulo = '09'; // Serviços financeiros e bancários
  else if (itemLC116.startsWith('16.')) targetCapitulo = '05'; // Transporte de passageiros e cargas
  else if (itemLC116.startsWith('17.')) targetCapitulo = '18'; // Serviços jurídicos, contábeis e administrativos
  else if (itemLC116.startsWith('20.')) targetCapitulo = '07'; // Apoio a transportes

  // Search among candidate items in that chapter first
  const chapterItems = targetCapitulo ? nbsList.filter(n => n.capitulo === targetCapitulo) : nbsList;
  const pool = chapterItems.length > 0 ? chapterItems : nbsList;

  // Words from description
  const words = lowerDesc
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['para', 'com', 'sem', 'como', 'mais', 'pelo', 'pela', 'sobre', 'outros', 'geral', 'qualquer', 'sistema', 'servico', 'servicos'].includes(w));

  let bestMatch: ItemNBS | null = null;
  let bestScore = -1;

  for (const item of pool) {
    const nbsDesc = item.descricao.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (nbsDesc.includes(w)) {
        score += w.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.codigo;
  }

  // Fallback defaults for specific groups
  if (itemLC116.startsWith('01.01') || itemLC116.startsWith('01.02')) return '1.1502.20.00';
  if (itemLC116.startsWith('01.03')) return '1.1509.00.00';
  if (itemLC116.startsWith('07.02')) return '1.0101.11.00';
  if (itemLC116.startsWith('07.05')) return '1.0105.90.00';
  if (itemLC116.startsWith('09.01')) return '1.0303.11.00';
  if (itemLC116.startsWith('15.')) return '1.0901.10.00';
  if (itemLC116.startsWith('17.14')) return '1.1802.11.00';
  if (itemLC116.startsWith('17.19')) return '1.1802.21.00';

  return pool[0]?.codigo || '1.1502.20.00';
}

async function main() {
  console.log('--- INICIANDO PROCESSAMENTO COMPLETO DOS SERVIÇOS FISCAIS ---');

  const allRaw = [...servicesPart1, ...servicesPart2, ...servicesPart3];
  console.log(`Total de serviços brutos carregados das 16 páginas: ${allRaw.length}`);

  // Fetch all 1212 NBS docs from Firestore
  console.log('Consultando catálogo oficial da NBS no Cloud Firestore...');
  const nbsSnap = await getDocs(collection(db, 'nbs'));
  const nbsList: ItemNBS[] = [];
  nbsSnap.forEach(d => nbsList.push(d.data() as ItemNBS));
  console.log(`Catálogo oficial NBS obtido com sucesso: ${nbsList.length} itens.`);

  // Process all services
  const servicosFinal: ServicoFiscal[] = [];
  for (const raw of allRaw) {
    const tax = calculateTaxRules(raw.dps, raw.desc);
    const suggestedNbs = findBestNBS(raw.desc, tax.itemLC116, nbsList);
    const docId = cleanDocId(raw.dps);

    const record: ServicoFiscal = {
      id: docId,
      codigoAntigo: raw.ctiss,
      codigoNovo: raw.dps,
      itemLC116: tax.itemLC116,
      descricao: raw.desc,
      nbs: suggestedNbs,
      aliquotaSugerida: tax.aliquota,
      retencaoISS: tax.retencao,
      localIncidencia: tax.local,
      permiteDeducao: tax.permiteDeducao,
      cnaePrincipal: '',
      baseLegal: tax.baseLegal,
      observacao: tax.retencao === 'Sim'
        ? `Retenção obrigatória no local da prestação conforme Art. 3º da LC 116/2003.`
        : `Regra geral de incidência no local do estabelecimento prestador (Art. 3º da LC 116/2003).`,
      updatedAt: new Date().toISOString()
    };
    servicosFinal.push(record);
  }

  console.log(`Total de serviços processados com cruzamento e alíquotas: ${servicosFinal.length}`);

  // Batch commit directly into Firestore collection 'servicos'
  const CHUNK_SIZE = 300;
  console.log(`Gravando em lotes de ${CHUNK_SIZE} diretamente no Cloud Firestore...`);

  for (let i = 0; i < servicosFinal.length; i += CHUNK_SIZE) {
    const chunk = servicosFinal.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const ref = doc(db, 'servicos', item.id);
      batch.set(ref, item, { merge: true });
    }
    await batch.commit();
    console.log(`Lote ${Math.floor(i / CHUNK_SIZE) + 1} gravado (${i + chunk.length}/${servicosFinal.length} documentos)`);
  }

  console.log('✅ GRAVAÇÃO CONCLUÍDA COM SUCESSO NO CLOUD FIRESTORE!');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
