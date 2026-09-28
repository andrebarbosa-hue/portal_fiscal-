# 📊 NFSe Fiscal — Portal de Inteligência Tributária

> Plataforma corporativa moderna e responsiva para consulta, análise e gestão de regras fiscais de serviços (LC 116/2003), catálogo oficial da Nomenclatura Brasileira de Serviços (NBS) e acompanhamento em tempo real da adesão dos municípios ao Padrão Nacional de NFS-e (DPS).

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Google%20Cloud-Firestore-FFA611?logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![Mobile](https://img.shields.io/badge/Design-Mobile--First-10B981)

---

## 🎯 Sobre o Projeto

O **NFSe Fiscal** foi desenvolvido para resolver um dos maiores gargalos operacionais e tributários em empresas de software, departamentos fiscais e contabilidades: **a complexidade e fragmentação das regras de emissão de Notas Fiscais de Serviço eletrônica (NFS-e)** no Brasil.

Com mais de 5.500 municípios possuindo legislações próprias, a transição para o **Padrão Nacional de NFS-e (DPS)** e a correlação com a **NBS (RFB)** exigem ferramentas ágeis, precisas e confiáveis. Este portal centraliza esses dados em uma interface limpa, de altíssima velocidade e acessível de qualquer dispositivo.

---

## 🚀 Principais Funcionalidades

### 1. 📋 Tabela de Serviços Fiscais (LC 116 / DPS)
- **Cruzamento Inteligente:** Correlação direta entre o código legado (antigo) e o novo código de tributação nacional (DPS).
- **Alíquotas e Retenção:** Consulta de alíquotas municipais sugeridas, exigibilidade de retenção de ISS no tomador e local de incidência (Art. 3º da LC 116).
- **Vínculo com NBS:** Associação direta com o código NBS da Receita Federal com botão de cópia rápida em 1 clique.
- **Busca em Tempo Real:** Pesquisa instantânea por código, descrição ou item legal sem latência.

### 2. 📖 Catálogo Oficial NBS (Receita Federal)
- Catálogo completo estruturado por Capítulos (Cap. 15, 16, etc.) e subitens.
- Filtro dinâmico por capítulos e busca textual em tempo real.
- Botão touch para cópia imediata do código formatado para a área de transferência.

### 3. 🏛️ Monitoramento de Prefeituras (Padrão Nacional)
- Base de municípios brasileiros com status de aptidão:
  - **Apta:** Emissão direta via API / Ambiente Nacional da NFS-e.
  - **Em Adequação / Webservice:** Integração municipal própria ou em processo de adesão.
  - **Não Aderiu:** Municípios ainda operando em modelo legado.
- Filtros por Estado (UF), Região geográfica e Status de integração.
- Ficha detalhada com dados do município, CNPJ com cópia em 1 clique, população estimada e tipo de emissor.

### 4. 📱 Experiência Mobile-First (Uso em Pé no Smartphone)
- Interface 100% responsiva otimizada para uso vertical no celular.
- **Drawer Lateral Deslizante:** Menu retrátil para visualização limpa no smartphone.
- **Visualização em Cards Táteis:** No celular, tabelas extensas se transformam em cartões verticais ergonômicos, facilitando o uso com uma só mão.
- **Barra de Navegação Inferior:** Alternância instantânea de módulos pelo rodapé do celular.

### 5. ⚡ Gestão de Dados & Importador Inteligente
- **Importação do Excel / Planilhas:** Área para colar dados em massa diretamente de planilhas Excel/CSV ou relatórios sem complicação.
- **Sincronização Cloud Firestore:** Armazenamento em nuvem em tempo real com fallback automático em cache local para inicialização instantânea (0ms).
- **Área Administrativa Segura:** Modo de consulta aberto ao público e painel administrativo protegido por senha criptografada (SHA-256 + Salt) com bloqueio anti-força bruta.

---

## 🛠️ Tecnologias Utilizadas

### Frontend & UI
- **[React](https://react.dev/):** Biblioteca componentizada para interfaces reativas.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estrita de dados fiscais garantindo integridade e manutenibilidade.
- **[Tailwind CSS](https://tailwindcss.com/):** Estilização moderna, utilitária e de alto desempenho.
- **[Lucide React](https://lucide.dev/):** Iconografia moderna e consistente.
- **[Vite](https://vitejs.dev/):** Build tool de última geração com bundling ultrarrápido.

### Banco de Dados & Infraestrutura
- **[Google Cloud Firestore](https://firebase.google.com/docs/firestore):** Banco de dados NoSQL distribuído, escalável e com subscrições reativas em tempo real.
- **[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API):** Hashing criptográfico SHA-256 client-side com salting dinâmico para proteção de credenciais.
- **[Vercel](https://vercel.com/):** Hospedagem serverless global com deploy contínuo (CI/CD) integrado ao GitHub.

---

## 📐 Arquitetura do Sistema

```
portal_fiscal/
├── src/
│   ├── components/        # Componentes visuais modulares
│   │   ├── Sidebar.tsx           # Navegação lateral desktop e drawer mobile
│   │   ├── ServicosModule.tsx    # Consulta de serviços, tabela e cards mobile
│   │   ├── NBSModule.tsx         # Catálogo da NBS
│   │   ├── PrefeiturasModule.tsx # Monitor de cidades do Padrão Nacional
│   │   ├── DetailModal.tsx       # Ficha técnica detalhada
│   │   ├── AdminAuthModal.tsx    # Autenticação e redefinição de senha
│   │   └── ExcelPasteModal.tsx   # Importador de planilhas em lote
│   ├── context/           # Context API (AuthContext com RBAC e Rate Limit)
│   ├── services/          # Serviços de persistência (Firestore & LocalStorage)
│   ├── types/             # Modelagem de dados fiscais (TypeScript)
│   ├── utils/             # Criptografia, busca fonética/flexível e helpers
│   ├── App.tsx            # Ponto de entrada da aplicação
│   └── main.tsx           # Inicialização do React
├── index.html             # Entrypoint com meta tags SEO
└── package.json           # Dependências e scripts
```

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/andrebarbosa-hue/portal_fiscal-.git
   cd portal_fiscal-
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no seu navegador:**
   ```
   http://localhost:3000
   ```

5. **Para gerar a build de produção:**
   ```bash
   npm run build
   ```

---

## 🔒 Segurança & Boas Práticas
- **Zero Segredos no Cliente:** Variáveis de ambiente e regras de segurança configuradas para mitigar exposição.
- **Proteção Anti-Força Bruta:** Sistema inteligente de limitação de tentativas no login administrativo com bloqueio temporário por tempo determinado.
- **Resiliência Offline:** Carregamento otimizado de cache local mantendo o sistema operável mesmo sob oscilações de rede.

---

## 👤 Autor

Desenvolvido por **André Antunes / André Barbosa**  
- **GitHub:** [@andrebarbosa-hue](https://github.com/andrebarbosa-hue)  
- **Projeto:** [portal_fiscal-](https://github.com/andrebarbosa-hue/portal_fiscal-)

---

*Projeto desenvolvido com foco em alta performance, usabilidade moderna e eficiência tributária.*
