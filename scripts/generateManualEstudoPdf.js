import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
const margin = 16;
const contentWidth = pageWidth - (margin * 2); // 178mm

// Color Palette
const COLOR_PRIMARY = [15, 23, 42];   // Slate 900
const COLOR_SECONDARY = [30, 41, 59]; // Slate 800
const COLOR_RED = [220, 38, 38];      // Red 600
const COLOR_TEXT = [51, 65, 85];      // Slate 700
const COLOR_MUTED = [100, 116, 139];  // Slate 500
const COLOR_BG_LIGHT = [248, 250, 252]; // Slate 50
const COLOR_BG_CODE = [241, 245, 249];  // Slate 100
const COLOR_BORDER = [226, 232, 240]; // Slate 200

function drawHeader(title, subtitle, pageNum, totalPages) {
  // Top Banner
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Red accent line
  doc.setFillColor(...COLOR_RED);
  doc.rect(0, 28, pageWidth, 1.8, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PORTAL FISCAL — GUIA DE ESTUDO & ARQUITETURA TÉCNICA', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(248, 113, 113);
  doc.text(subtitle || 'Documentação Completa de Arquitetura, Pastas, Código e Manutenção Manual', margin, 18);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text(`Autor: André Barbosa • ATS Informática • NFSe Fiscal`, margin, 24);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 22, 24);
}

function drawFooter(pageNum, totalPages) {
  const y = pageHeight - 10;
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 3, pageWidth - margin, y - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Portal NFSe Fiscal • Guia de Engenharia de Software e Manutenção Manual', margin, y + 1);
  doc.text(`Pág. ${pageNum}/${totalPages}`, pageWidth - margin - 15, y + 1);
}

const TOTAL_PAGES = 4;

// ==========================================
// PÁGINA 1: MAPA GERAL E ESTRUTURA DE PASTAS
// ==========================================
drawHeader('PORTAL FISCAL', 'Módulo 1: Visão Geral da Arquitetura & Mapeamento de Arquivos', 1, TOTAL_PAGES);

let y = 37;

// Section Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...COLOR_RED);
doc.text('1. VISÃO GERAL DO PROJETO & TECNOLOGIAS', margin, y);
y += 2;
doc.setDrawColor(...COLOR_BORDER);
doc.line(margin, y, pageWidth - margin, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...COLOR_TEXT);
const p1 = 'O Portal NFSe Fiscal é uma Single Page Application (SPA) construída com React 19, TypeScript e Vite, estilizada com Tailwind CSS e sincronizada em tempo real com o Google Cloud Firestore. Esta documentação serve como guia de estudo para que você entenda exatamente onde cada funcionalidade está implementada e como realizar manutenções manuais seguras.';
const splitP1 = doc.splitTextToSize(p1, contentWidth);
doc.text(splitP1, margin, y);
y += (splitP1.length * 4.2) + 4;

// Section Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...COLOR_RED);
doc.text('2. ÁRVORE COMPLETA DE DIRETÓRIOS E SUAS FINALIDADES', margin, y);
y += 2;
doc.setDrawColor(...COLOR_BORDER);
doc.line(margin, y, pageWidth - margin, y);
y += 6;

const folders = [
  {
    folder: 'src/components/',
    desc: 'Contém todas as telas visuais, tabelas, modais, formulários de cadastro e navegação.',
    files: 'ServicosModule.tsx, NBSModule.tsx, PrefeiturasModule.tsx, DetailModal.tsx, Sidebar.tsx, AdminAuthModal.tsx'
  },
  {
    folder: 'src/context/',
    desc: 'Gerenciamento de estado global. Controla o login de administrador e emissão de tokens de sessão.',
    files: 'AuthContext.tsx (validação SHA-256 + Salt, bloqueio de tentativas e Firebase Auth oficial)'
  },
  {
    folder: 'src/data/',
    desc: 'Bancos de dados iniciais estáticos (arquivos TypeScript com arrays de objetos).',
    files: 'servicosData.ts (LC 116 e DPS), nbsData.ts (Catálogo NBS), prefeiturasData.ts (Cidades aderidas)'
  },
  {
    folder: 'src/services/',
    desc: 'Camada de conexão e sincronização com serviços externos e banco na nuvem.',
    files: 'firestoreService.ts (operações de leitura, inclusão e sincronização em tempo real)'
  },
  {
    folder: 'src/types/',
    desc: 'Tipagens estritas do TypeScript. Define o formato de cada dado para evitar erros de compilação.',
    files: 'index.ts (interfaces: ServicoFiscal, NBSItem, PrefeituraItem, AdminConfig, etc.)'
  },
  {
    folder: 'src/utils/',
    desc: 'Funções utilitárias reaproveitáveis de segurança, criptografia e formatação.',
    files: 'cryptoUtils.ts (hashing SHA-256 e geração de salt), securityGuard.ts (anti-F12, anti-inspeção)'
  },
  {
    folder: 'public/',
    desc: 'Arquivos públicos servidos diretamente pelo servidor sem processamento do Vite.',
    files: 'apresentacao.html, NFSe_Fiscal_Apresentacao.pdf, favicon, manifest PWA'
  },
  {
    folder: 'scripts/',
    desc: 'Scripts auxiliares em Node.js para tarefas de automação, geração de PDFs e build.',
    files: 'generatePdf.js, generateManualEstudoPdf.js'
  }
];

folders.forEach((item) => {
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(item.folder, margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(item.desc, margin + 40, y + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(`Arquivos: ${item.files}`, margin + 3, y + 10.5);

  y += 16;
});

// Arquivos Raiz
y += 2;
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...COLOR_PRIMARY);
doc.text('Arquivos Críticos na Raiz do Projeto:', margin, y);
y += 4.5;

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...COLOR_TEXT);
const rootFilesDesc = [
  '• firestore.rules: Regras de segurança no Google Cloud. Bloqueia deleções e exige token oficial para gravação.',
  '• vite.config.ts: Configurações do bundler Vite, portas de execução e desativação de sourcemaps.',
  '• vercel.json: Regra de rewrite SPA para evitar erro 404 ao recarregar rotas na hospedagem Vercel.',
  '• firebase-applet-config.json: Credenciais do projeto Firebase (projectId, databaseId, apiKey).'
];
rootFilesDesc.forEach(line => {
  doc.text(line, margin + 2, y);
  y += 4;
});

drawFooter(1, TOTAL_PAGES);

// ==========================================
// PÁGINA 2: COMPONENTES VISUAIS & INTERFACE
// ==========================================
doc.addPage();
drawHeader('PORTAL FISCAL', 'Módulo 2: Onde Cada Tela Visual Está Guardada e Como Editar', 2, TOTAL_PAGES);

y = 37;

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...COLOR_RED);
doc.text('3. COMPONENTES DE INTERFACE (src/components/)', margin, y);
y += 2;
doc.setDrawColor(...COLOR_BORDER);
doc.line(margin, y, pageWidth - margin, y);
y += 6;

const componentsList = [
  {
    name: 'ServicosModule.tsx — Tabela de Serviços Fiscais LC 116 / DPS',
    desc: 'É a tela principal do sistema. Gerencia os filtros por código legado, código DPS, alíquotas e retenção.',
    details: [
      '• Onde mudar colunas: Dentro do elemento <table><thead><tr>.',
      '• Onde mudar os cards mobile: Na seção <div className="md:hidden">.',
      '• Formulário de cadastro de novo serviço: No modal interno acionado pelo botão "+ Adicionar Serviço".',
      '• Como os dados chegam: Recebe a lista via props "servicos" e dispara filtros no estado local searchTerm.'
    ]
  },
  {
    name: 'NBSModule.tsx — Catálogo Oficial da NBS',
    desc: 'Módulo dedicado à Nomenclatura Brasileira de Serviços da Receita Federal.',
    details: [
      '• Estrutura: Agrupa os códigos por Capítulos (ex: Cap. 15, 16).',
      '• Busca instantânea: Filtro por código formatado ou texto descritivo.',
      '• Cópia em 1 clique: Função "handleCopy" usa navigator.clipboard.writeText para colar no ERP.',
      '• Como editar textos: Altere os headers e badges nas linhas 70 a 100.'
    ]
  },
  {
    name: 'PrefeiturasModule.tsx — Monitor do Padrão Nacional',
    desc: 'Acompanhamento em tempo real da lista de cidades integradas ao sistema nacional DPS.',
    details: [
      '• Cards informativos no topo: Total de cidades cadastradas e estados atendidos.',
      '• Filtros: Filtro rápido por Unidade Federativa (UF) e barra de busca de município.',
      '• Tabela e Grid: Listagem visual com badges verdes indicando adesão ao padrão nacional.'
    ]
  },
  {
    name: 'DetailModal.tsx — Ficha Técnica Completa do Serviço',
    desc: 'Janela modal que se abre ao clicar sobre qualquer linha de serviço fiscal.',
    details: [
      '• Exibe: Base Legal (LC 116), Código DPS Nacional, Alíquota de ISS sugerida e Exigibilidade de Retenção.',
      '• Vínculo NBS: Exibe o código da NBS associado com botão de cópia direta.',
      '• Explicação Didática: Campo "explicacao" detalha a regra tributária e o local de incidência do imposto.'
    ]
  },
  {
    name: 'Sidebar.tsx — Navegação Lateral e Drawer Mobile',
    desc: 'Barra lateral persistente no desktop e menu gaveta com overlay em telas mobile.',
    details: [
      '• Botões de navegação: Alterna a tela ativa através da função "setActiveTab".',
      '• Botão de Login: Abre o AdminAuthModal para autenticação de administrador.',
      '• Link de Apresentação: Botão para abrir a apresentação técnica e baixar o PDF oficial.'
    ]
  },
  {
    name: 'AdminAuthModal.tsx — Modal de Login e Proteção Administrativa',
    desc: 'Interface de autenticação do usuário mestre ("Fiscal").',
    details: [
      '• Campos: Nome de usuário e senha mestra.',
      '• Tratamento de erros: Exibe contagem regressiva de bloqueio se houver 5 tentativas incorretas.',
      '• Redefinição: Permite alterar a senha mediante confirmação da senha anterior.'
    ]
  }
];

componentsList.forEach(comp => {
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.roundedRect(margin, y, contentWidth, 23.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(comp.name, margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(comp.desc, margin + 3, y + 8.5);

  let bulletY = y + 12;
  comp.details.forEach(d => {
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(d, margin + 4, bulletY);
    bulletY += 2.8;
  });

  y += 25.5;
});

drawFooter(2, TOTAL_PAGES);

// ==========================================
// PÁGINA 3: DADOS, BANCO E SEGURANÇA BLINDADA
// ==========================================
doc.addPage();
drawHeader('PORTAL FISCAL', 'Módulo 3: Banco de Dados na Nuvem, Sincronização & Segurança', 3, TOTAL_PAGES);

y = 37;

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...COLOR_RED);
doc.text('4. FLUXO DE DADOS & GOOGLE CLOUD FIRESTORE', margin, y);
y += 2;
doc.setDrawColor(...COLOR_BORDER);
doc.line(margin, y, pageWidth - margin, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...COLOR_TEXT);
const pData = 'A aplicação opera com uma arquitetura híbrida de alta resiliência: se houver conexão com o Firestore, ela consome e sincroniza em tempo real. Se o banco na nuvem estiver vazio ou a rede offline, os dados embutidos em "src/data/" são carregados automaticamente sem interromper a operação do usuário.';
const splitPData = doc.splitTextToSize(pData, contentWidth);
doc.text(splitPData, margin, y);
y += (splitPData.length * 4) + 3;

// Tabela de Coleções Firestore
doc.setFillColor(...COLOR_SECONDARY);
doc.rect(margin, y, contentWidth, 7, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.text('Coleção Firestore', margin + 3, y + 4.8);
doc.text('Arquivo Local de Origem', margin + 45, y + 4.8);
doc.text('Política de Segurança (firestore.rules)', margin + 105, y + 4.8);
y += 7;

const firestoreRows = [
  ['/servicos', 'src/data/servicosData.ts', 'Leitura pública • Gravação com Auth • Deleção PROIBIDA'],
  ['/nbs', 'src/data/nbsData.ts', 'Leitura pública • Gravação com Auth • Deleção PROIBIDA'],
  ['/prefeituras', 'src/data/prefeiturasData.ts', 'Leitura pública • Gravação com Auth • Deleção PROIBIDA'],
  ['/config', 'Protegido no servidor', 'Leitura e escrita 100% BLOQUEADAS pela web']
];

firestoreRows.forEach((r, idx) => {
  doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(...COLOR_BORDER);
  doc.rect(margin, y, contentWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(r[0], margin + 3, y + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(r[1], margin + 45, y + 4.2);

  doc.setFontSize(6.8);
  doc.setTextColor(r[2].includes('PROIBIDA') || r[2].includes('BLOQUEADAS') ? 185 : 40, 28, 28);
  doc.text(r[2], margin + 105, y + 4.2);

  y += 6;
});

y += 6;

// Section Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...COLOR_RED);
doc.text('5. ARQUITETURA DE SEGURANÇA E BLINDAGEM', margin, y);
y += 2;
doc.setDrawColor(...COLOR_BORDER);
doc.line(margin, y, pageWidth - margin, y);
y += 6;

const securityItems = [
  {
    title: 'A) Erradicação Total de Senhas em Texto Puro (src/context/AuthContext.tsx)',
    text: 'Nenhuma senha existe no código-fonte nem no arquivo compilado. A validação compara apenas o Hash SHA-256 gerado com um Salt dinâmico de 128 bits. Mesmo se alguém inspecionar o JavaScript ou pedir para uma IA analisar, a senha não pode ser descoberta.'
  },
  {
    title: 'B) Tokenização Oficial Firebase Authentication (Google Auth JWT)',
    text: 'Ao autenticar, o sistema chama signInAnonymously no Firebase Auth. O Google gera um token JWT criptografado. O acesso de administrador depende do estado oficial onAuthStateChanged, eliminando qualquer bypass por alteração de localStorage.'
  },
  {
    title: 'C) Regras no Servidor Google Cloud (firestore.rules)',
    text: 'A segurança real está no servidor da nuvem. O comando "allow delete: if false;" bloqueia qualquer tentativa de exclusão de dados. Apenas requisições autenticadas com o token ("isAuthenticated()") podem criar ou editar registros.'
  },
  {
    title: 'D) Proteção Anti-Força Bruta e Rate Limiting em Memória',
    text: 'Após 5 tentativas falhas de senha, o sistema trava o acesso por 5 minutos (300 segundos). O contador é mantido no ciclo de vida em memória, impossibilitando bypass ao limpar cookies ou alternar para abas anônimas.'
  },
  {
    title: 'E) Blindagem do Navegador (src/utils/securityGuard.ts & vite.config.ts)',
    text: 'Desativação de clique direito, atalhos de desenvolvedor (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S), armadilha anti-debugger, supressão de logs de console e compilação com sourcemap desativado para ocultar arquivos .tsx originais.'
  }
];

securityItems.forEach(item => {
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(item.title, margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_TEXT);
  const splitText = doc.splitTextToSize(item.text, contentWidth - 6);
  doc.text(splitText, margin + 3, y + 8.5);

  y += 20;
});

drawFooter(3, TOTAL_PAGES);

// ==========================================
// PÁGINA 4: GUIA PASSO A PASSO DE MANUTENÇÃO
// ==========================================
doc.addPage();
drawHeader('PORTAL FISCAL', 'Módulo 4: Guia Prático Passo a Passo de Manutenção Manual', 4, TOTAL_PAGES);

y = 37;

doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...COLOR_RED);
doc.text('6. COMO FAZER ALTERAÇÕES MANUAIS NO CÓDIGO (PASSO A PASSO)', margin, y);
y += 2;
doc.setDrawColor(...COLOR_BORDER);
doc.line(margin, y, pageWidth - margin, y);
y += 6;

const howTos = [
  {
    step: 'CENÁRIO 1: Quero cadastrar ou alterar um Serviço Fiscal na base padrão',
    file: 'Arquivo: src/data/servicosData.ts',
    instructions: [
      '1. Abra o arquivo src/data/servicosData.ts.',
      '2. Localize a constante "INITIAL_SERVICOS" (array de objetos).',
      '3. Adicione ou edite o objeto com as chaves: id, codigo, codigoTributacaoNacional, descricao, itemLc116, aliquotaSugerida, retencao, nbs, explicacao.',
      '4. Dica: Se quiser cadastrar pela tela, faça login com o usuário Fiscal e use o botão "+ Adicionar Serviço".'
    ]
  },
  {
    step: 'CENÁRIO 2: Quero adicionar novos códigos ao Catálogo NBS',
    file: 'Arquivo: src/data/nbsData.ts',
    instructions: [
      '1. Abra src/data/nbsData.ts.',
      '2. Cada capítulo possui seu título e uma lista de "itens".',
      '3. Para adicionar um novo código, insira no formato: { codigo: "1.0101.10.00", descricao: "Nome do serviço..." }.',
      '4. Salve o arquivo e a busca na tela de NBS já identificará o novo código instantaneamente.'
    ]
  },
  {
    step: 'CENÁRIO 3: Quero adicionar um novo Município ao Monitor Padrão Nacional',
    file: 'Arquivo: src/data/prefeiturasData.ts',
    instructions: [
      '1. Abra src/data/prefeiturasData.ts.',
      '2. Localize a lista "INITIAL_PREFEITURAS".',
      '3. Adicione o novo município: { id: "cidade-uf", cidade: "Nome da Cidade", uf: "UF", padraoNacional: true, versaoLayout: "DPS 1.00", dataAdesao: "2026-09-28" }.'
    ]
  },
  {
    step: 'CENÁRIO 4: Como compilar, testar e publicar em produção',
    file: 'Comandos do Terminal (Node.js & Git)',
    instructions: [
      '• Testar o build localmente: Execute "npm run build". O TypeScript valida se há algum erro de sintaxe.',
      '• Iniciar servidor de desenvolvimento: Execute "npm run dev" (abre a aplicação na porta local 3000).',
      '• Enviar para produção: git add . && git commit -m "feat: minha alteracao" && git push origin main.',
      '• Publicação automática: A Vercel detecta o push na branch main e atualiza o site no ar em segundos.'
    ]
  }
];

howTos.forEach(how => {
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.roundedRect(margin, y, contentWidth, 23, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(how.step, margin + 3, y + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLOR_RED);
  doc.text(how.file, margin + 3, y + 8.5);

  let lineY = y + 12;
  how.instructions.forEach(inst => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(inst, margin + 4, lineY);
    lineY += 2.6;
  });

  y += 25;
});

// Caixa de Resumo / Conclusão
y += 2;
doc.setFillColor(...COLOR_PRIMARY);
doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(255, 255, 255);
doc.text('DICA DE OURO PARA O DESENVOLVEDOR:', margin + 4, y + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(226, 232, 240);
const tip = 'Sempre que você alterar um arquivo TypeScript (.ts ou .tsx), rode o comando "npm run build" antes de enviar para o Git. Ele garante que não haja nenhuma chave faltando ou erro de digitação. Todo o código do projeto foi projetado de forma modular para que você possa evoluir o sistema com total confiança e sem riscos de quebrar o restante da aplicação.';
const splitTip = doc.splitTextToSize(tip, contentWidth - 8);
doc.text(splitTip, margin + 4, y + 9.5);

drawFooter(4, TOTAL_PAGES);

// Save file
const outputPath = path.resolve('public', 'Manual_Estudo_Arquitetura_NFSe_Fiscal.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log(`PDF gerado com sucesso em: ${outputPath}`);
