import { useState, useEffect } from 'react'
import { getFIIDetails } from '../services/api'
import { saveFavorite, removeFavorite, isFavorite } from '../utils/storage'
import './AssetCard.css'

const AssetCard = ({ ticker, onRemove }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    loadData()
    setFavorite(isFavorite(ticker))
  }, [ticker])

  const loadData = async () => {
    setLoading(true)
    try {
      const fiiData = await getFIIDetails(ticker)
      setData(fiiData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = () => {
    if (favorite) {
      removeFavorite(ticker)
      setFavorite(false)
      if (onRemove) {
        onRemove(ticker)
      }
    } else {
      saveFavorite(ticker)
      setFavorite(true)
    }
  }

  const getRecommendation = () => {
    if (!data) return null

    // Calcular P/VP de forma segura (evitar divisão por zero)
    let pvp = 0
    if (data.pvp && data.pvp > 0) {
      pvp = data.pvp
    } else if (data.currentPrice > 0 && data.patrimonialValue > 0) {
      pvp = data.currentPrice / data.patrimonialValue
    }

    // Só mostrar recomendação se temos VP válido
    if (!pvp || pvp === 0 || !data.patrimonialValue || data.patrimonialValue === 0) {
      return null
    }

    const priceDiff = ((data.currentPrice - data.patrimonialValue) / data.patrimonialValue) * 100

    if (pvp < 0.95) {
      return {
        type: 'buy',
        message: 'Ótimo momento para comprar!',
        description: `O ativo está ${Math.abs(priceDiff).toFixed(2)}% abaixo do valor patrimonial`,
        color: '#10b981'
      }
    } else if (pvp > 1.05) {
      return {
        type: 'avoid',
        message: 'Atenção: Acima do valor patrimonial',
        description: `O ativo está ${priceDiff.toFixed(2)}% acima do valor patrimonial`,
        color: '#ef4444'
      }
    } else {
      return {
        type: 'neutral',
        message: 'Preço próximo ao valor patrimonial',
        description: `Diferença de ${priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(2)}% em relação ao VP`,
        color: '#6b7280'
      }
    }
  }

  if (loading) {
    return (
      <div className="asset-card loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados de {ticker}...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="asset-card error">
        <p>Não foi possível carregar os dados de {ticker}</p>
        <p className="error-hint">Verifique se o ticker está correto ou tente novamente mais tarde.</p>
        <button onClick={loadData} className="retry-btn">Tentar novamente</button>
      </div>
    )
  }

  // Validar se temos dados mínimos
  if (!data.currentPrice || data.currentPrice === 0) {
    return (
      <div className="asset-card error">
        <p>Dados incompletos para {ticker}</p>
        <p className="error-hint">O ativo foi encontrado mas não foi possível carregar todas as informações.</p>
        <button onClick={loadData} className="retry-btn">Tentar novamente</button>
      </div>
    )
  }

  const recommendation = getRecommendation()
  // Calcular P/VP de forma segura
  let pvp = 0
  if (data.pvp && data.pvp > 0) {
    pvp = data.pvp
  } else if (data.currentPrice > 0 && data.patrimonialValue > 0) {
    pvp = data.currentPrice / data.patrimonialValue
  }

  return (
    <div className="asset-card">
      <div className="asset-header">
        <div>
          <h2 className="asset-ticker">{data.ticker}</h2>
          <p className="asset-name">{data.name}</p>
        </div>
        <button
          onClick={handleFavoriteToggle}
          className={`favorite-btn ${favorite ? 'active' : ''}`}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="asset-values">
        <div className="value-row">
          <span className="value-label">Preço Atual:</span>
          <span className="value-amount">R$ {data.currentPrice.toFixed(2)}</span>
        </div>
        <div className="value-row">
          <span className="value-label">Valor Patrimonial:</span>
          <span className="value-amount patrimonial">
            {data.patrimonialValue > 0 ? `R$ ${data.patrimonialValue.toFixed(2)}` : 'N/A'}
          </span>
        </div>
        <div className="value-row">
          <span className="value-label">P/VP:</span>
          <span className={`value-amount pvp ${pvp > 0 ? (pvp < 1 ? 'below' : pvp > 1 ? 'above' : 'equal') : ''}`}>
            {pvp > 0 ? pvp.toFixed(2) : 'N/A'}
          </span>
        </div>
      </div>

      {recommendation && (
        <div className="recommendation" style={{ borderLeftColor: recommendation.color }}>
          <p className="recommendation-title">{recommendation.message}</p>
          <p className="recommendation-desc">{recommendation.description}</p>
        </div>
      )}

      <div className="asset-details">
        <div className="detail-item">
          <span className="detail-label">Dividend Yield</span>
          <span className="detail-value">{data.dividendYield?.toFixed(2)}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Valorização 12m</span>
          <span className={`detail-value ${data.valorization12m >= 0 ? 'positive' : 'negative'}`}>
            {data.valorization12m >= 0 ? '+' : ''}{data.valorization12m?.toFixed(2)}%
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Último Dividendo</span>
          <span className="detail-value">R$ {data.lastDividend?.toFixed(2)}</span>
        </div>
        {data.cashPercent && (
          <div className="detail-item">
            <span className="detail-label">Caixa</span>
            <span className="detail-value">{data.cashPercent.toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssetCard
