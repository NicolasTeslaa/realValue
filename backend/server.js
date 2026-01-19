import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

const API_BASE = 'https://statusinvest.com.br'

// Headers realistas para evitar bloqueio do Cloudflare
const getRealisticHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
  'Referer': 'https://statusinvest.com.br/'
})

// Função para decodificar HTML entities
function decodeHtmlEntities(text) {
  if (!text) return text
  return text
    .replace(/&#xE7;/g, 'ç')
    .replace(/&#xE3;/g, 'ã')
    .replace(/&#xE1;/g, 'á')
    .replace(/&#xE9;/g, 'é')
    .replace(/&#xED;/g, 'í')
    .replace(/&#xF3;/g, 'ó')
    .replace(/&#xFA;/g, 'ú')
    .replace(/&#xC7;/g, 'Ç')
    .replace(/&#xC3;/g, 'Ã')
    .replace(/&#xC1;/g, 'Á')
    .replace(/&#xC9;/g, 'É')
    .replace(/&#xCD;/g, 'Í')
    .replace(/&#xD3;/g, 'Ó')
    .replace(/&#xDA;/g, 'Ú')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
}

// Rota de busca de FII
app.get('/api/search/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params
    const tickerUpper = ticker.toUpperCase().trim()
    const url = `${API_BASE}/home/mainsearchquery?q=${tickerUpper}`
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        ...getRealisticHeaders()
      },
      timeout: 10000
    })

    if (response.data && Array.isArray(response.data)) {
      const fii = response.data.find(item => 
        item.type === 7 && // Tipo 7 é FII
        item.code.toUpperCase() === tickerUpper
      )
      
      if (fii) {
        return res.json(fii)
      }
    }

    res.status(404).json({ error: 'FII não encontrado' })
  } catch (error) {
    console.error('Erro ao buscar FII:', error.message)
    res.status(500).json({ error: 'Erro ao buscar FII', details: error.message })
  }
})

// Função para normalizar dados da API para o formato esperado
function normalizeFIIData(ticker, data) {
  // Se data tem a estrutura do Status Invest API
  if (data.data) {
    const d = data.data
    return {
      ticker: d.ticker || ticker,
      name: decodeHtmlEntities(d.companyName || d.name || ''),
      currentPrice: parseFloat(d.price) || 0,
      patrimonialValue: d.priceBase ? parseFloat(d.priceBase) : (d.patrimonialValue ? parseFloat(d.patrimonialValue) : 0),
      pvp: parseFloat(d.pvp) || 0,
      dividendYield: parseFloat(d.dividendYield) || 0,
      valorization12m: parseFloat(d.valorization12) || parseFloat(d.variation12m) || 0,
      min52w: parseFloat(d.min52w) || 0,
      max52w: parseFloat(d.max52w) || 0,
      patrimonio: parseFloat(d.patrimonialValue) || 0,
      valorMercado: parseFloat(d.marketValue) || 0,
      cashPercent: parseFloat(d.cashPercentage) || 0,
      cashValue: parseFloat(d.cashValue) || 0,
      cotistas: parseInt(d.shareholders) || 0,
      cotas: parseInt(d.totalShares) || 0,
      lastDividend: parseFloat(d.lastDividend) || 0,
      lastDividendDate: d.lastDividendDate || ''
    }
  }

  // Se data é resultado básico da busca
  if (data.basic) {
    const basic = data.basic
    return {
      ticker: basic.code || ticker,
      name: decodeHtmlEntities(basic.name || ''),
      currentPrice: parseFloat(basic.price) || 0,
      patrimonialValue: 0,
      pvp: 0,
      dividendYield: 0,
      valorization12m: 0,
      min52w: 0,
      max52w: 0,
      patrimonio: 0,
      valorMercado: 0,
      cashPercent: 0,
      cashValue: 0,
      cotistas: 0,
      cotas: 0,
      lastDividend: 0,
      lastDividendDate: ''
    }
  }

  // Estrutura alternativa
  return {
    ticker: data.ticker || ticker,
    name: decodeHtmlEntities(data.name || ''),
    currentPrice: parseFloat(data.price) || parseFloat(data.currentPrice) || 0,
      patrimonialValue: data.patrimonialValue ? parseFloat(data.patrimonialValue) : (data.priceBase ? parseFloat(data.priceBase) : 0),
    pvp: parseFloat(data.pvp) || 0,
    dividendYield: parseFloat(data.dividendYield) || 0,
    valorization12m: parseFloat(data.valorization12m) || 0,
    min52w: parseFloat(data.min52w) || 0,
    max52w: parseFloat(data.max52w) || 0,
    patrimonio: parseFloat(data.patrimonio) || 0,
    valorMercado: parseFloat(data.marketValue) || 0,
    cashPercent: parseFloat(data.cashPercent) || 0,
    cashValue: parseFloat(data.cashValue) || 0,
    cotistas: parseInt(data.cotistas) || 0,
    cotas: parseInt(data.cotas) || 0,
    lastDividend: parseFloat(data.lastDividend) || 0,
    lastDividendDate: data.lastDividendDate || ''
  }
}

// Função para buscar VP de fonte alternativa (Brapi - API gratuita brasileira)
async function getVPFromAlternativeSource(ticker) {
  try {
    // Tentar Brapi API (gratuita e tem dados de FIIs)
    try {
      const brapiUrl = `https://brapi.dev/api/quote/${ticker}`
      const response = await axios.get(brapiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000
      })
      
      if (response.data?.results?.[0]) {
        const result = response.data.results[0]
        // Brapi retorna alguns dados, mas pode não ter VP direto
        // Pode ter bookValue ou outros campos
        if (result.bookValue) {
          return parseFloat(result.bookValue)
        }
      }
    } catch (brapiError) {
      console.log(`Brapi não disponível: ${brapiError.message}`)
    }
    
    // Tentar calcular VP usando P/VP se disponível de outras fontes
    // Ou retornar null para tentar outras estratégias
    
    return null
  } catch (error) {
    console.log(`Erro ao buscar VP de fonte alternativa: ${error.message}`)
    return null
  }
}

// Função melhorada para fazer scraping dos dados da página HTML
async function scrapeFIIData(ticker) {
  try {
    const url = `${API_BASE}/fundos-imobiliarios/${ticker.toLowerCase()}`
    
    const response = await axios.get(url, {
      headers: getRealisticHeaders(),
      timeout: 15000,
      maxRedirects: 5
    })

    const html = response.data
    
    // Verificar se foi bloqueado pelo Cloudflare
    if (html.includes('Cloudflare') || html.includes('cf-browser-verification') || html.includes('Just a moment')) {
      console.log(`${ticker}: Cloudflare bloqueando acesso`)
      return null
    }
    
    // Tentar extrair dados de JSON embutido no HTML (mais confiável)
    let embeddedData = null
    try {
      // Buscar por estruturas JSON comuns no Status Invest
      const jsonMatches = [
        html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s),
        html.match(/<script[^>]*id[^>]*>[\s\S]*?({[\s\S]*?"price"[\s\S]*?})[\s\S]*?<\/script>/i),
        html.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i),
        html.match(/"fundData"\s*:\s*({[^}]+})/i),
        html.match(/"data"\s*:\s*({[^}]*"priceBase"[^}]+})/i)
      ]
      
      for (const match of jsonMatches) {
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1])
            if (parsed) {
              embeddedData = parsed
              break
            }
          } catch (e) {
            // Tentar extrair objetos específicos
            const priceBaseMatch = match[1].match(/"priceBase"\s*:\s*"?(\d+[.,]\d+)"?/i)
            if (priceBaseMatch) {
              embeddedData = { priceBase: priceBaseMatch[1] }
              break
            }
          }
        }
      }
    } catch (e) {
      // Continuar com scraping normal
    }
    
    // Função auxiliar para extrair valores com validação
    const extractValue = (patterns, text, fieldName = '') => {
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          const value = match[1] || match[2] || match[3]
          const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.')
          const num = parseFloat(cleanValue)
          if (!isNaN(num) && num > 0) {
            // Validação adicional: rejeitar valores suspeitos
            if (fieldName === 'vp' && num === 5) {
              console.log(`⚠️ Valor 5 rejeitado para VP (pode ser falso positivo)`)
              continue // Pular este match e tentar próximo
            }
            return num
          }
        }
      }
      return null
    }

    // Padrões melhorados para extrair preço
    const pricePatterns = [
      /Valor atual[^<]*<[^>]*>R\$\s*(\d+[.,]\d+)/i,
      /R\$\s*(\d+[.,]\d+)[^<]*<\/strong>/i,
      /"price"\s*:\s*"(\d+[.,]\d+)"/i,
      /price["']?\s*[:=]\s*["']?(\d+[.,]\d+)/i,
      /(\d+[.,]\d+)[^<]*<[^>]*>.*Valor atual/i,
      /Valor atual[^>]*>([^<]+R\$\s*\d+[.,]\d+)/i
    ]

    // Padrões melhorados para extrair VP (Valor Patrimonial) - mais abrangentes
    const vpPatterns = [
      /Val\.?\s*patrim\.?\s*p\/cota[^<]*R\$\s*(\d+[.,]\d+)/i,
      /Valor patrimonial p\/cota[^<]*R\$\s*(\d+[.,]\d+)/i,
      /Val\.\s*patrimonial[^<]*R\$\s*(\d+[.,]\d+)/i,
      /VP[:\s]*R\$\s*(\d+[.,]\d+)/i,
      /"priceBase"\s*:\s*"(\d+[.,]\d+)"/i,
      /priceBase["']?\s*[:=]\s*["']?(\d+[.,]\d+)/i,
      /<strong[^>]*>R\$\s*(\d+[.,]\d+)[^<]*<\/strong>[^<]*Valor patrimonial/i,
      /Valor patrimonial[^<]*<[^>]*>R\$\s*(\d+[.,]\d+)/i,
      /val\.?\s*patrim\.?\s*p\/cota[^<]*>R\$\s*(\d+[.,]\d+)/i,
      /patrimonial.*p\/cota.*R\$\s*(\d+[.,]\d+)/is,
      /P\/VP[^<]*(\d+[.,]\d+)[^<]*Valor patrimonial.*R\$\s*(\d+[.,]\d+)/is,
      /<div[^>]*class[^>]*>.*Valor patrimonial[^<]*<[^>]*>R\$\s*(\d+[.,]\d+)/is
    ]

    const dyPatterns = [
      /Dividend Yield[^<]*(\d+[.,]\d+)/i,
      /DY[:\s]*(\d+[.,]\d+)/i,
      /"dividendYield"\s*:\s*"(\d+[.,]\d+)"/i
    ]

    const namePatterns = [
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<title>([^<|]+)/i,
      /"name"\s*:\s*"([^"]+)"/i
    ]

    let price = extractValue(pricePatterns, html, 'price')
    let vp = null
    let dy = extractValue(dyPatterns, html, 'dy')
    
    // Se encontrou dados embutidos, usar eles primeiro
    if (embeddedData) {
      if (embeddedData.priceBase) {
        const vpValue = parseFloat(String(embeddedData.priceBase).replace(',', '.'))
        if (!isNaN(vpValue) && vpValue > 0) {
          vp = vpValue
          console.log(`VP encontrado em dados embutidos: ${vp}`)
        }
      }
      if (embeddedData.price && !price) {
        price = parseFloat(String(embeddedData.price).replace(',', '.'))
      }
    }
    
    // Se não encontrou VP dos dados embutidos, tentar regex
    if (!vp || vp === 0) {
      vp = extractValue(vpPatterns, html, 'vp')
      if (vp) {
        console.log(`VP encontrado via regex: ${vp}`)
      }
    }
    
    let name = null
    for (const pattern of namePatterns) {
      const match = html.match(pattern)
      if (match) {
        name = match[1]?.trim().replace(/[-|].*/, '').trim()
        if (name) break
      }
    }

    // Se não encontrou VP, tentar procurar em seções específicas
    if (!vp) {
      // Procurar por seções que contenham "Valor patrimonial"
      const vpSection = html.match(/Valor patrimonial[^<]*<[^>]*>([^<]*R\$\s*\d+[.,]\d+[^<]*)/i)
      if (vpSection) {
        const vpMatch = vpSection[1].match(/(\d+[.,]\d+)/)
        if (vpMatch) {
          const num = parseFloat(vpMatch[1].replace(',', '.'))
          if (!isNaN(num) && num > 0) vp = num
        }
      }
      
      // Tentar padrão mais específico: "Val. patrim. p/cota"
      if (!vp) {
        const vpMatch2 = html.match(/Val\.\s*patrim\.?\s*p\/cota[^<]*<[^>]*>R\$\s*(\d+[.,]\d+)/i)
        if (vpMatch2) {
          const num = parseFloat(vpMatch2[1].replace(',', '.'))
          if (!isNaN(num) && num > 0) vp = num
        }
      }
      
      // Tentar buscar em elementos com data-* attributes ou classes específicas
      if (!vp) {
        const vpMatch3 = html.match(/<[^>]*data-value[^>]*>R\$\s*(\d+[.,]\d+)[^<]*<\/[^>]*>.*patrimonial/is)
        if (vpMatch3) {
          const num = parseFloat(vpMatch3[1].replace(',', '.'))
          if (!isNaN(num) && num > 0) vp = num
        }
      }
      
      // Última tentativa: buscar próximo a "patrimonial" ou "VP" (com validação mais rigorosa)
      if (!vp) {
        // Buscar número próximo a palavras-chave, mas com validação mais específica
        const contextPattern = /(?:Valor patrimonial|Val\.\s*patrim\.?\s*p\/cota|VP)[^<]*R\$\s*(\d+[.,]\d+)/gi
        let match
        const candidates = []
        while ((match = contextPattern.exec(html)) !== null) {
          const num = parseFloat(match[1].replace(',', '.'))
          if (!isNaN(num) && num > 0) {
            // Validar se o número faz sentido (VP geralmente está próximo do preço)
            if (price && num > price * 0.5 && num < price * 2) {
              candidates.push(num)
            } else if (!price) {
              candidates.push(num)
            }
          }
        }
        // Se encontrou candidatos válidos, usar o primeiro
        if (candidates.length > 0) {
          vp = candidates[0]
        }
      }
    }
    
    // Se ainda não encontrou VP e temos preço, tentar fonte alternativa
    if (!vp && price) {
      console.log(`Tentando buscar VP de fonte alternativa para ${ticker}...`)
      const altVP = await getVPFromAlternativeSource(ticker)
      if (altVP) {
        vp = altVP
      }
    }

    // Se não encontrou preço, retornar null
    if (!price) {
      console.log(`Não foi possível extrair preço para ${ticker} do HTML`)
      return null
    }

    // Decodificar nome se encontrado
    if (name) {
      name = decodeHtmlEntities(name)
    }

    // Validar VP antes de retornar (não pode ser um valor suspeito)
    let finalVP = 0
    if (vp && vp > 0) {
      // Rejeitar explicitamente o valor 5 (muito suspeito de ser falso positivo)
      if (vp === 5) {
        console.log(`❌ VP = 5 rejeitado para ${ticker} (valor suspeito)`)
        finalVP = 0
      }
      // Validar se VP faz sentido (deve estar próximo do preço, não muito diferente)
      else if (price && vp > 0) {
        // VP pode estar entre 30% e 300% do preço (variação razoável)
        if (vp >= price * 0.3 && vp <= price * 3) {
          finalVP = vp
          console.log(`✅ VP validado para ${ticker}: R$ ${finalVP} (Preço: R$ ${price})`)
        } else {
          console.log(`⚠️ VP rejeitado para ${ticker}: R$ ${vp} (fora do range esperado para preço R$ ${price})`)
          finalVP = 0
        }
      } else if (!price) {
        // Se não temos preço, aceitar VP positivo (exceto 5)
        if (vp !== 5) {
          finalVP = vp
        }
      }
    } else {
      console.log(`ℹ️ VP não encontrado para ${ticker}`)
    }

    return {
      price: price,
      patrimonialValue: finalVP, // 0 se não encontrou ou inválido
      dividendYield: dy || 0,
      name: name || ticker
    }
  } catch (error) {
    console.error(`Erro no scraping para ${ticker}:`, error.message)
    return null
  }
}

// Rota para buscar dados detalhados do FII
app.get('/api/fii/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params
    const tickerUpper = ticker.toUpperCase().trim()
    
    console.log(`Buscando dados para ${tickerUpper} diretamente do site Status Invest...`)
    
    // Estratégia principal: Scraping direto do HTML da página
    // Isso é mais confiável do que usar APIs que podem estar bloqueadas
    let scrapedData = await scrapeFIIData(tickerUpper)
    
    if (!scrapedData || !scrapedData.price) {
      // Se scraping falhar, tentar buscar nome via API de busca rápida
      try {
        const searchUrl = `${API_BASE}/home/mainsearchquery?q=${tickerUpper}`
        const searchResponse = await axios.get(searchUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 5000
        })

        if (searchResponse.data && Array.isArray(searchResponse.data)) {
          const fii = searchResponse.data.find(item => 
            item.type === 7 && item.code.toUpperCase() === tickerUpper
          )
          
          if (fii && !scrapedData) {
            // Usar dados básicos se scraping falhou completamente
            scrapedData = {
              price: parseFloat(fii.price) || 0,
              patrimonialValue: 0,
              dividendYield: 0,
              name: fii.name || tickerUpper
            }
          } else if (fii && scrapedData) {
            // Se temos scraping mas sem nome, usar nome da busca
            scrapedData.name = scrapedData.name || fii.name || tickerUpper
          }
        }
      } catch (apiError) {
        console.log(`Busca básica falhou: ${apiError.message}`)
      }
    }
    
    if (!scrapedData || !scrapedData.price) {
      console.log(`Não foi possível encontrar dados para ${tickerUpper}`)
      return res.status(404).json({ 
        error: 'Não foi possível encontrar dados para este FII',
        ticker: tickerUpper,
        hint: 'O Status Invest pode estar bloqueando requisições. Tente novamente em alguns instantes.'
      })
    }
    
    // Normalizar dados do scraping direto
    console.log(`📊 Dados brutos do scraping para ${tickerUpper}:`, {
      price: scrapedData.price,
      patrimonialValue: scrapedData.patrimonialValue,
      dividendYield: scrapedData.dividendYield,
      name: scrapedData.name
    })
    
    // Validar VP antes de normalizar
    let validVP = 0
    if (scrapedData.patrimonialValue && scrapedData.patrimonialValue > 0) {
      // Rejeitar explicitamente o valor 5
      if (scrapedData.patrimonialValue === 5) {
        console.log(`❌ VP = 5 rejeitado na normalização para ${tickerUpper}`)
        validVP = 0
      } else {
        validVP = scrapedData.patrimonialValue
      }
    }
    
    let normalizedData = {
      ticker: tickerUpper,
      name: decodeHtmlEntities(scrapedData.name || tickerUpper),
      currentPrice: scrapedData.price || 0,
      patrimonialValue: validVP,
      pvp: 0,
      dividendYield: scrapedData.dividendYield || 0,
      valorization12m: 0,
      min52w: 0,
      max52w: 0,
      patrimonio: 0,
      valorMercado: 0,
      cashPercent: 0,
      cashValue: 0,
      cotistas: 0,
      cotas: 0,
      lastDividend: 0,
      lastDividendDate: ''
    }
    
    // Calcular P/VP apenas se temos ambos os valores
    if (normalizedData.currentPrice > 0 && normalizedData.patrimonialValue > 0) {
      normalizedData.pvp = normalizedData.currentPrice / normalizedData.patrimonialValue
    }

    // Garantir que sempre temos pelo menos o ticker e nome
    if (!normalizedData.name || normalizedData.name === '') {
      normalizedData.name = tickerUpper
    }

    // Decodificar nome final
    normalizedData.name = decodeHtmlEntities(normalizedData.name)

    // Se não temos preço, retornar erro
    if (!normalizedData.currentPrice || normalizedData.currentPrice === 0) {
      return res.status(404).json({ 
        error: 'Dados incompletos: não foi possível obter o preço do ativo',
        ticker: tickerUpper
      })
    }

    console.log(`✅ Dados retornados para ${tickerUpper}: Preço R$ ${normalizedData.currentPrice}, VP R$ ${normalizedData.patrimonialValue || 'N/A'}`)
    res.json(normalizedData)
  } catch (error) {
    console.error(`❌ Erro ao buscar dados do FII ${ticker}:`, error.message)
    res.status(500).json({ 
      error: 'Erro ao buscar dados do FII', 
      details: error.message,
      ticker: ticker
    })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RealValue Backend API' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
  console.log(`📊 API Proxy para Status Invest`)
})
