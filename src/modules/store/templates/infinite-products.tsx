"use client"

import React, { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { listProductsWithSort } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type InfiniteProductsProps = {
  initialProducts: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  sortBy?: SortOptions
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  initialCount: number
}

export default function InfiniteProducts({
  initialProducts,
  region,
  sortBy,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  minPrice,
  maxPrice,
  inStock,
  initialCount,
}: InfiniteProductsProps) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Reset local state when initialProducts or count changes (e.g. when filters/sorting changes)
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setHasMore(initialProducts.length < initialCount)
    setIsLoading(false)
  }, [initialProducts, initialCount])

  const loadMoreProducts = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const nextPageNum = page + 1
      const queryParams: any = { limit: 12 }
      if (collectionId) queryParams["collection_id"] = [collectionId]
      if (categoryId) queryParams["category_id"] = [categoryId]
      if (productsIds) queryParams["id"] = productsIds
      if (sortBy === "created_at") queryParams["order"] = "created_at"

      const {
        response: { products: newProducts },
      } = await listProductsWithSort({
        page: nextPageNum,
        queryParams,
        sortBy,
        countryCode,
        minPrice,
        maxPrice,
        inStock,
      })

      if (newProducts.length > 0) {
        setProducts((prev) => {
          // Filter out duplicates just in case
          const prevIds = new Set(prev.map((p) => p.id))
          const filteredNew = newProducts.filter((p) => !prevIds.has(p.id))
          return [...prev, ...filteredNew]
        })
        setPage(nextPageNum)
        if (products.length + newProducts.length >= initialCount || newProducts.length < 12) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const currentLoader = loaderRef.current
    if (!currentLoader || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoading) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(currentLoader)

    return () => {
      observer.unobserve(currentLoader)
    }
  }, [hasMore, isLoading, page, sortBy, collectionId, categoryId, productsIds, minPrice, maxPrice, inStock, products.length])

  return (
    <div className="flex flex-col gap-y-6">
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>

      {/* Loading indicator triggered by scroll */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center items-center py-12 w-full"
        >
          <div className="flex items-center gap-x-2 text-slate-500 text-sm bg-slate-50 border border-slate-100/50 rounded-full px-4 py-2 shadow-xs">
            <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            Ürünler Yükleniyor...
          </div>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-12 text-slate-400 text-sm border-t border-slate-100 mt-6">
          Tüm ürünler listelendi.
        </div>
      )}
    </div>
  )
}
