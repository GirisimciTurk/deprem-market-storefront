"use client"

import React, { useCallback, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sdk } from "@lib/config"
import { useWishlist } from "@lib/context/wishlist-context"
import { getProductPrice } from "@lib/util/get-product-price"

/**
 * Hesap panelindeki "Favori Ürünlerim" listesi (kompakt kart düzeni).
 *
 * Id'ler hesaba bağlı wishlist context'inden; ürün bilgisi (başlık, görsel,
 * GÜNCEL fiyat) canlı çekilir. Eskiden localStorage'daki anlık görüntü
 * gösteriliyordu, fiyat değişince bayat kalıyordu.
 */
export default function AccountFavorites({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const { productIds, toggle, pendingId } = useWishlist()
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (productIds.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    try {
      const qp = new URLSearchParams()
      productIds.forEach((id) => qp.append("id", id))
      qp.append("region_id", region.id)
      qp.append("fields", "*variants.calculated_price,+metadata,+tags")

      const res = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
        `/store/products?${qp.toString()}`,
        { method: "GET" }
      )
      const api = res?.products || []
      setProducts(
        productIds
          .map((id) => api.find((p) => p.id === id))
          .filter((p): p is HttpTypes.StoreProduct => Boolean(p))
      )
    } catch (e) {
      console.error("[AccountFavorites] Ürünler çekilemedi", e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [productIds, region.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          ❤️ Favori Ürünlerim
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Beğendiğiniz ve daha sonra satın almak üzere kaydettiğiniz acil durum
          ekipmanları. Hesabınıza kayıtlıdır — her cihazdan aynı listeye
          ulaşırsınız.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => {
            const { cheapestPrice } = getProductPrice({ product })
            return (
              <div
                key={product.id}
                className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="w-24 h-24 rounded-xl overflow-hidden bg-ui-bg-base border shrink-0 relative block"
                >
                  {product.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.thumbnail}
                      alt={product.title ?? ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </LocalizedClientLink>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <LocalizedClientLink href={`/products/${product.handle}`}>
                      <h3 className="font-bold text-ui-fg-base text-sm sm:text-base truncate transition-colors hover:text-brand-600">
                        {product.title}
                      </h3>
                    </LocalizedClientLink>
                    <p className="text-3xs sm:text-2xs text-ui-fg-muted line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="font-extrabold text-brand-650 text-sm sm:text-base">
                      {cheapestPrice?.calculated_price ?? "—"}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggle(product.id)}
                        disabled={pendingId === product.id}
                        className="border border-ui-border-base hover:bg-brand-50 hover:text-brand-700 text-ui-fg-subtle p-2 rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-wait"
                        title="Favorilerden Kaldır"
                        aria-label={`${product.title} ürününü favorilerden kaldır`}
                      >
                        ✕
                      </button>
                      {/* Sepete ekleme varyant seçimi gerektirdiği için ürün
                          sayfasına gönderilir (eskiden burada sahte bir
                          alert() vardı, hiçbir şey sepete eklenmiyordu). */}
                      <LocalizedClientLink
                        href={`/products/${product.handle}`}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm flex items-center"
                      >
                        Ürüne Git
                      </LocalizedClientLink>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-ui-bg-subtle rounded-2xl border border-ui-border-base border-dashed">
          <span className="text-5xl mb-4 block">❤️</span>
          <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">
            Favori ürününüz bulunmuyor
          </h3>
          <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-sm mx-auto mb-6">
            Alışveriş yaparken beğendiğiniz ürünleri daha sonra kolayca bulmak
            için favorilerinize ekleyebilirsiniz.
          </p>
          <LocalizedClientLink
            href="/store"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Mağazayı İncele
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
