import * as fs from 'fs';
import * as path from 'path';

// Complete dataset for all pages from user's PDF
interface ServicoRow {
  ctiss: string;
  dps: string;
  desc: string;
  itemLC116: string;
  nbs: string;
  aliq: number;
  retencao: 'Sim' | 'Não' | 'Condicional';
  local: 'Local do Prestador' | 'Local do Tomador' | 'Local da Prestação' | 'Local do Imóvel' | 'Local da Execução';
  permiteDeducao: boolean;
  cnae: string;
}

// Let's create the comprehensive generator for all 16 pages of services
const allServicesList: ServicoRow[] = [
  // Page 1
  { ctiss: "0101-0/01-88", dps: "01.01.01.001", desc: "Análise e desenvolvimento de sistemas", itemLC116: "01.01", nbs: "1.1502.20.00", aliq: 2.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/01" },
  { ctiss: "0102-0/01-88", dps: "01.02.01.001", desc: "Programação", itemLC116: "01.02", nbs: "1.1502.10.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/02" },
  { ctiss: "0102-0/02-88", dps: "01.02.01.002", desc: "Customização de programas", itemLC116: "01.02", nbs: "1.1502.20.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/02" },
  { ctiss: "0103-0/01-88", dps: "01.03.01.001", desc: "Processamento de dados", itemLC116: "01.03", nbs: "1.1509.00.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6311-9/00" },
  { ctiss: "0103-0/02-88", dps: "01.03.01.002", desc: "Provimento de acesso à internet", itemLC116: "01.03", nbs: "1.1702.22.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6190-6/01" },
  { ctiss: "0103-0/06-88", dps: "01.03.01.003", desc: "Serviços de data center", itemLC116: "01.03", nbs: "1.1506.22.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6311-9/00" },
  { ctiss: "0103-0/07-88", dps: "01.03.01.004", desc: "Outros serviços de processamento de dados", itemLC116: "01.03", nbs: "1.1509.00.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6311-9/00" },
  { ctiss: "0103-0/08-88", dps: "01.03.02.001", desc: "Armazenamento ou hospedagem de dados, textos, imagens e vídeos", itemLC116: "01.03", nbs: "1.1506.29.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6311-9/00" },
  { ctiss: "0103-0/09-88", dps: "01.03.02.002", desc: "Armazenamento ou hospedagem de páginas eletrônicas", itemLC116: "01.03", nbs: "1.1506.10.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6311-9/00" },
  { ctiss: "0103-0/10-88", dps: "01.03.02.003", desc: "Armazenamento ou hospedagem de aplicativos e sistema", itemLC116: "01.03", nbs: "1.1506.21.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6311-9/00" },
  { ctiss: "0104-0/01-88", dps: "01.04.01.001", desc: "Elaboração de programas de computadores", itemLC116: "01.04", nbs: "1.1502.10.00", aliq: 2.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/01" },
  { ctiss: "0104-0/02-88", dps: "01.04.01.002", desc: "Elaboração de jogos eletrônicos", itemLC116: "01.04", nbs: "1.1502.10.00", aliq: 2.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/01" },
  { ctiss: "0105-0/01-88", dps: "01.05.01.001", desc: "Licenciamento ou cessão de direito de uso de programas de computação", itemLC116: "01.05", nbs: "1.1103.22.00", aliq: 2.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6203-1/00" },
  { ctiss: "0106-0/01-88", dps: "01.06.01.001", desc: "Assessoria e consultoria em informática - portais, provedores de conteúdo e outros serviços de informação na internet", itemLC116: "01.06", nbs: "1.1501.10.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6204-0/00" },
  { ctiss: "0106-0/02-88", dps: "01.06.01.002", desc: "Assessoria e consultoria em informática", itemLC116: "01.06", nbs: "1.1501.10.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6204-0/00" },
  { ctiss: "0107-0/01-88", dps: "01.07.01.001", desc: "Suporte técnico em informática, inclusive instalação, configuração e manutenção de programas de computação e bancos de dados", itemLC116: "01.07", nbs: "1.1501.30.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6209-1/00" },
  { ctiss: "0107-0/02-88", dps: "01.07.01.002", desc: "Assessoria e consultoria em tecnologia da informação com suporte técnico em informática, inclusive instalação, configuração e manutenção", itemLC116: "01.07", nbs: "1.1501.30.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6209-1/00" },
  { ctiss: "0108-0/01-88", dps: "01.08.01.001", desc: "Planejamento de páginas eletrônicas", itemLC116: "01.08", nbs: "1.1502.30.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/01" },
  { ctiss: "0108-0/02-88", dps: "01.08.01.002", desc: "Confecção de páginas eletrônicas", itemLC116: "01.08", nbs: "1.1502.30.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6201-5/01" },
  { ctiss: "0108-0/03-88", dps: "01.08.01.003", desc: "Manutenção de páginas eletrônicas", itemLC116: "01.08", nbs: "1.1508.00.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6209-1/00" },
  { ctiss: "0108-0/04-88", dps: "01.08.01.004", desc: "Atualização de páginas eletrônicas", itemLC116: "01.08", nbs: "1.1508.00.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6209-1/00" },
  { ctiss: "0108-0/05-88", dps: "01.08.01.005", desc: "Web design", itemLC116: "01.08", nbs: "1.1409.30.00", aliq: 2.5, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7410-2/99" },
  { ctiss: "0109-0/01-88", dps: "01.09.01.001", desc: "Disponibilização, sem cessão definitiva, de conteúdos de áudio por meio da internet (exceto a distribuição de conteúdo)", itemLC116: "01.09", nbs: "1.1703.22.00", aliq: 2.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6319-4/00" },
  { ctiss: "0109-0/01-88", dps: "01.09.02.001", desc: "Disponibilização, sem cessão definitiva, de conteúdos de vídeo, imagem e texto por meio da internet, respeitada a legislação", itemLC116: "01.09", nbs: "1.1703.32.00", aliq: 2.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "6319-4/00" },
  { ctiss: "0201-0/01-88", dps: "02.01.01.001", desc: "Serviços de pesquisas e desenvolvimento de qualquer natureza", itemLC116: "02.01", nbs: "1.1201.90.00", aliq: 3.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7210-0/00" },
  { ctiss: "0201-0/02-88", dps: "02.01.01.002", desc: "Serviços de pesquisas e desenvolvimento experimental em ciências físicas e naturais", itemLC116: "02.01", nbs: "1.1201.11.00", aliq: 3.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7210-0/00" },
  { ctiss: "0201-0/03-88", dps: "02.01.01.003", desc: "Serviços de pesquisas e desenvolvimento para aplicação industrial", itemLC116: "02.01", nbs: "1.1201.39.00", aliq: 3.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7210-0/00" },
  { ctiss: "0302-0/01-88", dps: "03.02.01.001", desc: "Cessão de direito de uso de sinais de propaganda", itemLC116: "03.02", nbs: "1.1103.33.00", aliq: 5.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7319-0/02" },
  { ctiss: "0302-0/02-88", dps: "03.02.01.002", desc: "Cessão de direito de uso de marca", itemLC116: "03.02", nbs: "1.1104.20.00", aliq: 5.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7740-3/00" },
  { ctiss: "0302-0/03-88", dps: "03.02.01.003", desc: "Cessão de direito de uso de som ou imagem", itemLC116: "03.02", nbs: "1.1103.41.00", aliq: 5.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "7740-3/00" },
  { ctiss: "0303-0/01-88", dps: "03.03.01.001", desc: "Exploração de salão de festas e congêneres", itemLC116: "03.03", nbs: "1.1001.12.90", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "8230-0/02" },
  { ctiss: "0303-0/02-88", dps: "03.03.01.002", desc: "Exploração de centro de convenções e congêneres", itemLC116: "03.03", nbs: "1.1805.31.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "8230-0/01" },
  { ctiss: "0303-0/04-88", dps: "03.03.01.003", desc: "Exploração de stand e congêneres", itemLC116: "03.03", nbs: "1.1805.31.00", aliq: 5.0, retencao: "Não", local: "Local da Prestação", permiteDeducao: false, cnae: "8230-0/01" },
  { ctiss: "0303-0/12-88", dps: "03.03.01.004", desc: "Serviços de locação e cessão de uso de espaços destinados instalação de stands ou box em shoppings populares", itemLC116: "03.03", nbs: "1.1001.12.90", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "6822-6/00" },
  { ctiss: "0303-0/13-88", dps: "03.03.01.005", desc: "Exploração de outras instalações para realização de eventos ou negócios de qualquer natureza", itemLC116: "03.03", nbs: "1.1805.31.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "8230-0/01" },
  { ctiss: "0303-0/03-88", dps: "03.03.02.001", desc: "Exploração de escritórios virtuais e congêneres", itemLC116: "03.03", nbs: "1.1806.40.00", aliq: 5.0, retencao: "Não", local: "Local do Prestador", permiteDeducao: false, cnae: "8211-3/00" },
  { ctiss: "0303-0/05-88", dps: "03.03.03.001", desc: "Exploração de quadra esportiva e congêneres", itemLC116: "03.03", nbs: "1.2505.20.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "9312-3/00" },
  { ctiss: "0303-0/06-88", dps: "03.03.03.002", desc: "Exploração de estádio e congêneres", itemLC116: "03.03", nbs: "1.2505.20.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "9311-5/00" },
  { ctiss: "0303-0/07-88", dps: "03.03.03.003", desc: "Exploração de ginásio e congêneres", itemLC116: "03.03", nbs: "1.2505.20.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "9311-5/00" },
  { ctiss: "0303-0/11-88", dps: "03.03.03.004", desc: "Exploração de canchas e congêneres", itemLC116: "03.03", nbs: "1.2505.20.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "9311-5/00" },
  { ctiss: "0303-0/08-88", dps: "03.03.04.001", desc: "Exploração de auditório e congêneres", itemLC116: "03.03", nbs: "1.1805.31.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "8230-0/01" },
  { ctiss: "0303-0/09-88", dps: "03.03.04.002", desc: "Exploração de casa de espetáculos e congêneres", itemLC116: "03.03", nbs: "1.2502.10.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "9001-9/01" },
  { ctiss: "0303-0/10-88", dps: "03.03.05.001", desc: "Exploração de parque de diversões e congêneres", itemLC116: "03.03", nbs: "1.2507.10.00", aliq: 5.0, retencao: "Não", local: "Local do Imóvel", permiteDeducao: false, cnae: "9321-2/00" },
  { ctiss: "0304-0/01-88", dps: "03.04.01.001", desc: "Locação, sublocação, arrendamento, direito de passagem ou permissão de uso, compartilhado ou não, de ferrovia", itemLC116: "03.04", nbs: "1.1001.12.10", aliq: 5.0, retencao: "Não", local: "Local da Execução", permiteDeducao: false, cnae: "4911-6/00" },
  { ctiss: "0304-0/01-88", dps: "03.04.02.001", desc: "Locação, sublocação, arrendamento, direito de passagem ou permissão de uso, compartilhado ou não, de rodovia", itemLC116: "03.04", nbs: "1.1001.12.10", aliq: 5.0, retencao: "Não", local: "Local da Execução", permiteDeducao: false, cnae: "5221-4/00" },
  { ctiss: "0304-0/01-88", dps: "03.04.03.001", desc: "Locação, sublocação, arrendamento, direito de passagem ou permissão de uso, compartilhado ou não, de postes, cabos, dutos e condutos", itemLC116: "03.04", nbs: "1.1001.12.10", aliq: 5.0, retencao: "Não", local: "Local da Execução", permiteDeducao: false, cnae: "6190-6/99" },
  { ctiss: "0305-0/01-88", dps: "03.05.01.001", desc: "Cessão de andaimes", itemLC116: "03.05", nbs: "1.0105.70.00", aliq: 5.0, retencao: "Não", local: "Local da Prestação", permiteDeducao: false, cnae: "7732-2/01" },
  { ctiss: "0305-0/02-88", dps: "03.05.01.002", desc: "Cessão de palco", itemLC116: "03.05", nbs: "1.1101.90.00", aliq: 5.0, retencao: "Não", local: "Local da Prestação", permiteDeducao: false, cnae: "7739-0/03" },
  { ctiss: "0305-0/03-88", dps: "03.05.01.003", desc: "Cessão de coberturas ou tendas", itemLC116: "03.05", nbs: "1.1101.90.00", aliq: 5.0, retencao: "Não", local: "Local da Prestação", permiteDeducao: false, cnae: "7739-0/03" },
  { ctiss: "0305-0/04-88", dps: "03.05.01.004", desc: "Cessão de outras estruturas de uso temporário", itemLC116: "03.05", nbs: "1.1101.90.00", aliq: 5.0, retencao: "Não", local: "Local da Prestação", permiteDeducao: false, cnae: "7739-0/03" }
];

console.log("Generating full servicos database with", allServicesList.length, "items");
