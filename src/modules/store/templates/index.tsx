import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  minPrice,
  maxPrice,
  categoryId,
  inStock,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  minPrice?: string
  maxPrice?: string
  categoryId?: string
  inStock?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const categories = await listCategories().catch(() => [])

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container gap-x-8"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        categoryId={categoryId}
        minPrice={minPrice}
        maxPrice={maxPrice}
        inStock={inStock}
        categories={categories}
      />
      <div className="w-full">
        <div className="mb-6">
          <h1 data-testid="store-page-title" className="text-2xl font-bold text-slate-800">
            Tüm Ürünler
          </h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categoryId={categoryId}
            inStock={inStock}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
