import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Database, 
  Loader2, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { PrefeituraNacional, ItemNBS, ServicoFiscal } from '../types/fiscal';
import { storageService } from '../services/storageService';
import { capitulosNBSDict } from '../data/nbsData';

interface ExcelPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'prefeituras' | 'nbs' | 'servicos';
  onImportSuccess: () => void;
}

export const ExcelPasteModal: React.FC<ExcelPasteModalProps> = ({
  isOpen,
  onClose,
  targetType,
  onImportSuccess
}) => {
  const [pastedText, setPastedText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCNPJ = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length === 14) {
      return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return val.trim();
  };

  const formatPopulacao = (raw: string): string => {
    const clean = raw.trim();
    if (!clean) return '';
    // Se já está formatado com pontos (ex: 20.763 ou 1.234.567)
    if (/^\d{1,3}(\.\d{3})+$/.test(clean)) return clean;
    // Se for apenas dígitos inteiros
    const num = parseInt(clean.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      return num.toLocaleString('pt-BR');
    }
    return clean;
  };

  const splitCols = (line: string): string[] => {
    if (line.includes('\t')) return line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
    if (line.includes(';')) return line.split(';').map(c => c.trim().replace(/^"|"$/g, ''));
    if (line.includes(',')) return line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (/\s{2,}/.test(line)) return line.split(/\s{2,}/).map(c => c.trim().replace(/^"|"$/g, ''));
    return [line.trim()];
  };

  const handleParse = () => {
    setPreviewError(null);
    setSaveError(null);
    setSaveSuccess(false);

    if (!pastedText.trim()) {
      setPreviewError('Cole o conteúdo da planilha do Excel antes de processar.');
      return;
    }

    const lines = pastedText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      setPreviewError('Nenhuma linha encontrada no texto colado.');
      return;
    }

    const items: any[] = [];
    const validUFs = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
    const validRegioes = ['Centro-Oeste', 'Sudeste', 'Sul', 'Nordeste', 'Norte', 'CENTRO-OESTE', 'SUDESTE', 'SUL', 'NORDESTE', 'NORTE'];

    // Header column detection for prefeituras
    const prefColMap: { [key: string]: number } = {};
    let hasDetectedPrefHeader = false;

    if (targetType === 'prefeituras' && lines.length > 0) {
      const firstLineCols = splitCols(lines[0]);
      const headerNames = firstLineCols.map(c => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''));
      
      headerNames.forEach((h, idx) => {
        if (h.includes('regiao')) prefColMap['regiao'] = idx;
        else if (h === 'uf' || h === 'estado' || h === 'sigla') prefColMap['uf'] = idx;
        else if (h.includes('nomemunicipio') || h.includes('municipio') || h.includes('cidade') || h.includes('nome')) prefColMap['cidade'] = idx;
        else if (h.includes('cnpj')) prefColMap['cnpj'] = idx;
        else if (h.includes('apitd') || h.includes('aptid') || h.includes('apto') || h.includes('adesao') || h === 'status') prefColMap['aptidao'] = idx;
        else if (h.includes('statusconvenio') || h.includes('sefin') || h.includes('convenio')) prefColMap['statusConvenio'] = idx;
        else if (h.includes('ambiente') || h.includes('ambientenacional')) prefColMap['ambienteNacional'] = idx;
        else if (h.includes('emissornacional')) prefColMap['emissorNacional'] = idx;
        else if (h.includes('man') || h.includes('aderenteman')) prefColMap['man'] = idx;
        else if (h.includes('ativonabase') || h.includes('base')) prefColMap['ativoBase'] = idx;
        else if (h.includes('ultimoperiodo') || h.includes('ultimo')) prefColMap['ativoUltimo'] = idx;
        else if (h.includes('popula') || h.includes('habitant') || h.includes('qtde') || h.includes('qtd') || h === 'pop') prefColMap['populacao'] = idx;
        else if (h.includes('ibge')) prefColMap['ibge'] = idx;
      });

      if (prefColMap['cidade'] !== undefined || prefColMap['cnpj'] !== undefined || prefColMap['uf'] !== undefined || prefColMap['regiao'] !== undefined) {
        hasDetectedPrefHeader = true;
      }
    }

    const startIndex = hasDetectedPrefHeader ? 1 : 0;

    // Parse each line
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = splitCols(line);

      // Ignore accidental header repetition
      const lowerFirst = cols[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (i === 0 && (lowerFirst.includes('regiao') || lowerFirst.includes('municipio') || lowerFirst.includes('cidade') || lowerFirst === 'uf' || lowerFirst.includes('codigo') || lowerFirst.includes('item'))) {
        continue;
      }

      if (targetType === 'prefeituras') {
        let detectedRegiao = '';
        let detectedUf = '';
        let detectedCidade = '';
        let detectedCnpj = '';
        let detectedStatusConvenio = 'Conveniado Ativo';
        let detectedAmbienteNacional = 'Sim';
        let detectedEmissorNacional = 'Não';
        let detectedMAN = 'Não';
        let detectedAtivoBase = 'Sim';
        let detectedAtivoUltimo = 'Sim';
        let detectedPopulacao = '';
        let detectedIbge = '';
        let rawAptidao = '';

        if (hasDetectedPrefHeader) {
          // Use column map
          if (prefColMap['regiao'] !== undefined) detectedRegiao = cols[prefColMap['regiao']] || '';
          if (prefColMap['uf'] !== undefined) detectedUf = (cols[prefColMap['uf']] || '').toUpperCase().trim();
          if (prefColMap['cidade'] !== undefined) detectedCidade = (cols[prefColMap['cidade']] || '').toUpperCase().trim();
          if (prefColMap['cnpj'] !== undefined) detectedCnpj = formatCNPJ(cols[prefColMap['cnpj']] || '');
          if (prefColMap['aptidao'] !== undefined) rawAptidao = cols[prefColMap['aptidao']] || '';
          if (prefColMap['statusConvenio'] !== undefined) detectedStatusConvenio = cols[prefColMap['statusConvenio']] || '';
          if (prefColMap['ambienteNacional'] !== undefined) detectedAmbienteNacional = cols[prefColMap['ambienteNacional']] || 'Sim';
          if (prefColMap['emissorNacional'] !== undefined) detectedEmissorNacional = cols[prefColMap['emissorNacional']] || 'Não';
          if (prefColMap['man'] !== undefined) detectedMAN = cols[prefColMap['man']] || 'Não';
          if (prefColMap['ativoBase'] !== undefined) detectedAtivoBase = cols[prefColMap['ativoBase']] || 'Sim';
          if (prefColMap['ativoUltimo'] !== undefined) detectedAtivoUltimo = cols[prefColMap['ativoUltimo']] || 'Sim';
          if (prefColMap['populacao'] !== undefined) detectedPopulacao = formatPopulacao(cols[prefColMap['populacao']] || '');
          if (prefColMap['ibge'] !== undefined) detectedIbge = cols[prefColMap['ibge']] || '';
        } else {
          // Positional Layout Detection
          const col0 = (cols[0] || '').trim();
          const col1 = (cols[1] || '').trim();
          const col2 = (cols[2] || '').trim();
          const col3 = (cols[3] || '').trim();
          const col4 = (cols[4] || '').trim();

          const isCol0UF = validUFs.includes(col0.toUpperCase());
          const cleanCNPJ2 = col2.replace(/\D/g, '');
          const cleanCNPJ3 = col3.replace(/\D/g, '');

          // Padrão do usuário: UF | Município | CNPJ | Aptidão | População
          // Ex: CE | CHOROZINHO | 23555279000175 | Não | 20.763
          if (isCol0UF && cleanCNPJ2.length >= 11 && cleanCNPJ2.length <= 14) {
            detectedUf = col0.toUpperCase();
            detectedCidade = col1.toUpperCase();
            detectedCnpj = formatCNPJ(col2);
            rawAptidao = col3;
            detectedPopulacao = formatPopulacao(col4);
          } else {
            const isCol0Regiao = validRegioes.some(r => col0.toLowerCase().includes(r.toLowerCase())) || col0.includes('-') || col0.toLowerCase().includes('oeste') || col0.toLowerCase().includes('sul') || col0.toLowerCase().includes('norte') || col0.toLowerCase().includes('sudeste');
            const isCol1UF = validUFs.includes(col1.toUpperCase());

            if (isCol0Regiao || isCol1UF) {
              // Layout SEFIN: Região | UF | NomeMunicipio | CNPJ | StatusConvenioSEFIN | Ambiente | Emissor | MAN | Base | Ultimo | Populacao
              detectedRegiao = col0;
              detectedUf = col1.toUpperCase();
              detectedCidade = col2.toUpperCase();
              detectedCnpj = formatCNPJ(col3);
              detectedStatusConvenio = cols[4] || 'Conveniado Ativo';
              detectedAmbienteNacional = cols[5] || 'Sim';
              detectedEmissorNacional = cols[6] || 'Não';
              detectedMAN = cols[7] || 'Não';
              detectedAtivoBase = cols[8] || 'Sim';
              detectedAtivoUltimo = cols[9] || 'Sim';
              detectedPopulacao = formatPopulacao(cols[10] || '');
            } else if (validUFs.includes(col0.toUpperCase()) && /^\d{6,7}$/.test(col1.replace(/\D/g, ''))) {
              // Layout IBGE: UF | IBGE | Cidade | CNPJ | Adesão | Produção | População
              detectedUf = col0.toUpperCase();
              detectedIbge = col1.replace(/\D/g, '');
              detectedCidade = col2.toUpperCase();
              detectedCnpj = formatCNPJ(col3);
              const adesaoSim = (cols[4] || '').toLowerCase().includes('sim');
              const prodSim = (cols[5] || '').toLowerCase().includes('sim');
              detectedStatusConvenio = adesaoSim ? 'Conveniado Ativo' : 'Não Conveniado';
              detectedAmbienteNacional = adesaoSim ? 'Sim' : 'Não';
              detectedEmissorNacional = prodSim ? 'Sim' : 'Não';
              detectedPopulacao = formatPopulacao(cols[6] || '');
            } else {
              // Varredura heurística genérica
              for (let c = 0; c < cols.length; c++) {
                const val = cols[c].trim();
                if (!val) continue;

                const digits = val.replace(/\D/g, '');
                if (!detectedCnpj && digits.length === 14) {
                  detectedCnpj = formatCNPJ(val);
                  continue;
                }
                if (!detectedUf && val.length === 2 && validUFs.includes(val.toUpperCase())) {
                  detectedUf = val.toUpperCase();
                  continue;
                }
                if (!detectedRegiao && validRegioes.some(r => val.toLowerCase().includes(r.toLowerCase()))) {
                  detectedRegiao = val;
                  continue;
                }
                if (!detectedPopulacao && (/^\d{1,3}(\.\d{3})+$/.test(val) || (digits.length >= 3 && digits.length <= 8 && c >= 3))) {
                  detectedPopulacao = formatPopulacao(val);
                  continue;
                }
                if (!detectedCidade && val.length > 2 && isNaN(Number(val)) && !validUFs.includes(val.toUpperCase()) && !validRegioes.some(r => val.toLowerCase().includes(r.toLowerCase()))) {
                  detectedCidade = val.toUpperCase();
                }
              }
            }
          }
        }

        // Dedução automática da Região geográfica
        if (!detectedRegiao && detectedUf) {
          if (['DF', 'GO', 'MT', 'MS'].includes(detectedUf)) detectedRegiao = 'Centro-Oeste';
          else if (['SP', 'RJ', 'MG', 'ES'].includes(detectedUf)) detectedRegiao = 'Sudeste';
          else if (['PR', 'SC', 'RS'].includes(detectedUf)) detectedRegiao = 'Sul';
          else if (['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'PI', 'AL', 'SE'].includes(detectedUf)) detectedRegiao = 'Nordeste';
          else if (['AM', 'PA', 'RO', 'TO', 'AC', 'AP', 'RR'].includes(detectedUf)) detectedRegiao = 'Norte';
        }

        // Interpretação do Status de Aptidão
        let finalStatus: 'Apta' | 'Em Adequação' | 'Não Aderiu';
        let finalEmissor: 'Padrão Nacional' | 'Webservice Municipal';
        let finalProvedor: string;

        if (rawAptidao) {
          const lowerApt = rawAptidao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          if (lowerApt.startsWith('n') || lowerApt.includes('inapta') || lowerApt.includes('nao aderiu') || lowerApt.includes('nao conveniado')) {
            finalStatus = 'Não Aderiu';
            finalEmissor = 'Webservice Municipal';
            finalProvedor = 'Webservice Municipal';
            detectedAmbienteNacional = 'Não';
            detectedStatusConvenio = 'Não Conveniado';
          } else if (lowerApt.includes('adeq') || lowerApt.includes('homol')) {
            finalStatus = 'Em Adequação';
            finalEmissor = 'Webservice Municipal';
            finalProvedor = 'Webservice Municipal';
            detectedAmbienteNacional = 'Sim';
            detectedStatusConvenio = 'Conveniado Ativo';
          } else {
            // "Sim", "Apta", "S", etc.
            finalStatus = 'Apta';
            finalEmissor = 'Padrão Nacional';
            finalProvedor = 'Ambiente Nacional (API/DPS)';
            detectedAmbienteNacional = 'Sim';
            detectedStatusConvenio = 'Conveniado Ativo';
          }
        } else {
          const isAmbienteSim = detectedAmbienteNacional.toLowerCase().includes('sim');
          const isEmissorSim = detectedEmissorNacional.toLowerCase().includes('sim');
          const isConveniado = detectedStatusConvenio.toLowerCase().includes('conveniado');

          if (isAmbienteSim || isConveniado) {
            finalStatus = 'Apta';
            finalEmissor = isEmissorSim ? 'Padrão Nacional' : 'Padrão Nacional';
            finalProvedor = isEmissorSim ? 'Emissor Nacional (SND)' : 'Ambiente Nacional (API/DPS)';
          } else {
            finalStatus = 'Não Aderiu';
            finalEmissor = 'Webservice Municipal';
            finalProvedor = 'Webservice Municipal';
          }
        }

        if (detectedCidade && !detectedCidade.includes('MUNICIPIO') && !detectedCidade.includes('CIDADE') && !detectedCidade.includes('NOME')) {
          const pref: PrefeituraNacional = {
            id: `pref-${detectedUf}-${detectedCidade}`.replace(/[\/\s#?\[\]]/g, '_'),
            cidade: detectedCidade,
            uf: detectedUf || 'DF',
            regiao: detectedRegiao || 'Centro-Oeste',
            cnpj: detectedCnpj,
            statusConvenioSEFIN: detectedStatusConvenio,
            aderenteAmbienteNacional: detectedAmbienteNacional,
            aderenteEmissorNacional: detectedEmissorNacional,
            aderenteMAN: detectedMAN,
            ativoNaBase: detectedAtivoBase,
            ativoUltimoPeriodo: detectedAtivoUltimo,
            populacao: detectedPopulacao,
            status: finalStatus,
            emissor: finalEmissor,
            provedor: finalProvedor,
            codigoIbge: detectedIbge
          };
          items.push(pref);
        }
      } else if (targetType === 'nbs') {
        let codigo = '';
        let descricao = '';
        let capNum = '';

        // Tenta captura por regex caso copiado de PDF (ex: "1.1805.21.00  Serviços de reservas...")
        const pdfLineMatch = line.match(/^([12]\.\d+(?:\.\d+)*)\s{1,}(.+)$/);
        if (pdfLineMatch) {
          codigo = pdfLineMatch[1].trim();
          descricao = pdfLineMatch[2].trim();
        } else if (cols.length >= 2) {
          codigo = (cols[0] || '').trim();
          descricao = (cols[1] || '').trim();
          if (cols[2]) {
            capNum = cols[2].replace(/\D/g, '').slice(0, 2).padStart(2, '0');
          }
        }

        // Se por ventura os dados estiverem invertidos
        if (!/^[12]\.\d+/.test(codigo) && /^[12]\.\d+/.test(descricao)) {
          const temp = codigo;
          codigo = descricao;
          descricao = temp;
        }

        // Capítulo automático: extrai os 2 primeiros dígitos após o prefixo (ex: 1.1805.21.00 -> 18)
        if (!capNum) {
          const matchCap = codigo.match(/^[12]\.(\d{2})/);
          if (matchCap && matchCap[1]) {
            capNum = matchCap[1];
          } else {
            capNum = '01';
          }
        }

        if (codigo && descricao && (/^[12]\./.test(codigo) || /^\d/.test(codigo))) {
          const nbsItem: ItemNBS = {
            codigo,
            descricao,
            capitulo: capNum,
            nomeCapitulo: capitulosNBSDict[capNum] || `Capítulo ${capNum}`,
            statusApta: true
          };
          items.push(nbsItem);
        }
      } else if (targetType === 'servicos') {
        const codAntigo = cols[0] || 'N/A';
        const codNovo = cols[1] || cols[0] || '';
        const itemLC116 = cols[2] || '01.01';
        const descricao = cols[3] || cols[2] || '';
        const nbs = cols[4] || '1.1502.20.00';
        const aliqRaw = parseFloat((cols[5] || '2').replace(',', '.'));
        const aliquota = isNaN(aliqRaw) ? 2.0 : aliqRaw;
        const retencaoRaw = (cols[6] || '').toLowerCase();
        const retencao: 'Sim' | 'Não' | 'Depende do Local' = retencaoRaw.includes('sim') ? 'Sim' : retencaoRaw.includes('dep') ? 'Depende do Local' : 'Não';
        const local = (cols[7] || 'Local do Prestador') as any;

        if (descricao) {
          const srv: ServicoFiscal = {
            id: `srv-excel-${Date.now()}-${i}`,
            codigoAntigo: codAntigo,
            codigoNovo: codNovo,
            itemLC116,
            descricao,
            nbs,
            aliquotaSugerida: aliquota,
            retencaoISS: retencao,
            localIncidencia: local,
            permiteDeducao: false,
            baseLegal: `LC 116/2003 Item ${itemLC116}`
          };
          items.push(srv);
        }
      }
    }

    if (items.length === 0) {
      setPreviewError('Nenhum registro válido pôde ser extraído das colunas informadas.');
      return;
    }

    setParsedPreview(items);
  };

  const handleConfirmImport = async () => {
    if (parsedPreview.length === 0 || isSaving) return;

    setIsSaving(true);
    setSaveProgress(15);
    setSaveError(null);

    try {
      if (targetType === 'prefeituras') {
        await storageService.batchImportPrefeituras(
          parsedPreview as PrefeituraNacional[],
          importMode,
          (percent) => setSaveProgress(percent)
        );
      } else if (targetType === 'nbs') {
        await storageService.batchImportNbs(
          parsedPreview as ItemNBS[],
          importMode,
          (percent) => setSaveProgress(percent)
        );
      } else if (targetType === 'servicos') {
        await storageService.batchImportServicos(
          parsedPreview as ServicoFiscal[],
          importMode,
          (percent) => setSaveProgress(percent)
        );
      }

      setSaveProgress(100);
      setSaveSuccess(true);

      setTimeout(() => {
        onImportSuccess();
        onClose();
        setIsSaving(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err) {
      console.error('Erro ao gravar diretamente no banco de dados:', err);
      setSaveError(
        err instanceof Error 
          ? err.message 
          : 'Ocorreu um erro ao salvar os registros no banco de dados Firestore.'
      );
      setIsSaving(false);
    }
  };

  const titleMap = {
    prefeituras: 'Importar / Colar Tabela de Prefeituras (Padrão Nacional)',
    nbs: 'Importar / Colar Tabela de NBS Aptas (Excel)',
    servicos: 'Importar / Colar Tabela de Serviços Fiscais (Excel)'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] p-6 shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">{titleMap[targetType]}</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-2.5 h-2.5" />
                  Salva Direto no Banco
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Copie as linhas da sua tabela do Excel e cole abaixo para gravação automática no banco de dados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
          {/* Format guide banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                Formato suportado direto do Excel:
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">Separado por Tabulação (Ctrl+C no Excel)</span>
            </div>
            {targetType === 'prefeituras' ? (
              <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10.5px] text-slate-800 overflow-x-auto space-y-0.5">
                <div className="text-slate-400 font-bold border-b border-slate-100 pb-0.5">
                  UF &nbsp;&nbsp; Municipio &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CNPJ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Apitdão &nbsp;&nbsp; Populacao
                </div>
                <div className="text-slate-700 font-bold">
                  CE &nbsp;&nbsp; CHOROZINHO &nbsp;&nbsp;&nbsp;&nbsp; 23555279000175 &nbsp; Não &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 20.763
                </div>
              </div>
            ) : targetType === 'nbs' ? (
              <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[10.5px] text-slate-800 overflow-x-auto space-y-0.5">
                <div className="text-slate-400 font-bold border-b border-slate-100 pb-0.5">
                  Código NBS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Descrição Oficial da NBS
                </div>
                <div className="text-slate-700 font-bold">
                  1.1805.21.00 &nbsp;&nbsp; Serviços de reservas de hospedagem, exceto em unidades compartilhadas
                </div>
                <div className="text-slate-700 font-bold">
                  1.1805.22.00 &nbsp;&nbsp; Serviços de reservas e intercâmbio de unidades compartilhadas (time-share)
                </div>
                <div className="text-slate-700 font-bold">
                  1.1805.3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Outros serviços de reservas
                </div>
              </div>
            ) : (
              <p className="text-slate-500 font-mono text-[10.5px]">
                Copie as colunas da planilha e cole na caixa abaixo.
              </p>
            )}
            <p className="text-slate-500 text-[10.5px]">
              {targetType === 'prefeituras'
                ? 'O sistema reconhece automaticamente o nome da cidade, o CNPJ com ou sem máscara, a aptidão (Sim / Não / Apta) e a quantidade de população informada.'
                : targetType === 'nbs'
                ? 'Você pode copiar as linhas diretamente do PDF ou do Excel contendo o Código e a Descrição do serviço NBS.'
                : 'Copie a lista de serviços fiscais da sua planilha para importação em lote.'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 block text-xs">
                Área de Colagem do Excel:
              </label>
              <span className="text-[10px] text-slate-400">Ctrl + V aqui</span>
            </div>
            <textarea
              rows={6}
              disabled={isSaving}
              value={pastedText}
              onChange={e => {
                setPastedText(e.target.value);
                setParsedPreview([]);
                setPreviewError(null);
                setSaveError(null);
              }}
              placeholder={`UF\tMunicipio\tCNPJ\tApitdão\tPopulacao\nCE\tCHOROZINHO\t23555279000175\tNão\t20.763\nMG\tBELO HORIZONTE\t18715383000140\tSim\t2.315.560`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 text-xs">Modo no Banco de Dados:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="mode"
                  disabled={isSaving}
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-red-600 focus:ring-red-500"
                />
                <span>Mesclar / Atualizar existentes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="mode"
                  disabled={isSaving}
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-red-600 font-semibold">Substituir tabela inteira</span>
              </label>
            </div>

            <button
              onClick={handleParse}
              disabled={isSaving || !pastedText.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Processar Linhas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {previewError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {isSaving && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Gravando diretamente no Banco de Dados Firestore...</span>
                </div>
                <span className="font-mono text-emerald-700">{saveProgress}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${saveProgress}%` }}
                ></div>
              </div>
              <p className="text-[10.5px] text-emerald-700">
                Sincronizando lote de {parsedPreview.length} municípios com a nuvem...
              </p>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">Dados salvos com sucesso!</p>
                <p className="text-xs text-emerald-100">
                  Os registros foram gravados diretamente no banco de dados Cloud Firestore e já estão disponíveis.
                </p>
              </div>
            </div>
          )}

          {parsedPreview.length > 0 && !isSaving && !saveSuccess && (
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{parsedPreview.length} registros prontos para gravar no Banco de Dados</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-normal">
                  Confira a prévia abaixo:
                </span>
              </div>

              {/* Sample preview table */}
              <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-xs">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px] border-collapse font-sans">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                      {targetType === 'prefeituras' ? (
                        <tr>
                          <th className="py-2 px-3">UF</th>
                          <th className="py-2 px-3">Município</th>
                          <th className="py-2 px-3">CNPJ</th>
                          <th className="py-2 px-3">Aptidão</th>
                          <th className="py-2 px-3">População</th>
                        </tr>
                      ) : targetType === 'nbs' ? (
                        <tr>
                          <th className="py-2 px-3">Código NBS</th>
                          <th className="py-2 px-3">Descrição Oficial</th>
                          <th className="py-2 px-3">Capítulo</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="py-2 px-3">Cód. Novo</th>
                          <th className="py-2 px-3">LC 116</th>
                          <th className="py-2 px-3">Descrição</th>
                          <th className="py-2 px-3">NBS</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {parsedPreview.slice(0, 8).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          {targetType === 'prefeituras' ? (
                            <>
                              <td className="py-1.5 px-3">
                                <span className="font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px]">
                                  {item.uf}
                                </span>
                              </td>
                              <td className="py-1.5 px-3 font-bold text-slate-900">{item.cidade}</td>
                              <td className="py-1.5 px-3 font-mono text-[10px] text-slate-600">{item.cnpj || '—'}</td>
                              <td className="py-1.5 px-3">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === 'Apta'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-1.5 px-3 font-mono text-slate-700">
                                {item.populacao ? (
                                  <span className="inline-flex items-center gap-1 text-slate-800 font-semibold">
                                    <Users className="w-2.5 h-2.5 text-slate-400" />
                                    {item.populacao} hab.
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            </>
                          ) : targetType === 'nbs' ? (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                                {item.codigo}
                              </td>
                              <td className="py-1.5 px-3 text-slate-800">
                                {item.descricao}
                              </td>
                              <td className="py-1.5 px-3 whitespace-nowrap text-slate-600">
                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">
                                  Cap. {item.capitulo}
                                </span>
                              </td>
                              <td className="py-1.5 px-3">
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                  Apta
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{item.codigoNovo}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-700">{item.itemLC116}</td>
                              <td className="py-1.5 px-3 text-slate-800">{item.descricao}</td>
                              <td className="py-1.5 px-3 font-mono text-red-600">{item.nbs}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedPreview.length > 8 && (
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10.5px] text-slate-500 text-center font-medium">
                    ... e mais {parsedPreview.length - 8} itens adicionais no lote.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Banco de Dados: <strong>Cloud Firestore</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedPreview.length === 0 || isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gravando no Banco ({saveProgress}%)...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Salvar Diretamente no Banco de Dados {parsedPreview.length > 0 ? `(${parsedPreview.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
