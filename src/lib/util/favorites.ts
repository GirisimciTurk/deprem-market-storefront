export interface FavoriteProduct {
  id: string
  title: string
  price: string
  image: string
  handle: string
  description: string
}

export function getFavorites(): FavoriteProduct[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem("deprem_market_favorites")
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    console.error("Failed to load favorites", e)
    return []
  }
}

export function addFavorite(product: FavoriteProduct): void {
  if (typeof window === "undefined") return
  try {
    const favorites = getFavorites()
    if (!favorites.some((item) => item.id === product.id)) {
      const updated = [...favorites, product]
      localStorage.setItem("deprem_market_favorites", JSON.stringify(updated))
      window.dispatchEvent(new Event("favorites-updated"))
    }
  } catch (e) {
    console.error("Failed to add favorite", e)
  }
}

export function removeFavorite(id: string): void {
  if (typeof window === "undefined") return
  try {
    const favorites = getFavorites()
    const updated = favorites.filter((item) => item.id !== id)
    localStorage.setItem("deprem_market_favorites", JSON.stringify(updated))
    window.dispatchEvent(new Event("favorites-updated"))
  } catch (e) {
    console.error("Failed to remove favorite", e)
  }
}

export function isProductFavorite(id: string): boolean {
  if (typeof window === "undefined") return false
  const favorites = getFavorites()
  return favorites.some((item) => item.id === id)
}
