"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getFavorites } from "@lib/util/favorites"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sdk } from "@lib/config"

type FavoritesTemplateProps = {
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function FavoritesTemplate({
  region,
  countryCode: _countryCode,
}: FavoritesTemplateProps) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavoriteProducts = async () => {
    const favorites = getFavorites()
    if (favorites.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      const ids = favorites.map((item) => item.id)
      console.info(
        `[FavoritesTemplate] Initialized fetch for ${favorites.length} user favorites from localStorage`
      )
      console.debug(
        `[FavoritesTemplate] Outgoing query product IDs: ${ids.join(", ")}`
      )

      const queryParams = new URLSearchParams()
      ids.forEach((id) => queryParams.append("id", id))
      queryParams.append("region_id", region.id)
      queryParams.append(
        "fields",
        "*variants.calculated_price,+variants.inventory_quantity,+variants.metadata,*variants.images,+metadata,+tags,"
      )

      // Fetch up-to-date prices, inventory and metadata from Medusa
      const response = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
      }>(`/store/products?${queryParams.toString()}`, {
        method: "GET",
      })

      const apiProducts = response?.products || []
      console.info(
        `[FavoritesTemplate] API returned ${apiProducts.length} matching products from store database`
      )

      // Self-healing merge: map each stored favorite. If in API response, use live data.
      // Otherwise, gracefully fall back to localStorage cached snapshot so nothing is blank!
      const mergedProducts = favorites.map((fav) => {
        const liveProduct = apiProducts.find((p) => p.id === fav.id)
        if (liveProduct) {
          console.debug(
            `[FavoritesTemplate] Synced live data from DB for product: "${liveProduct.title}" (ID: ${fav.id})`
          )
          return liveProduct
        }

        console.warn(
          `[FavoritesTemplate] Product with ID ${fav.id} ("${fav.title}") not returned by API. Invoking self-healing cache recovery fallback.`
        )

        // Clean numeric parsed price
        const parsedPrice = parseFloat(fav.price.replace(/[^\d]/g, "")) || 0

        return {
          id: fav.id,
          title: fav.title,
          handle: fav.handle,
          thumbnail: fav.image,
          description: fav.description,
          variants: [
            {
              id: `var_${fav.id}`,
              title: "Default",
              calculated_price: {
                calculated_amount: parsedPrice,
                original_amount: parsedPrice,
                currency_code: "try",
                calculated_price: { price_list_type: "default" },
              },
            },
          ],
        } as any
      })

      setProducts(mergedProducts)
    } catch (e) {
      console.error(
        "[FavoritesTemplate] Error querying products endpoint. Rendering complete fallback list from local storage cache.",
        e
      )

      const fallbackProducts = favorites.map((fav) => {
        const parsedPrice = parseFloat(fav.price.replace(/[^\d]/g, "")) || 0
        return {
          id: fav.id,
          title: fav.title,
          handle: fav.handle,
          thumbnail: fav.image,
          description: fav.description,
          variants: [
            {
              id: `var_${fav.id}`,
              title: "Default",
              calculated_price: {
                calculated_amount: parsedPrice,
                original_amount: parsedPrice,
                currency_code: "try",
                calculated_price: { price_list_type: "default" },
              },
            },
          ],
        }
      }) as any[]

      setProducts(fallbackProducts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavoriteProducts()

    // Listen for favorite item changes to update the grid reactively
    window.addEventListener("favorites-updated", loadFavoriteProducts)
    return () => {
      window.removeEventListener("favorites-updated", loadFavoriteProducts)
    }
  }, [region.id])

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
