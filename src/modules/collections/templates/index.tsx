import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { isShowcaseKey } from "@lib/showcase"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  minPrice,
  maxPrice,
  inStock,
  showcase,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  showcase?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  // Geçersiz vitrin key'i yok say (StoreTemplate ile aynı davranış).
  const activeShowcase = isShowcaseKey(showcase) ? showcase : undefined

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList
        sortBy={sort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        inStock={inStock}
        showcase={activeShowcase}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          // Filtre değişince sınır yeniden mount olsun → iskelet gerçekten görünür.
          key={[sort, pageNumber, minPrice, maxPrice, inStock, activeShowcase]
            .map((v) => v ?? "")
            .join("|")}
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            showcase={activeShowcase}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
