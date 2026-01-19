import { useState } from 'react'
import './SearchBar.css'

const SearchBar = ({ onSearch, loading }) => {
  const [ticker, setTicker] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const tickerUpper = ticker.toUpperCase().trim()
    if (tickerUpper) {
      onSearch(tickerUpper)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Digite o ticker do FII (ex: MXRF11)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        disabled={loading}
      />
      <button 
        type="submit" 
        className="search-btn"
        disabled={loading || !ticker.trim()}
      >
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}

export default SearchBar
