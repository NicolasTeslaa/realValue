import axios from 'axios'

// API base URL - usando o backend proxy
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Função para buscar dados básicos do FII
export const searchFII = async (ticker) => {
  try {
    const tickerUpper = ticker.toUpperCase().trim()
    const url = `${API_BASE}/search/${tickerUpper}`
    
    const response = await axios.get(url)

    if (response.data) {
      return response.data
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar FII:', error)
    throw error
  }
}

// Função para buscar dados detalhados do FII via backend proxy
export const getFIIDetails = async (ticker) => {
  try {
    const tickerUpper = ticker.toUpperCase().trim()
    const url = `${API_BASE}/fii/${tickerUpper}`
    
    const response = await axios.get(url, {
      timeout: 15000
    })

    if (response.data) {
      return response.data
    }

    throw new Error(`Não foi possível buscar dados para ${ticker}`)
  } catch (error) {
    console.error(`Erro ao buscar dados detalhados do FII ${ticker}:`, error)
    
    if (error.response?.status === 404) {
      throw new Error(`FII ${ticker} não encontrado`)
    }
    
    throw new Error(`Erro ao buscar dados para ${ticker}: ${error.message}`)
  }
}

// Retorna estrutura de categorias com listas de tickers
export const getFIIsByCategory = () => {
  const categories = {
    'Tijolo': ['MXRF11', 'HGLG11', 'KNCR11', 'HCTR11', 'VISC11'],
    'Papel': ['XPML11', 'RBRR11', 'BRCO11', 'CPTS11', 'DEVA11'],
    'Shopping': ['XPML11', 'VISC11', 'CCRF11', 'BRPR11', 'MALL11'],
    'Escritórios': ['HGLG11', 'VTLT11', 'HGRU11', 'BRCR11', 'BTLG11'],
    'Logística': ['HGLG11', 'XPLG11', 'KNCR11', 'VILG11', 'GGRC11'],
    'Híbrido': ['MXRF11', 'KNCR11', 'BRCO11', 'HGCR11', 'BCFF11']
  }

  return categories
}

// Função auxiliar para processar em lotes (pool de concorrência)
const processInBatches = async (items, batchSize, processor) => {
  const results = []
  
  // Processar em lotes para controlar concorrência
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchPromises = batch.map((item, index) => 
      processor(item, i + index)
    )
    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults.map((result, idx) => ({
      ...result,
      ticker: batch[idx]
    })))
  }
  
  return results
}

// Função auxiliar para buscar múltiplos FIIs de uma categoria em paralelo
export const getFIIDetailsByCategory = async (tickers) => {
  // Usar pool de concorrência (10 requisições simultâneas)
  // Isso acelera o processo mas evita sobrecarregar o servidor
  const CONCURRENCY_LIMIT = 10
  
  const results = await processInBatches(
    tickers,
    CONCURRENCY_LIMIT,
    async (ticker) => {
      try {
        const data = await getFIIDetails(ticker)
        if (data && data.currentPrice > 0) {
          return data
        }
        throw new Error('Dados inválidos')
      } catch (error) {
        console.log(`Falha ao buscar ${ticker}:`, error.message)
        throw error
      }
    }
  )
  
  // Separar sucessos e falhas
  const success = []
  const failed = []
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      success.push(result.value)
    } else {
      failed.push(result.ticker)
    }
  })
  
  return {
    success,
    failed
  }
}

// Retorna todas as categorias disponíveis
export const getCategories = () => {
  return ['Tijolo', 'Papel', 'Shopping', 'Escritórios', 'Logística', 'Híbrido']
}
