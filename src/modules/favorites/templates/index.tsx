"use client"

import React, { useCallback, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sdk } from "@lib/config"
import { useWishlist } from "@lib/context/wishlist-context"

type FavoritesTemplateProps = {
  region: HttpTypes.StoreRegion
  countryCode: string
}

/**
 * "Beğendiklerim" sayfası. Favori ürün id'leri hesaba bağlı wishlist
 * context'inden gelir; ürünlerin kendisi bölge/fiyat bağlamıyla canlı çekilir.
 *
 * Eskiden id'ler localStorage'dan okunuyor ve ürün bulunamazsa orada saklanan
 * eski anlık görüntü (başlık/fiyat) gösteriliyordu. Artık snapshot tutulmuyor:
 * silinmiş/yayından kaldırılmış ürün listede hayalet olarak durmaz.
 */
export default function FavoritesTemplate({
  region,
  countryCode: _countryCode,
}: FavoritesTemplateProps) {
  const { productIds, isLoggedIn } = useWishlist()
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavoriteProducts = useCallback(async () => {
    if (productIds.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      const queryParams = new URLSearchParams()
      productIds.forEach((id) => queryParams.append("id", id))
      queryParams.append("region_id", region.id)
      queryParams.append(
        "fields",
        "*variants.calculated_price,+variants.inventory_quantity,+variants.metadata,*variants.images,+metadata,+tags,"
      )

      const response = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
      }>(`/store/products?${queryParams.toString()}`, { method: "GET" })

      const apiProducts = response?.products || []
      // Favori sırasını koru (backend en yeni önce döndürüyor); artık satılmayan
      // ürünler listeden düşer.
      const ordered = productIds
        .map((id) => apiProducts.find((p) => p.id === id))
        .filter((p): p is HttpTypes.StoreProduct => Boolean(p))

      setProducts(ordered)
    } catch (e) {
      console.error("[FavoritesTemplate] Ürünler çekilemedi", e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productIds, region.id])

  useEffect(() => {
    loadFavoriteProducts()
  }, [loadFavoriteProducts])

  // Giriş yoksa favori de yok — listeyi boş göstermek yerine ne yapması
  // gerektiğini söyle.
  if (!isLoggedIn) {
    return (
      <div className="content-container py-10">
        <div className="border-b border-gray-150 pb-5 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-x-2">
            <span>❤️</span> Beğendiklerim
          </h1>
        </div>
        <div
          className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 max-w-xl mx-auto px-6 shadow-3xs"
          data-testid="favorites-login-required"
        >
          <span className="text-6xl mb-6 block">🔒</span>
          <h3 className="font-extrabold text-slate-700 text-lg mb-2">
            Favorileriniz hesabınıza bağlı
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed font-medium">
            Giriş yaptığınızda beğendiğiniz ürünler hesabınıza kaydedilir ve
            telefon, tablet ya da bilgisayar — hangi cihazdan girerseniz girin
            aynı liste sizi karşılar.
          </p>
          <LocalizedClientLink
            href="/account"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3 px-8 rounded-lg shadow-md transition-all duration-300 inline-block hover:-translate-y-0.5"
          >
            Giriş Yap
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="content-container py-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />
        <span className="text-gray-500 font-semibold text-sm">
          Favorileriniz yükleniyor...
        </span>
      </div>
    )
  }

  return (
    <div className="content-container py-10">
      <div className="border-b border-gray-150 pb-5 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-x-2">
          <span>❤️</span> Beğendiklerim
        </h1>
        <p className="text-sm text-gray-500 mt-1.5 font-medium">
          Daha sonra satın almak veya incelemek için kaydettiğiniz tüm acil
          durum ürünleriniz burada saklanır.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-8">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductPreview product={product} region={region} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 max-w-xl mx-auto px-6 shadow-3xs">
          <span className="text-6xl mb-6 block animate-pulse">❤️</span>
          <h3 className="font-extrabold text-slate-700 text-lg mb-2">
            Henüz favori ürününüz yok
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed font-medium">
            Alışveriş yaparken beğendiğiniz ürünleri daha sonra kolayca bulmak
            için ürün görselindeki kalp simgesine tıklayabilirsiniz.
          </p>
          <LocalizedClientLink
            href="/store"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3 px-8 rounded-lg shadow-md transition-all duration-300 inline-block hover:-translate-y-0.5"
          >
            Mağazayı İncele
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
