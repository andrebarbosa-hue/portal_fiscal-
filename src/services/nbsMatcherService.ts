import { ServicoFiscal, ItemNBS } from '../types/fiscal';

export interface MatchResult {
  servicoId: string;
  nbsAtual: string;
  nbsAtualValida: boolean;
  nbsSugerida: ItemNBS | null;
  score: number; // 0 to 100
  motivoSugestao: string;
  alternativas: { nbs: ItemNBS; score: number; motivo: string }[];
}

// Tokenize and clean text for search and scoring
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['para', 'com', 'sem', 'dos', 'das', 'por', 'que', 'uma', 'sobre', 'servico', 'servicos'].includes(t));
}

// Calculate similarity score between service and NBS item
export function calculateMatchScore(servico: ServicoFiscal, nbsItem: ItemNBS): { score: number; motivo: string } {
  let score = 0;
  const motivos: string[] = [];

  const servicoTokens = tokenize(servico.descricao + ' ' + servico.itemLC116 + ' ' + (servico.cnaePrincipal || ''));
  const nbsTokens = tokenize(nbsItem.descricao + ' ' + (nbsItem.nomeCapitulo || ''));

  // 1. Direct exact NBS code match
  const cleanServicoNbs = servico.nbs.replace(/\D/g, '');
  const cleanNbsCode = nbsItem.codigo.replace(/\D/g, '');
  
  if (cleanServicoNbs === cleanNbsCode) {
    score += 50;
    motivos.push('Código NBS coincide exatamente');
  } else if (cleanServicoNbs.slice(0, 5) === cleanNbsCode.slice(0, 5)) {
    score += 25;
    motivos.push('Mesma subposição NBS');
  }

  // 2. Token overlap between service description and NBS description
  let matchedTokensCount = 0;
  for (const token of servicoTokens) {
    if (nbsTokens.includes(token)) {
      matchedTokensCount++;
    }
  }

  if (servicoTokens.length > 0) {
    const tokenRatio = matchedTokensCount / Math.max(servicoTokens.length, 3);
    const tokenScore = Math.min(Math.round(tokenRatio * 45), 45);
    score += tokenScore;
    if (tokenScore > 15) {
      motivos.push(`${matchedTokensCount} termos descritivos coincidentes`);
    }
  }

  // 3. Item LC 116 domain correlation heuristic
  const itemLC = servico.itemLC116.trim();
  const cap = nbsItem.capitulo;

  // Software & TI: LC 01.xx corresponds to NBS cap 15
  if (itemLC.startsWith('01.') && cap === '15') {
    score += 15;
    motivos.push('Capítulo 15 da NBS compatível com TI/Software da LC 116');
  }
  // Engineering / Architecture: LC 07.01, 07.03 corresponds to NBS cap 12
  else if ((itemLC.startsWith('07.01') || itemLC.startsWith('07.03')) && cap === '12') {
    score += 15;
    motivos.push('Capítulo 12 da NBS compatível com Engenharia/Arquitetura');
  }
  // Construction: LC 07.02, 07.04, 07.05 corresponds to NBS cap 14
  else if ((itemLC.startsWith('07.02') || itemLC.startsWith('07.04') || itemLC.startsWith('07.05')) && cap === '14') {
    score += 15;
    motivos.push('Capítulo 14 da NBS compatível com Construção Civil');
  }
  // Healthcare / Medical: LC 04.xx corresponds to NBS cap 23
  else if (itemLC.startsWith('04.') && cap === '23') {
    score += 15;
    motivos.push('Capítulo 23 da NBS compatível com Saúde/Medicina');
  }
  // Education: LC 08.xx corresponds to NBS cap 22
  else if (itemLC.startsWith('08.') && cap === '22') {
    score += 15;
    motivos.push('Capítulo 22 da NBS compatível com Educação/Treinamento');
  }
  // Legal / Accounting / Management: LC 17.xx corresponds to NBS cap 11
  else if (itemLC.startsWith('17.') && cap === '11') {
    score += 15;
    motivos.push('Capítulo 11 da NBS compatível com Gestão/Consultoria');
  }

  const finalScore = Math.min(score, 100);
  return {
    score: finalScore,
    motivo: motivos.join(' • ') || 'Correspondência geral por similaridade descritiva'
  };
}

// Cross-match a single service against all active NBS items
export function crossMatchServicoWithNBS(servico: ServicoFiscal, nbsList: ItemNBS[]): MatchResult {
  const cleanServicoNbs = servico.nbs.replace(/\D/g, '');
  const nbsAtualExiste = nbsList.find(n => n.codigo.replace(/\D/g, '') === cleanServicoNbs);
  const nbsAtualValida = Boolean(nbsAtualExiste);

  // Score all NBS items
  const scoredItems = nbsList
    .map(item => {
      const { score, motivo } = calculateMatchScore(servico, item);
      return { nbs: item, score, motivo };
    })
    .sort((a, b) => b.score - a.score);

  const bestMatch = scoredItems[0] || null;
  const alternativas = scoredItems.slice(1, 4);

  return {
    servicoId: servico.id,
    nbsAtual: servico.nbs,
    nbsAtualValida,
    nbsSugerida: bestMatch ? bestMatch.nbs : null,
    score: bestMatch ? bestMatch.score : 0,
    motivoSugestao: bestMatch ? bestMatch.motivo : 'Nenhuma NBS correspondente encontrada',
    alternativas
  };
}

// Cross-match entire list of services with NBS catalog
export function batchCrossMatch(servicos: ServicoFiscal[], nbsList: ItemNBS[]): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const s of servicos) {
    results[s.id] = crossMatchServicoWithNBS(s, nbsList);
  }
  return results;
}
