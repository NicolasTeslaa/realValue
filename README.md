# RealValue - Valor Real dos Ativos

Aplicação web mobile-first para análise de Fundos Imobiliários (FIIs) com dados em tempo real. Compare o preço atual de um ativo com seu valor patrimonial por cota e receba insights para organizar sua carteira de investimentos.

## 🎯 Funcionalidades

- **Busca de FIIs**: Pesquise fundos imobiliários por ticker
- **Análise P/VP**: Compare preço atual vs valor patrimonial por cota
- **Recomendações**: Receba insights sobre se vale a pena comprar o ativo
- **Favoritos**: Salve seus ativos preferidos (localStorage)
- **Ativos por Categoria**: Explore FIIs organizados por tipo (Tijolo, Papel, Shopping, etc.)
- **Dados em Tempo Real**: Busca dados reais via API do Status Invest através de proxy backend
- **Design Mobile-First**: Interface otimizada para dispositivos móveis

## 🏗️ Arquitetura

O projeto está organizado em duas partes:

- **Frontend**: Aplicação React (pasta `frontend/`)
- **Backend**: API Proxy Node.js/Express (pasta `backend/`)

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para construção de UI
- **React Router** - Roteamento da aplicação
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP para requisições
- **CSS3** - Estilização mobile-first

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Axios** - Cliente HTTP para chamadas à API do Status Invest
- **CORS** - Middleware para permitir requisições cross-origin

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/NicolasTeslaa/realValue.git
cd realValue
```

### 2. Instale todas as dependências

```bash
npm run install:all
```

Ou instale manualmente:

```bash
# Instalar dependências da raiz (para scripts de desenvolvimento)
npm install

# Instalar dependências do frontend
cd frontend
npm install

# Instalar dependências do backend
cd ../backend
npm install
```

### 3. Inicie o desenvolvimento

Na raiz do projeto:

```bash
npm run dev
```

Isso irá iniciar:
- **Backend** na porta `3001` (API Proxy)
- **Frontend** na porta `3000` (Aplicação React)

### Ou inicie separadamente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 URLs de Desenvolvimento

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Build para Produção

### Frontend

```bash
cd frontend
npm run build
```

Os arquivos otimizados estarão na pasta `frontend/dist/`

### Backend

O backend não precisa de build, apenas execute:

```bash
cd backend
npm start
```

## 📱 Como Usar

1. **Buscar um FII**: Digite o ticker do fundo imobiliário (ex: MXRF11) na barra de busca
2. **Ver Análise**: Visualize a comparação entre preço atual e valor patrimonial
3. **Entender P/VP**: 
   - P/VP < 0,95: Ativo está barato (boa oportunidade)
   - P/VP > 1,05: Ativo está caro (atenção)
   - 0,95 ≤ P/VP ≤ 1,05: Preço próximo ao valor patrimonial
4. **Explorar Categorias**: Clique em "Ver Ativos" para ver FIIs por categoria
5. **Salvar Favoritos**: Clique na estrela para adicionar aos favoritos
6. **Acompanhar**: Acesse a página de Favoritos para ver seus ativos salvos

## 📊 Indicadores

A aplicação mostra:

- **Preço Atual**: Valor de mercado da cota
- **Valor Patrimonial (VP)**: Valor real por cota baseado no patrimônio
- **P/VP**: Razão entre Preço e Valor Patrimonial
- **Dividend Yield**: Rentabilidade dos proventos
- **Valorização 12m**: Performance do ativo no último ano
- **Recomendações**: Insights baseados na diferença entre preço e VP

## 🔧 Estrutura do Projeto

```
realValue/
├── frontend/              # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── services/     # Serviços e APIs
│   │   └── utils/        # Utilitários
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # API Proxy Node.js
│   ├── server.js         # Servidor Express
│   └── package.json
│
├── package.json          # Scripts de desenvolvimento (raiz)
└── README.md
```

## 🔌 API Endpoints

### Backend (Proxy)

- `GET /api/search/:ticker` - Busca básica de FII
- `GET /api/fii/:ticker` - Busca dados detalhados do FII
- `GET /health` - Health check do servidor

## 📝 Notas Importantes

### API de Dados

O backend faz proxy para a API do Status Invest (`https://statusinvest.com.br`), contornando problemas de CORS. 

O backend tenta:
1. Endpoint principal: `/v1/fund/main/{ticker}`
2. Endpoint alternativo: `/home/mainsearchquery`
3. Fallback: Scraping básico da página HTML (se necessário)

### Favoritos

Os favoritos são salvos no `localStorage` do navegador. Cada usuário terá sua própria lista de favoritos no dispositivo que usar.

### Variáveis de Ambiente

Você pode configurar a URL da API backend criando um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:3001/api
```

## 🎨 Personalização

As variáveis CSS podem ser modificadas em `frontend/src/index.css`:

```css
:root {
  --primary-color: #1e3a8a;
  --success-color: #10b981;
  --danger-color: #ef4444;
  /* ... */
}
```

## 🚀 Deploy

### Frontend

Para fazer deploy do frontend, gere o build e sirva a pasta `frontend/dist/` com um servidor web (Nginx, Apache, Vercel, Netlify, etc.).

### Backend

Para fazer deploy do backend, você precisa de um servidor Node.js. Configure:
- Porta (via variável de ambiente `PORT`)
- CORS se necessário (ajustar em `backend/server.js`)

## 📄 Licença

Este projeto é open source e está disponível para uso pessoal e comercial.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ para ajudar na análise de investimentos imobiliários**
