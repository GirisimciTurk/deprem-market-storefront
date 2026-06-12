import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { StoreSellerResponse } from "@lib/data/sellers"

export default function SellerTemplate({
  sortBy,
  seller,
  productIds,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  seller: StoreSellerResponse["seller"]
  productIds: string[]
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const hasProducts = productIds.length > 0

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 flex items-center gap-x-4">
          {seller.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={seller.logo}
              alt={seller.name}
              className="h-16 w-16 rounded-full object-cover border border-gray-200"
            />
          )}
          <div>
            <h1 className="text-2xl-semi">{seller.name}</h1>
            {seller.description && (
              <p className="mt-1 text-sm text-gray-500">{seller.description}</p>
            )}
          </div>
        </div>
        {hasProducts ? (
          <Suspense
            fallback={
              <SkeletonProductGrid numberOfProducts={productIds.length} />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              productsIds={productIds}
              countryCode={countryCode}
            />
          </Suspense>
        ) : (
          <div className="py-16 text-center text-gray-500">
            Bu satıcının yayında ürünü yok.
          </div>
        )}
      </div>
    </div>
  )
}
