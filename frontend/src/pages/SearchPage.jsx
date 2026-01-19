import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import AssetCard from '../components/AssetCard'
import './SearchPage.css'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const [searchedTicker, setSearchedTicker] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (ticker) => {
    setLoading(true)
    setSearchedTicker(ticker)
    // O AssetCard vai carregar os dados automaticamente
    setTimeout(() => setLoading(false), 100)
  }

  useEffect(() => {
    const tickerFromUrl = searchParams.get('ticker')
    if (tickerFromUrl) {
      setLoading(true)
      setSearchedTicker(tickerFromUrl)
      setTimeout(() => setLoading(false), 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="search-page">
      <div className="container">
        <div className="page-header">
          <h1>Buscar Fundo Imobiliário</h1>
          <p className="page-subtitle">
            Compare o preço atual com o valor patrimonial e descubra se vale a pena investir
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {searchedTicker && (
          <div className="search-results">
            <AssetCard ticker={searchedTicker} />
          </div>
        )}

        {!searchedTicker && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>Busque um FII</h2>
            <p>
              Digite o ticker do fundo imobiliário acima para ver sua análise completa.
              Compare o preço de mercado com o valor patrimonial e receba recomendações.
            </p>
            <div className="example-tickers">
              <h3>Exemplos:</h3>
              <div className="ticker-list">
                <button 
                  className="ticker-chip"
                  onClick={() => handleSearch('MXRF11')}
                >
                  MXRF11
                </button>
                <button 
                  className="ticker-chip"
                  onClick={() => handleSearch('HGLG11')}
                >
                  HGLG11
                </button>
                <button 
                  className="ticker-chip"
                  onClick={() => handleSearch('XPML11')}
                >
                  XPML11
                </button>
                <button 
                  className="ticker-chip"
                  onClick={() => handleSearch('VISC11')}
                >
                  VISC11
                </button>
                <button 
                  className="ticker-chip"
                  onClick={() => handleSearch('KNCR11')}
                >
                  KNCR11
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
