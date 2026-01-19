const FAVORITES_KEY = 'realvalue_favorites'

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY)
    return favorites ? JSON.parse(favorites) : []
  } catch (error) {
    console.error('Erro ao ler favoritos:', error)
    return []
  }
}

export const saveFavorite = (ticker) => {
  try {
    const favorites = getFavorites()
    if (!favorites.includes(ticker)) {
      favorites.push(ticker)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
    return true
  } catch (error) {
    console.error('Erro ao salvar favorito:', error)
    return false
  }
}

export const removeFavorite = (ticker) => {
  try {
    const favorites = getFavorites()
    const updated = favorites.filter(f => f !== ticker)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    return false
  }
}

export const isFavorite = (ticker) => {
  const favorites = getFavorites()
  return favorites.includes(ticker)
}
