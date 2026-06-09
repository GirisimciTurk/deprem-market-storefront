"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface FavoriteProduct {
  id: string
  title: string
  price: string
  image: string
  handle: string
  description: string
}

const defaultFavorites: FavoriteProduct[] = [
  {
    id: "prod_mini_deprem",
    title: "EKYP Mini Afet & Deprem Çantası",
    price: "799,00 TL",
    image: "https://images.unsplash.com/photo-1583198432857-e6f966144fe9?auto=format&fit=crop&q=80&w=400",
    handle: "ekyp-mini-afet-deprem-cantasi",
    description: "Acil durumlar için özel olarak hazırlanmış 24 parça temel yaşam destek paketi."
  },
  {
    id: "prod_pro_ilkyardim",
    title: "EKYP Profesyonel İlkyardım Seti",
    price: "449,00 TL",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400",
    handle: "ekyp-profesyonel-ilkyardim-seti",
    description: "Tüm pansuman ve steril müdahale ekipmanlarını içeren dayanıklı çanta."
  }
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("deprem_market_favorites")
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch {
        setFavorites(defaultFavorites)
      }
    } else {
      localStorage.setItem("deprem_market_favorites", JSON.stringify(defaultFavorites))
      setFavorites(defaultFavorites)
    }
  }, [])

  const handleRemove = (id: string) => {
    const updated = favorites.filter(item => item.id !== id)
    localStorage.setItem("deprem_market_favorites", JSON.stringify(updated))
    setFavorites(updated)
  }

  const handleAddToCart = (item: FavoriteProduct) => {
    alert(`${item.title} sepetinize eklendi!`)
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          ❤️ Favori Ürünlerim
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Beğendiğiniz ve daha sonra satın almak üzere kaydettiğiniz acil durum ekipmanları.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((item) => (
            <div 
              key={item.id} 
              className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Product Image */}
              <LocalizedClientLink
                href={`/products/${item.handle}`}
                className="w-24 h-24 rounded-xl overflow-hidden bg-ui-bg-base border flex-shrink-0 relative block"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </LocalizedClientLink>

              {/* Product Details */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <LocalizedClientLink href={`/products/${item.handle}`}>
                    <h3 className="font-bold text-ui-fg-base text-sm sm:text-base truncate group-hover:text-red-655 transition-colors hover:text-red-600">
                      {item.title}
                    </h3>
                  </LocalizedClientLink>
                  <p className="text-3xs sm:text-2xs text-ui-fg-muted line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-red-650 text-sm sm:text-base">
                    {item.price}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="border border-ui-border-base hover:bg-red-50 hover:text-red-700 text-ui-fg-subtle p-2 rounded-lg transition-colors text-xs"
                      title="Favorilerden Kaldır"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-ui-bg-subtle rounded-2xl border border-ui-border-base border-dashed">
          <span className="text-5xl mb-4 block">❤️</span>
          <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">
            Favori ürününüz bulunmuyor
          </h3>
          <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-sm mx-auto mb-6">
            Alışveriş yaparken beğendiğiniz ürünleri daha sonra kolayca bulmak için favorilerinize ekleyebilirsiniz.
          </p>
          <LocalizedClientLink
            href="/store"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Mağazayı İncele
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
