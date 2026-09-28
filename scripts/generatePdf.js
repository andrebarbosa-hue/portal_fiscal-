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
const margin = 18;
const contentWidth = pageWidth - (margin * 2);

// Colors
const COLOR_PRIMARY = [17, 24, 39]; // #111827 Dark Navy
const COLOR_RED = [220, 38, 38];     // #DC2626 Crimson Red
const COLOR_TEXT = [30, 41, 59];     // Slate 800
const COLOR_MUTED = [100, 116, 139]; // Slate 500
const COLOR_BG_LIGHT = [248, 250, 252]; // Slate 50
const COLOR_BORDER = [226, 232, 240];

// ================= PAGE 1 =================
// Top Banner
doc.setFillColor(...COLOR_PRIMARY);
doc.rect(0, 0, pageWidth, 42, 'F');

// Red accent stripe
doc.setFillColor(...COLOR_RED);
doc.rect(0, 42, pageWidth, 2.5, 'F');

// Header Text
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(20);
doc.text('NFSe Fiscal', margin, 18);

doc.setFont('helvetica', 'normal');
doc.setFontSize(11);
doc.setTextColor(248, 113, 113); // Light red
doc.text('PORTAL CORPORATIVO DE INTELIGÊNCIA TRIBUTÁRIA', margin, 26);

doc.setFontSize(9);
doc.setTextColor(203, 213, 225);
doc.text('Apresentação Técnica do Projeto • Arquitetura • Stack de Produção', margin, 34);

doc.setFont('helvetica', 'bold');
doc.text('Autor: André Antunes / André Barbosa', pageWidth - margin - 65, 34);

// Section: Visão Geral & Problema de Negócio
let y = 56;

doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...COLOR_RED);
doc.text('1. VISÃO GERAL & PROBLEMA DE NEGÓCIO', margin, y);

y += 3;
doc.setDrawColor(...COLOR_BORDER);
doc.setLineWidth(0.4);
doc.line(margin, y, margin + contentWidth, y);

y += 6;
doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...COLOR_TEXT);
const p1 = 'O Brasil possui mais de 5.500 municípios, cada um com autonomia sobre suas regras de ISS, alíquotas e particularidades de emissão de NFS-e. Com a implementação do Padrão Nacional de NFS-e (DPS) e a obrigatoriedade da Nomenclatura Brasileira de Serviços (NBS 2.0 da Receita Federal), empresas de software, contadores e departamentos fiscais enfrentam constantes gargalos manuais e risco tributário.';
const splitP1 = doc.splitTextToSize(p1, contentWidth);
doc.text(splitP1, margin, y);

y += splitP1.length * 4.5 + 2;
const p2 = 'O NFSe Fiscal foi desenvolvido como uma solução de alta performance para unificar, cruzar e validar essas informações em tempo real, eliminando planilhas desatualizadas e garantindo precisão na emissão fiscal.';
const splitP2 = doc.splitTextToSize(p2, contentWidth);
doc.text(splitP2, margin, y);

y += splitP2.length * 4.5 + 6;

// Section: Principais Módulos do Sistema
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...COLOR_RED);
doc.text('2. PRINCIPAIS MÓDULOS E FUNCIONALIDADES', margin, y);

y += 3;
doc.line(margin, y, margin + contentWidth, y);
y += 6;

// Box 1: Serviços Fiscais
doc.setFillColor(...COLOR_BG_LIGHT);
doc.setDrawColor(...COLOR_BORDER);
doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...COLOR_PRIMARY);
doc.text('A) Tabela de Serviços Fiscais (LC 116/2003 & DPS Nacional)', margin + 4, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...COLOR_TEXT);
const descA = [
  '• Cruzamento instantâneo entre código antigo de serviço e o novo código de tributação DPS.',
  '• Parametrização de alíquotas sugeridas, exigibilidade de retenção de ISS no tomador e local de incidência.',
  '• Correlação automatizada com código NBS 2.0 da RFB com recurso de cópia rápida em 1 toque.',
  '• Busca inteligente por palavras-chave, código legado, DPS ou base legal sem latência.'
];
descA.forEach((line, i) => {
  doc.text(line, margin + 4, y + 12 + (i * 4.5));
});

y += 36;

// Box 2: NBS 2.0
doc.setFillColor(...COLOR_BG_LIGHT);
doc.roundedRect(margin, y, contentWidth, 27, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...COLOR_PRIMARY);
doc.text('B) Catálogo Oficial da NBS 2.0 (Receita Federal do Brasil)', margin + 4, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...COLOR_TEXT);
const descB = [
  '• Base completa da Nomenclatura Brasileira de Serviços estruturada por Capítulos (15, 16, etc.).',
  '• Busca textual em milissegundos e filtro rápido por capítulo regulamentar.',
  '• Copiador ágil do código NBS formatado para utilização direta em sistemas de emissão ERP.'
];
descB.forEach((line, i) => {
  doc.text(line, margin + 4, y + 12 + (i * 4.5));
});

y += 31;

// Box 3: Monitor de Prefeituras
doc.setFillColor(...COLOR_BG_LIGHT);
doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...COLOR_PRIMARY);
doc.text('C) Monitoramento Nacional de Prefeituras (Adesão ao Emissor Nacional)', margin + 4, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...COLOR_TEXT);
const descC = [
  '• Mapeamento de prefeituras classificadas por aptidão: Apta (Ambiente Nacional), Em Adequação ou Não Aderiu.',
  '• Filtros combinados por Estado (UF), Região geográfica brasileira e modalidade de webservice.',
  '• Ficha técnica municipal com CNPJ formatado, população IBGE e provedor emissor.',
  '• Ferramenta de importação em lote com colagem direta de planilhas Excel/CSV com parseamento inteligente.'
];
descC.forEach((line, i) => {
  doc.text(line, margin + 4, y + 12 + (i * 4.5));
});

// Footer Page 1
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...COLOR_MUTED);
doc.text('NFSe Fiscal • Documentação Técnica de Produto • Desenvolvido por André Antunes', margin, pageHeight - 8);
doc.text('Página 1 de 2', pageWidth - margin - 18, pageHeight - 8);

// ================= PAGE 2 =================
doc.addPage();

// Mini Header Page 2
doc.setFillColor(...COLOR_PRIMARY);
doc.rect(0, 0, pageWidth, 20, 'F');
doc.setFillColor(...COLOR_RED);
doc.rect(0, 20, pageWidth, 1.5, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('NFSe Fiscal — Arquitetura de Software & Especificação Técnica', margin, 13);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(203, 213, 225);
doc.text('Stack • Segurança • Mobile-First • Cloud Firestore', pageWidth - margin - 75, 13);

y = 30;

// Section: Mobile First
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...COLOR_RED);
doc.text('3. ENGENHARIA MOBILE-FIRST (USO ERGONÔMICO NO SMARTPHONE)', margin, y);

y += 3;
doc.setDrawColor(...COLOR_BORDER);
doc.setLineWidth(0.4);
doc.line(margin, y, margin + contentWidth, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(...COLOR_TEXT);
const mobileDesc = 'Projetado desde a raiz para funcionar com máxima fluidez tanto em monitores ultrawide quanto em smartphones em modo vertical (em pé), sem a necessidade de virar o aparelho de lado:';
doc.text(doc.splitTextToSize(mobileDesc, contentWidth), margin, y);
y += 10;

// 3 Mobile features
const mCards = [
  { t: 'Menu Drawer Deslizante', d: 'Menu retrátil off-canvas com backdrop blur suave, liberando 100% da tela para dados fiscais.' },
  { t: 'Cards Verticais Táteis', d: 'No smartphone, tabelas largas viram cartões ergonômicos com badges de alíquota e botões touch.' },
  { t: 'Barra Inferior Rápida', d: 'Navegação de polegar com alternância instantânea entre Serviços, NBS e Prefeituras.' }
];

const colW = (contentWidth - 6) / 3;
mCards.forEach((c, i) => {
  const xBox = margin + (i * (colW + 3));
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.roundedRect(xBox, y, colW, 26, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(c.t, xBox + 2.5, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT);
  const spl = doc.splitTextToSize(c.d, colW - 5);
  doc.text(spl, xBox + 2.5, y + 11);
});

y += 32;

// Section: Stack & Arquitetura
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...COLOR_RED);
doc.text('4. STACK TECNOLÓGICA & ARQUITETURA DE PRODUÇÃO', margin, y);

y += 3;
doc.line(margin, y, margin + contentWidth, y);
y += 6;

// Tech Table
const techs = [
  { camada: 'Frontend SPA', tecnologia: 'React 19 + TypeScript + Vite', detalhe: 'Tipagem estrita de modelos fiscais, componentização funcional e bundling ultrarrápido.' },
  { camada: 'Estilização & UI', tecnologia: 'Tailwind CSS v4 + Lucide Icons', detalhe: 'Design System responsivo, animações micro-interativas e interface limpa sem poluição.' },
  { camada: 'Banco de Dados', tecnologia: 'Google Cloud Firestore (NoSQL)', detalhe: 'Persistência distribuída em tempo real via WebSockets com sincronização reativa multiusuário.' },
  { camada: 'Cache & Resiliência', tecnologia: 'LocalStorage Tiering (0ms startup)', detalhe: 'Carregamento instantâneo offline com reconciliação transparente no Firestore.' },
  { camada: 'Segurança & RBAC', tecnologia: 'Web Crypto API (SHA-256 + Salt)', detalhe: 'Hashing seguro client-side, proteção contra ataques de força bruta com rate limiting.' },
  { camada: 'Deploy & CI/CD', tecnologia: 'Vercel Serverless + GitHub', detalhe: 'Pipeline de entrega contínua com deploy automático em cada commit para a branch main.' }
];

techs.forEach((row, i) => {
  const rowY = y + (i * 12);
  doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
  doc.rect(margin, rowY, contentWidth, 11, 'F');
  doc.setDrawColor(...COLOR_BORDER);
  doc.rect(margin, rowY, contentWidth, 11, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(row.camada, margin + 3, rowY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_RED);
  doc.text(row.tecnologia, margin + 38, rowY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(row.detalhe, margin + 3, rowY + 8.5);
});

y += (techs.length * 12) + 6;

// Section: Informações do Autor e Repositório
doc.setFillColor(...COLOR_PRIMARY);
doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(255, 255, 255);
doc.text('CONTATO & LINKS DO PROJETO', margin + 6, y + 8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(226, 232, 240);
doc.text('• Autor / Desenvolvedor: André Antunes / André Barbosa', margin + 6, y + 16);
doc.text('• Repositório no GitHub: https://github.com/andrebarbosa-hue/portal_fiscal-', margin + 6, y + 22);
doc.text('• Aplicação Online: Disponível via Vercel (Produção)', margin + 6, y + 28);
doc.text('• Perfil: Desenvolvedor Full Stack especializado em React, TypeScript, Cloud & Arquitetura Web', margin + 6, y + 34);

// Footer Page 2
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...COLOR_MUTED);
doc.text('NFSe Fiscal • Documentação Técnica de Produto • Desenvolvido por André Antunes', margin, pageHeight - 8);
doc.text('Página 2 de 2', pageWidth - margin - 18, pageHeight - 8);

// Save to public directory
const outputPath = path.resolve('public', 'NFSe_Fiscal_Apresentacao.pdf');
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(outputPath, pdfBuffer);

console.log('PDF gerado com sucesso em:', outputPath);
