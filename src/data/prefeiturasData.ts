import { PrefeituraNacional } from '../types/fiscal';

export interface RawCityEntry {
  cidade: string;
  cnpj: string;
  status: string;
  emissor: string;
}

// Extracted from original ATS dataset with parsed UFs and IBGE mappings
export const rawPrefeiturasList: PrefeituraNacional[] = [
  { id: 'pref-bsb', cidade: 'BRASILIA', uf: 'DF', cnpj: '26.994.533/0001-20', codigoIbge: '5300108', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-ab-go', cidade: 'ABADIA DE GOIAS', uf: 'GO', cnpj: '01.613.940/0001-19', codigoIbge: '5200050', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-abd-go', cidade: 'ABADIANIA', uf: 'GO', cnpj: '01.298.330/0001-78', codigoIbge: '5200100', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-acr-go', cidade: 'ACREUNA', uf: 'GO', cnpj: '02.218.683/0001-83', codigoIbge: '5200134', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-ade-go', cidade: 'ADELANDIA', uf: 'GO', cnpj: '25.108.291/0001-67', codigoIbge: '5200159', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-agf-go', cidade: 'AGUA FRIA DE GOIAS', uf: 'GO', cnpj: '25.141.292/0001-03', codigoIbge: '5200175', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Outros' },
  { id: 'pref-agl-go', cidade: 'AGUA LIMPA', uf: 'GO', cnpj: '01.173.053/0001-77', codigoIbge: '5200209', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-alg-go', cidade: 'AGUAS LINDAS DE GOIAS', uf: 'GO', cnpj: '01.616.520/0001-96', codigoIbge: '5200258', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-alx-go', cidade: 'ALEXANIA', uf: 'GO', cnpj: '01.298.975/0001-00', codigoIbge: '5200308', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-alo-go', cidade: 'ALOANDIA', uf: 'GO', cnpj: '01.345.537/0001-56', codigoIbge: '5200407', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-alth-go', cidade: 'ALTO HORIZONTE', uf: 'GO', cnpj: '33.331.604/0001-70', codigoIbge: '5200506', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-altp-go', cidade: 'ALTO PARAISO DE GOIAS', uf: 'GO', cnpj: '01.740.455/0001-06', codigoIbge: '5200555', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-alvn-go', cidade: 'ALVORADA DO NORTE', uf: 'GO', cnpj: '02.367.597/0001-32', codigoIbge: '5200605', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-amr-go', cidade: 'AMARALINA', uf: 'GO', cnpj: '01.492.098/0001-04', codigoIbge: '5200803', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-amb-go', cidade: 'AMERICANO DO BRASIL', uf: 'GO', cnpj: '00.007.344/0001-22', codigoIbge: '5200829', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-amr-p-go', cidade: 'AMORINOPOLIS', uf: 'GO', cnpj: '01.067.073/0001-63', codigoIbge: '5200852', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ana-go', cidade: 'ANAPOLIS', uf: 'GO', cnpj: '01.067.479/0001-46', codigoIbge: '5201108', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-anh-go', cidade: 'ANHANGUERA', uf: 'GO', cnpj: '01.127.430/0001-31', codigoIbge: '5201207', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-ani-go', cidade: 'ANICUNS', uf: 'GO', cnpj: '02.262.368/0001-53', codigoIbge: '5201306', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-apg-go', cidade: 'APARECIDA DE GOIANIA', uf: 'GO', cnpj: '01.005.727/0001-24', codigoIbge: '5201405', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-aprd-go', cidade: 'APARECIDA DO RIO DOCE', uf: 'GO', cnpj: '24.859.316/0001-00', codigoIbge: '5201454', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-apo-go', cidade: 'APORE', uf: 'GO', cnpj: '02.186.336/0001-16', codigoIbge: '5201504', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-arc-go', cidade: 'ARACU', uf: 'GO', cnpj: '01.318.898/0001-03', codigoIbge: '5201603', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-arg-go', cidade: 'ARAGARCAS', uf: 'GO', cnpj: '02.125.227/0001-99', codigoIbge: '5201702', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-argi-go', cidade: 'ARAGOIANIA', uf: 'GO', cnpj: '01.215.474/0001-13', codigoIbge: '5201801', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-aru-go', cidade: 'ARUANA', uf: 'GO', cnpj: '01.067.081/0001-00', codigoIbge: '5202502', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-bel-go', cidade: 'BELA VISTA DE GOIAS', uf: 'GO', cnpj: '01.005.917/0001-41', codigoIbge: '5203302', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-cal-go', cidade: 'CALDAS NOVAS', uf: 'GO', cnpj: '01.787.506/0001-55', codigoIbge: '5204508', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-cat-go', cidade: 'CATALAO', uf: 'GO', cnpj: '01.505.643/0001-50', codigoIbge: '5205109', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-cid-go', cidade: 'CIDADE OCIDENTAL', uf: 'GO', cnpj: '36.862.621/0001-21', codigoIbge: '5205497', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-cxt-go', cidade: 'CRISTALINA', uf: 'GO', cnpj: '01.138.122/0001-01', codigoIbge: '5206206', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-for-go', cidade: 'FORMOSA', uf: 'GO', cnpj: '01.738.780/0001-34', codigoIbge: '5208103', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-gyn-go', cidade: 'GOIANIA', uf: 'GO', cnpj: '01.612.092/0001-23', codigoIbge: '5208707', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Portal Próprio' },
  { id: 'pref-gynr-go', cidade: 'GOIANIRA', uf: 'GO', cnpj: '01.291.707/0001-67', codigoIbge: '5208806', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-itb-go', cidade: 'ITUMBIARA', uf: 'GO', cnpj: '02.204.196/0001-61', codigoIbge: '5211503', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-jat-go', cidade: 'JATAI', uf: 'GO', cnpj: '01.165.729/0001-80', codigoIbge: '5211909', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-luz-go', cidade: 'LUZIANIA', uf: 'GO', cnpj: '01.169.416/0001-09', codigoIbge: '5212501', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-riov-go', cidade: 'RIO VERDE', uf: 'GO', cnpj: '02.056.729/0001-05', codigoIbge: '5218805', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-sen-go', cidade: 'SENADOR CANEDO', uf: 'GO', cnpj: '25.107.525/0001-51', codigoIbge: '5220454', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-val-go', cidade: 'VALPARAISO DE GOIAS', uf: 'GO', cnpj: '01.616.319/0001-09', codigoIbge: '5221858', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  
  // MS
  { id: 'pref-cgr-ms', cidade: 'CAMPO GRANDE', uf: 'MS', cnpj: '03.501.509/0001-06', codigoIbge: '5002704', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'DBSeller' },
  { id: 'pref-dou-ms', cidade: 'DOURADOS', uf: 'MS', cnpj: '03.155.926/0001-44', codigoIbge: '5003702', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-tlg-ms', cidade: 'TRES LAGOAS', uf: 'MS', cnpj: '03.184.041/0001-73', codigoIbge: '5008305', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-cor-ms', cidade: 'CORUMBA', uf: 'MS', cnpj: '03.330.461/0001-10', codigoIbge: '5003207', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-pon-ms', cidade: 'PONTA PORA', uf: 'MS', cnpj: '03.434.792/0001-09', codigoIbge: '5006606', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-bon-ms', cidade: 'BONITO', uf: 'MS', cnpj: '03.073.673/0001-60', codigoIbge: '5002407', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // MT
  { id: 'pref-cba-mt', cidade: 'CUIABA', uf: 'MT', cnpj: '03.533.064/0001-46', codigoIbge: '5103403', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-vzg-mt', cidade: 'VARZEA GRANDE', uf: 'MT', cnpj: '03.507.548/0001-10', codigoIbge: '5108402', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-roo-mt', cidade: 'RONDONOPOLIS', uf: 'MT', cnpj: '03.347.101/0001-21', codigoIbge: '5107602', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-snp-mt', cidade: 'SINOP', uf: 'MT', cnpj: '15.024.003/0001-32', codigoIbge: '5107909', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-srr-mt', cidade: 'SORRISO', uf: 'MT', cnpj: '03.239.076/0001-62', codigoIbge: '5107925', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-lrv-mt', cidade: 'LUCAS DO RIO VERDE', uf: 'MT', cnpj: '24.772.246/0001-40', codigoIbge: '5105259', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // AL
  { id: 'pref-mcz-al', cidade: 'MACEIO', uf: 'AL', cnpj: '12.200.135/0001-80', codigoIbge: '2704302', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-arp-al', cidade: 'ARAPIRACA', uf: 'AL', cnpj: '12.198.693/0001-58', codigoIbge: '2700300', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-pnd-al', cidade: 'PENEDO', uf: 'AL', cnpj: '12.243.697/0001-00', codigoIbge: '2706703', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },

  // BA
  { id: 'pref-ssa-ba', cidade: 'SALVADOR', uf: 'BA', cnpj: '13.927.801/0001-49', codigoIbge: '2927408', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Portal Próprio' },
  { id: 'pref-fsa-ba', cidade: 'FEIRA DE SANTANA', uf: 'BA', cnpj: '14.043.574/0001-51', codigoIbge: '2910800', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-vdc-ba', cidade: 'VITORIA DA CONQUISTA', uf: 'BA', cnpj: '14.239.578/0001-00', codigoIbge: '2933307', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-cam-ba', cidade: 'CAMACARI', uf: 'BA', cnpj: '14.109.763/0001-80', codigoIbge: '2905701', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-lau-ba', cidade: 'LAURO DE FREITAS', uf: 'BA', cnpj: '13.927.819/0001-40', codigoIbge: '2919207', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-itb-ba', cidade: 'ITABUNA', uf: 'BA', cnpj: '14.147.490/0001-68', codigoIbge: '2914802', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-ilh-ba', cidade: 'ILHEUS', uf: 'BA', cnpj: '13.672.597/0001-62', codigoIbge: '2913606', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-lem-ba', cidade: 'LUIS EDUARDO MAGALHAES', uf: 'BA', cnpj: '04.214.419/0001-05', codigoIbge: '2919553', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-por-ba', cidade: 'PORTO SEGURO', uf: 'BA', cnpj: '13.635.016/0001-12', codigoIbge: '2925303', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },

  // CE
  { id: 'pref-for-ce', cidade: 'FORTALEZA', uf: 'CE', cnpj: '07.954.605/0001-60', codigoIbge: '2304400', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Portal Próprio' },
  { id: 'pref-cau-ce', cidade: 'CAUCAIA', uf: 'CE', cnpj: '07.616.162/0001-06', codigoIbge: '2303709', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-jua-ce', cidade: 'JUAZEIRO DO NORTE', uf: 'CE', cnpj: '07.974.082/0001-14', codigoIbge: '2307304', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-mar-ce', cidade: 'MARACANAU', uf: 'CE', cnpj: '07.605.850/0001-62', codigoIbge: '2307650', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-sob-ce', cidade: 'SOBRAL', uf: 'CE', cnpj: '07.598.634/0001-37', codigoIbge: '2312908', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },

  // MA
  { id: 'pref-slz-ma', cidade: 'SAO LUIS', uf: 'MA', cnpj: '06.307.102/0001-30', codigoIbge: '2111300', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-imp-ma', cidade: 'IMPERATRIZ', uf: 'MA', cnpj: '06.158.455/0001-16', codigoIbge: '2105302', status: 'Apta', emissor: 'Padrão Nacional' },
  { id: 'pref-cax-ma', cidade: 'CAXIAS', uf: 'MA', cnpj: '06.082.820/0001-56', codigoIbge: '2103000', status: 'Apta', emissor: 'Padrão Nacional' },

  // PE
  { id: 'pref-rec-pe', cidade: 'RECIFE', uf: 'PE', cnpj: '10.565.000/0001-92', codigoIbge: '2611606', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-jbo-pe', cidade: 'JABOATAO DOS GUARARAPES', uf: 'PE', cnpj: '10.377.679/0001-96', codigoIbge: '2607901', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-oli-pe', cidade: 'OLINDA', uf: 'PE', cnpj: '10.404.184/0001-09', codigoIbge: '2609600', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-car-pe', cidade: 'CARUARU', uf: 'PE', cnpj: '10.091.536/0001-13', codigoIbge: '2604106', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-pet-pe', cidade: 'PETROLINA', uf: 'PE', cnpj: '10.358.190/0001-77', codigoIbge: '2611101', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },

  // PB
  { id: 'pref-jpa-pb', cidade: 'JOAO PESSOA', uf: 'PB', cnpj: '08.778.326/0001-56', codigoIbge: '2507507', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-cpg-pb', cidade: 'CAMPINA GRANDE', uf: 'PB', cnpj: '08.993.917/0001-46', codigoIbge: '2504009', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-caj-pb', cidade: 'CAJAZEIRAS', uf: 'PB', cnpj: '08.923.971/0001-15', codigoIbge: '2503704', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // RN
  { id: 'pref-nat-rn', cidade: 'NATAL', uf: 'RN', cnpj: '08.241.747/0001-43', codigoIbge: '2408102', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-mos-rn', cidade: 'MOSSORO', uf: 'RN', cnpj: '08.348.971/0001-39', codigoIbge: '2408003', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-pnm-rn', cidade: 'PARNAMIRIM', uf: 'RN', cnpj: '08.170.862/0001-74', codigoIbge: '2403251', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },

  // SE
  { id: 'pref-aju-se', cidade: 'ARACAJU', uf: 'SE', cnpj: '13.128.780/0001-00', codigoIbge: '2800308', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-nss-se', cidade: 'NOSSA SENHORA DO SOCORRO', uf: 'SE', cnpj: '13.128.814/0001-58', codigoIbge: '2804805', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-lag-se', cidade: 'LAGARTO', uf: 'SE', cnpj: '13.124.052/0001-11', codigoIbge: '2803500', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },

  // SP
  { id: 'pref-spo-sp', cidade: 'SAO PAULO', uf: 'SP', cnpj: '46.395.000/0001-39', codigoIbge: '3550308', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Portal Próprio' },
  { id: 'pref-gru-sp', cidade: 'GUARULHOS', uf: 'SP', cnpj: '46.319.000/0001-50', codigoIbge: '3518800', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-cps-sp', cidade: 'CAMPINAS', uf: 'SP', cnpj: '51.885.242/0001-40', codigoIbge: '3509502', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-sbc-sp', cidade: 'SAO BERNARDO DO CAMPO', uf: 'SP', cnpj: '46.523.239/0001-47', codigoIbge: '3548708', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-san-sp', cidade: 'SANTO ANDRE', uf: 'SP', cnpj: '46.522.942/0001-30', codigoIbge: '3547809', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-osb-sp', cidade: 'OSASCO', uf: 'SP', cnpj: '46.523.171/0001-04', codigoIbge: '3534401', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-sjc-sp', cidade: 'SAO JOSE DOS CAMPOS', uf: 'SP', cnpj: '46.643.466/0001-06', codigoIbge: '3549904', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-srp-sp', cidade: 'RIBEIRAO PRETO', uf: 'SP', cnpj: '56.024.581/0001-56', codigoIbge: '3543402', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-sor-sp', cidade: 'SOROCABA', uf: 'SP', cnpj: '46.634.044/0001-74', codigoIbge: '3552205', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-stz-sp', cidade: 'SANTOS', uf: 'SP', cnpj: '58.200.015/0001-83', codigoIbge: '3548500', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-sjrp-sp', cidade: 'SAO JOSE DO RIO PRETO', uf: 'SP', cnpj: '46.588.950/0001-80', codigoIbge: '3549805', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-pir-sp', cidade: 'PIRACICABA', uf: 'SP', cnpj: '46.341.038/0001-29', codigoIbge: '3538709', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-bau-sp', cidade: 'BAURU', uf: 'SP', cnpj: '46.137.410/0001-80', codigoIbge: '3506003', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-jnd-sp', cidade: 'JUNDIAI', uf: 'SP', cnpj: '45.780.103/0001-50', codigoIbge: '3525904', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-frk-sp', cidade: 'FRANCA', uf: 'SP', cnpj: '47.970.769/0001-04', codigoIbge: '3516200', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-ita-sp', cidade: 'ITAPIRA', uf: 'SP', cnpj: '45.281.144/0001-00', codigoIbge: '3522604', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Fiorilli' },
  { id: 'pref-mog-sp', cidade: 'MOGI GUACU', uf: 'SP', cnpj: '45.301.264/0001-13', codigoIbge: '3530706', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ind-sp', cidade: 'INDAIATUBA', uf: 'SP', cnpj: '44.733.608/0001-09', codigoIbge: '3520509', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ara-sp', cidade: 'ARACATUBA', uf: 'SP', cnpj: '45.511.847/0001-79', codigoIbge: '3502804', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-scl-sp', cidade: 'SAO CARLOS', uf: 'SP', cnpj: '45.358.249/0001-01', codigoIbge: '3548906', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // MG
  { id: 'pref-bh-mg', cidade: 'BELO HORIZONTE', uf: 'MG', cnpj: '18.715.383/0001-40', codigoIbge: '3106200', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-udi-mg', cidade: 'UBERLANDIA', uf: 'MG', cnpj: '18.431.312/0001-15', codigoIbge: '3170206', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ctg-mg', cidade: 'CONTAGEM', uf: 'MG', cnpj: '18.715.508/0001-31', codigoIbge: '3118601', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-jf-mg', cidade: 'JUIZ DE FORA', uf: 'MG', cnpj: '18.338.178/0001-02', codigoIbge: '3136702', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-bet-mg', cidade: 'BETIM', uf: 'MG', cnpj: '18.715.391/0001-96', codigoIbge: '3106705', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-moc-mg', cidade: 'MONTES CLAROS', uf: 'MG', cnpj: '22.678.874/0001-35', codigoIbge: '3143302', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ura-mg', cidade: 'UBERABA', uf: 'MG', cnpj: '18.428.839/0001-90', codigoIbge: '3170107', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-gva-mg', cidade: 'GOVERNADOR VALADARES', uf: 'MG', cnpj: '20.622.890/0001-80', codigoIbge: '3127701', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ipn-mg', cidade: 'IPATINGA', uf: 'MG', cnpj: '19.876.424/0001-42', codigoIbge: '3131307', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-stz-mg', cidade: 'SETE LAGOAS', uf: 'MG', cnpj: '24.996.969/0001-22', codigoIbge: '3167202', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-div-mg', cidade: 'DIVINOPOLIS', uf: 'MG', cnpj: '18.291.351/0001-64', codigoIbge: '3122306', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-pau-mg', cidade: 'POUSO ALEGRE', uf: 'MG', cnpj: '18.675.983/0001-21', codigoIbge: '3152501', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ptm-mg', cidade: 'PATOS DE MINAS', uf: 'MG', cnpj: '18.602.011/0001-07', codigoIbge: '3148004', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-vrg-mg', cidade: 'VARGINHA', uf: 'MG', cnpj: '18.240.119/0001-05', codigoIbge: '3170701', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-arx-mg', cidade: 'ARAXA', uf: 'MG', cnpj: '18.140.756/0001-00', codigoIbge: '3104007', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-poc-mg', cidade: 'POCOS DE CALDAS', uf: 'MG', cnpj: '18.629.840/0001-83', codigoIbge: '3151800', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },

  // RJ
  { id: 'pref-rio-rj', cidade: 'RIO DE JANEIRO', uf: 'RJ', cnpj: '42.498.733/0001-48', codigoIbge: '3304557', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-sgo-rj', cidade: 'SAO GONCALO', uf: 'RJ', cnpj: '28.636.579/0001-00', codigoIbge: '3304904', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-duq-rj', cidade: 'DUQUE DE CAXIAS', uf: 'RJ', cnpj: '29.138.328/0001-50', codigoIbge: '3301702', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-nvr-rj', cidade: 'NOVA IGUACU', uf: 'RJ', cnpj: '29.138.278/0001-01', codigoIbge: '3303500', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-nit-rj', cidade: 'NITEROI', uf: 'RJ', cnpj: '28.521.748/0001-59', codigoIbge: '3303302', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-bfx-rj', cidade: 'BELFORD ROXO', uf: 'RJ', cnpj: '39.485.438/0001-42', codigoIbge: '3300456', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-cpg-rj', cidade: 'CAMPOS DOS GOYTACAZES', uf: 'RJ', cnpj: '29.116.894/0001-61', codigoIbge: '3301009', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-pet-rj', cidade: 'PETROPOLIS', uf: 'RJ', cnpj: '29.138.344/0001-43', codigoIbge: '3303906', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-vtr-rj', cidade: 'VOLTA REDONDA', uf: 'RJ', cnpj: '32.512.501/0001-43', codigoIbge: '3306305', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-mac-rj', cidade: 'MACAE', uf: 'RJ', cnpj: '29.115.474/0001-60', codigoIbge: '3302403', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-cbf-rj', cidade: 'CABO FRIO', uf: 'RJ', cnpj: '28.549.483/0001-05', codigoIbge: '3300704', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'WebISS' },
  { id: 'pref-mrc-rj', cidade: 'MARICA', uf: 'RJ', cnpj: '29.131.075/0001-93', codigoIbge: '3302700', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // PR
  { id: 'pref-cwb-pr', cidade: 'CURITIBA', uf: 'PR', cnpj: '76.417.005/0001-86', codigoIbge: '4106902', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ldn-pr', cidade: 'LONDRINA', uf: 'PR', cnpj: '75.771.477/0001-70', codigoIbge: '4113700', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-mga-pr', cidade: 'MARINGA', uf: 'PR', cnpj: '76.282.656/0001-06', codigoIbge: '4115200', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ptg-pr', cidade: 'PONTA GROSSA', uf: 'PR', cnpj: '76.175.884/0001-87', codigoIbge: '4119905', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-csl-pr', cidade: 'CASCAVEL', uf: 'PR', cnpj: '76.208.867/0001-07', codigoIbge: '4104808', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'IPM' },
  { id: 'pref-sjp-pr', cidade: 'SAO JOSE DOS PINHAIS', uf: 'PR', cnpj: '76.105.543/0001-35', codigoIbge: '4125506', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-foz-pr', cidade: 'FOZ DO IGUACU', uf: 'PR', cnpj: '76.206.606/0001-40', codigoIbge: '4108304', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-col-pr', cidade: 'COLOMBO', uf: 'PR', cnpj: '76.105.634/0001-70', codigoIbge: '4105805', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-gpa-pr', cidade: 'GUARAPUAVA', uf: 'PR', cnpj: '76.178.037/0001-76', codigoIbge: '4109401', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-tol-pr', cidade: 'TOLEDO', uf: 'PR', cnpj: '76.205.806/0001-88', codigoIbge: '4127700', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // SC
  { id: 'pref-fln-sc', cidade: 'FLORIANOPOLIS', uf: 'SC', cnpj: '82.892.282/0001-43', codigoIbge: '4205407', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-joi-sc', cidade: 'JOINVILLE', uf: 'SC', cnpj: '83.169.623/0001-10', codigoIbge: '4209102', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-bnu-sc', cidade: 'BLUMENAU', uf: 'SC', cnpj: '83.108.357/0001-15', codigoIbge: '4202404', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-sjo-sc', cidade: 'SAO JOSE', uf: 'SC', cnpj: '82.892.274/0001-05', codigoIbge: '4216602', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-cha-sc', cidade: 'CHAPECO', uf: 'SC', cnpj: '83.021.808/0001-82', codigoIbge: '4204202', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-itj-sc', cidade: 'ITAJAI', uf: 'SC', cnpj: '83.102.277/0001-52', codigoIbge: '4208203', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-cri-sc', cidade: 'CRICIUMA', uf: 'SC', cnpj: '82.916.818/0001-13', codigoIbge: '4204608', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-jgs-sc', cidade: 'JARAGUA DO SUL', uf: 'SC', cnpj: '83.102.459/0001-23', codigoIbge: '4208906', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-pal-sc', cidade: 'PALHOCA', uf: 'SC', cnpj: '82.892.316/0001-08', codigoIbge: '4211900', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'IPM' },
  { id: 'pref-lgs-sc', cidade: 'LAGES', uf: 'SC', cnpj: '82.777.301/0001-90', codigoIbge: '4209300', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'Betha' },
  { id: 'pref-bca-sc', cidade: 'BALNEARIO CAMBORIU', uf: 'SC', cnpj: '83.102.285/0001-07', codigoIbge: '4202008', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-bru-sc', cidade: 'BRUSQUE', uf: 'SC', cnpj: '83.102.343/0001-94', codigoIbge: '4202909', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-tub-sc', cidade: 'TUBARAO', uf: 'SC', cnpj: '82.928.656/0001-33', codigoIbge: '4218707', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },

  // RS
  { id: 'pref-poa-rs', cidade: 'PORTO ALEGRE', uf: 'RS', cnpj: '92.963.560/0001-60', codigoIbge: '4314902', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-cxs-rs', cidade: 'CAXIAS DO SUL', uf: 'RS', cnpj: '88.830.609/0001-39', codigoIbge: '4305108', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-cns-rs', cidade: 'CANOAS', uf: 'RS', cnpj: '88.577.416/0001-18', codigoIbge: '4304606', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-pel-rs', cidade: 'PELOTAS', uf: 'RS', cnpj: '87.455.531/0001-57', codigoIbge: '4314407', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-sma-rs', cidade: 'SANTA MARIA', uf: 'RS', cnpj: '88.488.366/0001-00', codigoIbge: '4316907', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-gvt-rs', cidade: 'GRAVATAI', uf: 'RS', cnpj: '87.890.992/0001-58', codigoIbge: '4309209', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-via-rs', cidade: 'VIAMAO', uf: 'RS', cnpj: '88.000.914/0001-01', codigoIbge: '4323002', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-nvh-rs', cidade: 'NOVO HAMBURGO', uf: 'RS', cnpj: '88.254.875/0001-60', codigoIbge: '4313409', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-slo-rs', cidade: 'SAO LEOPOLDO', uf: 'RS', cnpj: '89.814.693/0001-60', codigoIbge: '4318705', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-rgr-rs', cidade: 'RIO GRANDE', uf: 'RS', cnpj: '88.566.872/0001-62', codigoIbge: '4315602', status: 'Em Adequação', emissor: 'Webservice Municipal', provedor: 'GovBR' },
  { id: 'pref-pfd-rs', cidade: 'PASSO FUNDO', uf: 'RS', cnpj: '87.612.537/0001-90', codigoIbge: '4314100', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-stc-rs', cidade: 'SANTA CRUZ DO SUL', uf: 'RS', cnpj: '95.440.517/0001-08', codigoIbge: '4316808', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-bgv-rs', cidade: 'BENTO GONCALVES', uf: 'RS', cnpj: '87.849.923/0001-09', codigoIbge: '4302105', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' },
  { id: 'pref-ere-rs', cidade: 'ERECHIM', uf: 'RS', cnpj: '87.613.477/0001-20', codigoIbge: '4307005', status: 'Apta', emissor: 'Padrão Nacional', provedor: 'NFS-e Nacional' }
];

export const allStatesUF = [
  'TODOS', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 
  'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];
