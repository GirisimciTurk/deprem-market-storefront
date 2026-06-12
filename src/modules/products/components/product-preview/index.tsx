import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import React from "react"
import FavoriteButton from "@modules/products/components/favorite-button"
import AddToCartButton from "./add-to-cart-button"

const rankMap: Record<string, { rank: number; category: string }> = {
  "profesyonel-deprem-cantasi": { rank: 1, category: "Deprem Çantası" },
  "bireysel-deprem-cantasi": { rank: 2, category: "Deprem Çantası" },
  "tasinabilir-su-filtresi": { rank: 1, category: "Su Filtresi" },
  "termal-acil-durum-battaniyesi-5li-paket": { rank: 3, category: "İlk Yardım" },
  "sarj-edilebilir-fener": { rank: 2, category: "Aydınlatma" },
  "mini-deprem-cantasi": { rank: 4, category: "Deprem Çantası" },
}

const ratingMap: Record<string, { rating: number; count: number }> = {
  "profesyonel-deprem-cantasi": { rating: 4.7, count: 132 },
  "bireysel-deprem-cantasi": { rating: 4.8, count: 85 },
  "mini-deprem-cantasi": { rating: 4.9, count: 42 },
  "sarj-edilebilir-fener": { rating: 4.8, count: 28 },
  "ilk-yardim-kiti": { rating: 4.9, count: 94 },
  "tasinabilir-su-filtresi": { rating: 4.7, count: 56 },
}

const renderStars = (rating: number) => {
  const roundedRating = Math.round(rating)
  return (
    <div className="flex items-center text-yellow-400 gap-x-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${
            i < roundedRating ? "fill-current text-yellow-400" : "text-gray-300"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const hasRealSale =
    cheapestPrice?.price_type === "sale" ||
    (cheapestPrice?.original_price_number &&
      cheapestPrice?.calculated_price_number &&
      cheapestPrice.original_price_number > cheapestPrice.calculated_price_number)

  const discountPercentage = hasRealSale && cheapestPrice?.percentage_diff && parseInt(cheapestPrice.percentage_diff) > 0
    ? cheapestPrice.percentage_diff
    : "14"

  const hasFreeShipping = (product.metadata as Record<string, unknown>)?.free_shipping === true

  const rankInfo = (product.metadata as any)?.rank
    ? {
        rank: (product.metadata as any).rank,
        category: (product.metadata as any).rank_category || "Kategori",
      }
    : rankMap[product.handle]

  const ratingInfo = (product.metadata as any)?.rating
    ? {
        rating: (product.metadata as any).rating,
        count: (product.metadata as any).review_count || 12,
      }
    : ratingMap[product.handle] || { rating: 4.8, count: 15 }

  const totalInventory =
    product.variants?.reduce((acc, v) => acc + (v.inventory_quantity || 0), 0) ?? 0
  const manageInventory = product.variants?.some((v) => v.manage_inventory) ?? false
  const isLowStock =
    (manageInventory && totalInventory > 0 && totalInventory <= 10) ||
    product.handle === "sarj-edilebilir-fener" ||
    product.handle === "tasinabilir-su-filtresi"
  const displayStock =
    manageInventory && totalInventory > 0 && totalInventory <= 10 ? totalInventory : 4

  return (
    <div
      data-testid="product-wrapper"
      className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
    >
      <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
        {/* Image wrapper */}
        <div className="relative overflow-hidden aspect-[9/12] w-full">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="h-full w-full object-cover"
          />

          {/* Top-Left: Rank Badge */}
          {rankInfo && (
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[9px] sm:text-[10px] px-2 py-1 rounded-md shadow-md flex items-center gap-x-1">
              <span>🏆</span>
              <span className="truncate max-w-[80px] sm:max-w-none">
                {rankInfo.category} #{rankInfo.rank}
              </span>
            </div>
          )}

          {/* Top-Left: Discount Badge */}
          {cheapestPrice && (
            <div
              className={`absolute z-10 bg-red-600 text-white font-extrabold text-[10px] sm:text-xs px-2 py-1 rounded-md shadow-md border border-red-500 tracking-tight left-2 ${
                rankInfo ? "top-10 sm:top-11" : "top-2"
              }`}
            >
              %{discountPercentage} İndirim
            </div>
          )}

          {/* Top-Right: Low Stock / Urgency Badge */}
          {isLowStock && (
            <div className="absolute top-12 right-2 z-10 bg-red-600/90 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-1 rounded-full shadow-md animate-pulse border border-red-500/50">
              <span>Son {displayStock} Ürün!</span>
            </div>
          )}

          {/* Free Shipping overlay on bottom of image */}
          {hasFreeShipping && (
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-center py-1 z-10 backdrop-blur-xs">
              <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-wider uppercase">
                Kargo Bedava
              </span>
            </div>
          )}
        </div>

        {/* Red banner for sale products */}
        {cheapestPrice?.price_type === "sale" && (
          <div className="bg-red-600 text-white text-center py-1 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase">
            Son 10 Günün En Düşük Fiyatı!
          </div>
        )}
      </LocalizedClientLink>

      {/* Top-Right: Favorite Button (Keep outside the Link context for separate interaction) */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton product={product} cheapestPrice={cheapestPrice} />
      </div>

      {/* Product info box */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-y-2">
        <LocalizedClientLink href={`/products/${product.handle}`} className="flex flex-col gap-y-1">
          {/* Brand Title */}
          <div className="flex items-center gap-x-1 flex-wrap">
            <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
              {(product as any).seller?.name ?? "Deprem Market"}
            </span>
            <svg
              className="w-3.5 h-3.5 text-blue-500 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          {/* Product Title */}
          <Text
            className="text-xs text-gray-700 line-clamp-2 leading-tight font-medium"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          {/* Rating Stars & Count */}
          <div className="flex items-center gap-x-1 mt-0.5">
            <span className="text-xs font-bold text-gray-750">{ratingInfo.rating}</span>
            {renderStars(ratingInfo.rating)}
            <span className="text-[9px] font-semibold text-gray-600">
              ({ratingInfo.count})
            </span>
          </div>

          {/* Delivery Badge */}
          <div className="flex items-center gap-x-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 mt-0.5">
            <svg
              className="w-3 h-3 text-emerald-500 fill-none stroke-current"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.208-3.02a2.25 2.25 0 00-1.022-1.656l-3.5-2.282a2.25 2.25 0 00-1.402-.491H12v-2.25A2.25 2.25 0 009.75 3.5h-3a2.25 2.25 0 00-2.25 2.25v11.25m18 0V12m-9-6.75h1.5m-1.5 3h1.5m-1.5 3h3.75"
              />
            </svg>
            <span>Hızlı Teslimat</span>
          </div>
        </LocalizedClientLink>

        {/* Price & Add to Cart Area */}
        <div className="pt-2 border-t border-slate-100 mt-auto flex flex-col gap-y-2">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          <AddToCartButton variantId={product.variants?.[0]?.id} />
        </div>
      </div>
    </div>
  )
}
