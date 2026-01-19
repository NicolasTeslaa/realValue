# Fontes Alternativas de Dados para FIIs

Este documento lista as fontes alternativas que podem ser usadas para buscar dados de FIIs quando o Status Invest não estiver disponível.

## APIs Disponíveis

### 1. Brapi (Recomendado - Gratuita)
- **URL**: https://brapi.dev
- **Endpoint**: `GET /api/quote/{ticker}`
- **Dados disponíveis**: Preço, variação, mas pode não ter VP direto
- **Limite**: Gratuita com rate limit
- **Exemplo**: `https://brapi.dev/api/quote/MXRF11`

### 2. HG Brasil
- **URL**: https://hgbrasil.com
- **Requer**: API Key (gratuita com limitações)
- **Dados**: Preço, P/VP (pode calcular VP)
- **Limite**: 100 requisições/dia no plano gratuito

### 3. CVM (Dados Oficiais)
- **URL**: Portal Dados Abertos CVM
- **Formato**: XML/CSV dos Informes Trimestrais
- **Campo**: `VL_PATRIM_QUOTA` (Valor Patrimonial da Cota)
- **Limite**: Dados públicos, mas precisa parsing de XML
- **Vantagem**: Dados oficiais e confiáveis

### 4. Alpha Vantage
- Principalmente para ações internacionais, mas pode ter alguns dados de FIIs

## Implementação Atual

Atualmente, o sistema tenta:
1. Status Invest (scraping HTML)
2. Brapi (se Status Invest falhar para VP)
3. Cálculo alternativo baseado em outros dados disponíveis

## Como Adicionar Nova Fonte

1. Criar função em `server.js`:
```javascript
async function getFIIDataFromSource(ticker) {
  // Implementar busca
}
```

2. Adicionar na rota `/api/fii/:ticker` como fallback

3. Normalizar dados para o formato esperado pelo frontend

## Notas

- Brapi é gratuita mas pode ter rate limits
- CVM tem dados oficiais mas requer parsing de XML
- HG Brasil requer cadastro e API key
