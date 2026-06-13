import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { StoreSellerResponse } from "@lib/data/sellers"
import SellerReviews from "@modules/sellers/components/seller-reviews"
import SellerContact from "@modules/sellers/components/seller-contact"

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
  const ratingCount = seller.rating_count ?? 0
  const ratingAvg = seller.rating_avg ?? 0
  const hasRating = ratingCount > 0

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
            {hasRating && (
              <div className="mt-1 flex items-center gap-x-1.5">
                <div className="flex items-center text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(ratingAvg)
                          ? "fill-current"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {ratingAvg.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({ratingCount} değerlendirme)
                </span>
              </div>
            )}
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
        <SellerContact sellerHandle={seller.handle} />
        <SellerReviews sellerHandle={seller.handle} />
      </div>
    </div>
  )
}
