import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import FavoriteButton from "@modules/products/components/favorite-button"
import ShareButton from "@modules/products/components/share-button"
import ProductRating from "@modules/products/components/product-rating"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const seller = (product as any).seller as
    | {
        id: string
        name: string
        handle: string
        rating_sum?: number | null
        rating_count?: number | null
      }
    | undefined

  const sellerRating =
    seller && (seller.rating_count ?? 0) > 0
      ? Math.round(((seller.rating_sum ?? 0) / (seller.rating_count ?? 1)) * 10) /
        10
      : null

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-3">
        {/* Collection & Brand */}
        <div className="flex items-center gap-x-2 text-sm">
          {seller ? (
            <span className="text-gray-500">
              Satıcı:{" "}
              <LocalizedClientLink
                href={`/satici/${seller.handle}`}
                className="font-bold text-orange-600 tracking-wide hover:text-orange-500 transition-colors"
              >
                {seller.name}
              </LocalizedClientLink>
              {sellerRating !== null && (
                <span className="ml-1 text-xs font-semibold text-yellow-500">
                  ⭐ {sellerRating.toFixed(1)}
                </span>
              )}
            </span>
          ) : (
            <span className="font-bold text-orange-600 tracking-wide">
              depremTek Market
            </span>
          )}
          {product.collection && (
            <>
              <span className="text-gray-300">/</span>
              <LocalizedClientLink
                href={`/collections/${product.collection.handle}`}
                className="text-gray-500 hover:text-orange-500 transition-colors"
              >
                {product.collection.title}
              </LocalizedClientLink>
            </>
          )}
        </div>

        {/* Product Title & Favorite Button */}
        <div className="flex items-start justify-between gap-x-4">
          <Heading
            level="h2"
            className="text-2xl font-bold leading-8 text-gray-900 flex-1"
            data-testid="product-title"
          >
            {product.title}
          </Heading>
          <div className="flex items-center gap-x-1">
            <ShareButton title={product.title} />
            {product.id && <FavoriteButton product={product} />}
          </div>
        </div>

        {/* Star Ratings & Review Count — CANLI (client) çekilir, alt "Müşteri
            Değerlendirmeleri" bölümüyle tutarlı; ISR cache'i bayatlamaz. */}
        {product.handle && <ProductRating productHandle={product.handle} />}

        {/* Kısa Özet — ana içerikten (aşağıdaki foto+yazı bölümü) görsel olarak
            farklılaştırılmış özet kutusu. Yalnız özet girilmişse gösterilir. */}
        {product.description && (
          <div
            className="mt-2 rounded-lg border-l-4 border-brand-500 bg-brand-50/60 px-4 py-3"
            data-testid="product-description"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1">
              Ürün Özeti
            </span>
            <Text className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
