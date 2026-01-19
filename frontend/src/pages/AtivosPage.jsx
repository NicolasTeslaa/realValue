import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFIIsByCategory, getCategories, getFIIDetailsByCategory } from '../services/api'
import './AtivosPage.css'

const AtivosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [fiiDataByCategory, setFiiDataByCategory] = useState({})
  const [failedTickersByCategory, setFailedTickersByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const categories = getCategories()
  const fiiByCategory = getFIIsByCategory()

  // Ativos populares/sugestões (sempre mostrados)
  const popularFIIs = ['MXRF11', 'HGLG11', 'XPML11', 'KNCR11', 'VISC11', 'RBRR11', 'CPTS11', 'XPLG11']

  useEffect(() => {
    loadAllCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData(selectedCategory)
    }
  }, [selectedCategory])

  const loadAllCategories = async () => {
    setLoading(true)
    try {
      const dataByCategory = {}
      const failedByCategory = {}
      
      // Buscar dados de todas as categorias
      for (const category of categories) {
        const tickers = fiiByCategory[category] || []
        try {
          const result = await getFIIDetailsByCategory(tickers)
          dataByCategory[category] = result.success || []
          failedByCategory[category] = result.failed || []
        } catch (error) {
          console.error(`Erro ao carregar categoria ${category}:`, error)
          dataByCategory[category] = []
          failedByCategory[category] = tickers // Se falhar tudo, todos os tickers falharam
        }
      }

      setFiiDataByCategory(dataByCategory)
      setFailedTickersByCategory(failedByCategory)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryData = async (category) => {
    if (fiiDataByCategory[category] && fiiDataByCategory[category].length > 0) {
      return // Já carregado
    }

    try {
      const tickers = fiiByCategory[category] || []
      const result = await getFIIDetailsByCategory(tickers)
      setFiiDataByCategory(prev => ({
        ...prev,
        [category]: result.success || []
      }))
      setFailedTickersByCategory(prev => ({
        ...prev,
        [category]: result.failed || []
      }))
    } catch (error) {
      console.error(`Erro ao carregar categoria ${category}:`, error)
    }
  }

  const handleTickerClick = (ticker) => {
    navigate(`/?ticker=${ticker}`)
  }

  const getPvpColor = (pvp) => {
    if (!pvp || pvp === 0) return 'neutral'
    if (pvp < 0.95) return 'buy'
    if (pvp > 1.05) return 'sell'
    return 'neutral'
  }

  // Renderizar card de ativo
  const renderAtivoCard = (fii) => {
    const pvp = fii.pvp || (fii.patrimonialValue > 0 && fii.currentPrice > 0 ? fii.currentPrice / fii.patrimonialValue : 0)
    return (
      <div
        key={fii.ticker}
        className="ativo-card"
        onClick={() => handleTickerClick(fii.ticker)}
      >
        <div className="ativo-header">
          <div>
            <h3 className="ativo-ticker">{fii.ticker}</h3>
            <p className="ativo-name">{fii.name || 'Carregando...'}</p>
          </div>
          {pvp > 0 && (
            <span className={`pvp-badge ${getPvpColor(pvp)}`}>
              P/VP {pvp.toFixed(2)}
            </span>
          )}
        </div>
        <div className="ativo-info">
          <div className="info-row">
            <span className="info-label">Preço:</span>
            <span className="info-value">
              {fii.currentPrice > 0 ? `R$ ${fii.currentPrice.toFixed(2)}` : '-'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">VP:</span>
            <span className="info-value">
              {fii.patrimonialValue > 0 ? `R$ ${fii.patrimonialValue.toFixed(2)}` : '-'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">DY:</span>
            <span className="info-value">
              {fii.dividendYield > 0 ? `${fii.dividendYield.toFixed(2)}%` : '-'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar lista de tickers quando não há dados ou quando falharam
  const renderTickerList = (tickers) => {
    if (!tickers || tickers.length === 0) return null
    
    return (
      <div className="tickers-list">
        <p className="tickers-hint">Clique em um ticker para buscar dados:</p>
        <div className="tickers-grid">
          {tickers.map(ticker => (
            <button
              key={ticker}
              className="ticker-button"
              onClick={() => handleTickerClick(ticker)}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ativos-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando dados dos ativos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ativos-page">
      <div className="container">
        <div className="page-header">
          <h1>Ativos por Categoria</h1>
          <p className="page-subtitle">
            Explore os fundos imobiliários mais famosos organizados por tipo de investimento
          </p>
        </div>

        {/* Seção de Ativos Populares/Sugestões */}
        <div className="popular-section">
          <h2 className="section-title">⭐ Ativos Populares</h2>
          <p className="section-subtitle">Sugestões de FIIs mais procurados</p>
          <div className="ativos-grid">
            {popularFIIs.map(ticker => {
              const fii = Object.values(fiiDataByCategory)
                .flat()
                .find(f => f?.ticker === ticker)
              
              if (fii) {
                return renderAtivoCard(fii)
              }
              
              // Se não tem dados, mostrar botão
              return (
                <button
                  key={ticker}
                  className="ticker-button-large"
                  onClick={() => handleTickerClick(ticker)}
                >
                  <span className="ticker-code">{ticker}</span>
                  <span className="ticker-hint">Clique para buscar</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="categories-container">
          <div className="categories-nav">
            <button
              className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="categories-content">
            {selectedCategory === null ? (
              // Mostrar todas as categorias
              categories.map(category => {
                const fiiList = fiiDataByCategory[category] || []
                const failedTickers = failedTickersByCategory[category] || []
                
                return (
                  <div key={category} className="category-section">
                    <h2 className="category-title">{category}</h2>
                    {fiiList.length > 0 && (
                      <div className="ativos-grid">
                        {fiiList.map(renderAtivoCard)}
                      </div>
                    )}
                    {failedTickers.length > 0 && renderTickerList(failedTickers)}
                    {fiiList.length === 0 && failedTickers.length === 0 && (
                      <div className="empty-category">
                        <p>Nenhum ativo encontrado nesta categoria</p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              // Mostrar apenas a categoria selecionada
              <div className="category-section">
                <h2 className="category-title">{selectedCategory}</h2>
                {fiiDataByCategory[selectedCategory] && fiiDataByCategory[selectedCategory].length > 0 && (
                  <div className="ativos-grid">
                    {fiiDataByCategory[selectedCategory].map(renderAtivoCard)}
                  </div>
                )}
                {failedTickersByCategory[selectedCategory] && failedTickersByCategory[selectedCategory].length > 0 && 
                  renderTickerList(failedTickersByCategory[selectedCategory])
                }
                {(!fiiDataByCategory[selectedCategory] || fiiDataByCategory[selectedCategory].length === 0) && 
                 (!failedTickersByCategory[selectedCategory] || failedTickersByCategory[selectedCategory].length === 0) && (
                  <div className="empty-category">
                    <p>Carregando ativos desta categoria...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AtivosPage
