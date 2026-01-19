import { useState, useEffect } from 'react'
import { getFavorites } from '../utils/storage'
import AssetCard from '../components/AssetCard'
import './FavoritesPage.css'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    const favs = getFavorites()
    setFavorites(favs)
  }

  const handleRemove = (ticker) => {
    setFavorites(prev => prev.filter(t => t !== ticker))
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="page-header">
          <h1>Meus Favoritos</h1>
          <p className="page-subtitle">
            Acompanhe os ativos que você marcou como favoritos
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h2>Nenhum favorito ainda</h2>
            <p>
              Você ainda não adicionou nenhum ativo aos favoritos.
              Busque um FII e adicione aos favoritos para acompanhá-lo aqui.
            </p>
          </div>
        ) : (
          <div className="favorites-list">
            {favorites.map(ticker => (
              <AssetCard 
                key={ticker} 
                ticker={ticker}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage
