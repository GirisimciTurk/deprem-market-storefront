import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import FavoriteButton from "@modules/products/components/favorite-button"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const getProductReviewData = (handle: string) => {
  switch (handle) {
    case "profesyonel-deprem-cantasi":
      return { rating: 5, count: 124 }
    case "mini-deprem-cantasi":
      return { rating: 5, count: 85 }
    case "sarj-edilebilir-fener":
      return { rating: 4, count: 48 }
    case "ilk-yardim-kiti":
      return { rating: 5, count: 62 }
    default:
      return { rating: 5, count: 60 }
  }
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const reviewData = getProductReviewData(product.handle)
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
              EKYP Deprem Market
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
          {product.id && <FavoriteButton product={product} />}
        </div>

        {/* Star Ratings & Review Count */}
        <div className="flex items-center gap-x-2">
          <div className="flex items-center text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < reviewData.rating ? "fill-current" : "text-gray-300"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {reviewData.count} değerlendirme
          </span>
        </div>

        {/* Description */}
        <Text
          className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
