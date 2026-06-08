"use client"

import React, { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "../thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { ChevronLeft, ChevronRight } from "lucide-react"

type RecentlyViewedProps = {
  allProducts: HttpTypes.StoreProduct[]
  currentHandle: string
  region: HttpTypes.StoreRegion
}

export default function RecentlyViewed({
  allProducts,
  currentHandle,
  region: _region,
}: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<HttpTypes.StoreProduct[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const storageKey = "recently-viewed-products"
      const stored = localStorage.getItem(storageKey)
      let handles: string[] = stored ? JSON.parse(stored) : []

      // Filter out current handle if it's already in the list to avoid duplicate placements
      handles = handles.filter((h) => h !== currentHandle)

      // Add current handle to the front of the queue
      handles.unshift(currentHandle)

      // Limit queue to store at most 10 recently viewed products to make the slider meaningful
      const limitedHandles = handles.slice(0, 10)
      localStorage.setItem(storageKey, JSON.stringify(limitedHandles))

      // Find product details for other recently viewed products in allProducts
      const otherHandles = limitedHandles.filter((h) => h !== currentHandle)
      const matched = otherHandles
        .map((h) => allProducts.find((p) => p.handle === h))
        .filter((p): p is HttpTypes.StoreProduct => !!p)

      setViewedProducts(matched)
    } catch (e) {
      console.error("Failed to load recently viewed products", e)
    }
  }, [allProducts, currentHandle])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollAmount = clientWidth * 0.75
      const targetScroll =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      })
    }
  }

  if (viewedProducts.length === 0) {
    return null
  }

  return (
    <div className="product-page-constraint border-t border-gray-100 pt-12 mt-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100 mb-3">
          Alışkanlıklarınıza Özel
        </span>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Son Gezdikleriniz
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-md">
          Mağazamızda daha önce incelediğiniz acil hazırlık ve deprem koruma ürünleri.
        </p>
      </div>

      <div className="relative group max-w-5xl mx-auto px-8">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:shadow transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Geri"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scroll-smooth gap-x-4 pb-4 px-2 no-scrollbar snap-x snap-mandatory"
        >
          {viewedProducts.map((product) => {
            const { cheapestPrice } = getProductPrice({ product })
            const hasFreeShipping =
              (product.metadata as Record<string, unknown>)?.free_shipping === true

            return (
              <div
                key={product.id}
                className="w-[140px] sm:w-[160px] flex-shrink-0 snap-start"
              >
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="group block"
                >
                  <div
                    data-testid="product-wrapper"
                    className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 p-2 h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square w-full rounded-md overflow-hidden bg-slate-50">
                        <Thumbnail
                          thumbnail={product.thumbnail}
                          images={product.images}
                          size="square"
                        />
                        {hasFreeShipping && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gray-100/90 text-center py-0.5 backdrop-blur-xs">
                            <span className="text-[9px] font-bold text-emerald-700 tracking-wide">
                              Kargo Bedava
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-700 font-medium line-clamp-2 mt-2 leading-tight min-h-[2rem] group-hover:text-orange-600 transition-colors">
                        {product.title}
                      </span>
                    </div>
                    <div className="mt-1">
                      {cheapestPrice && (
                        <div className="flex items-center gap-x-1 flex-wrap">
                          {cheapestPrice.price_type === "sale" && (
                            <span className="line-through text-gray-400 text-[10px]">
                              {cheapestPrice.original_price}
                            </span>
                          )}
                          <span
                            className={clx("text-xs font-bold", {
                              "text-red-600": cheapestPrice.price_type === "sale",
                              "text-orange-600": cheapestPrice.price_type !== "sale",
                            })}
                          >
                            {cheapestPrice.calculated_price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </LocalizedClientLink>
              </div>
            )
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:shadow transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="İleri"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
