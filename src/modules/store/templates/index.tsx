import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"
import { isShowcaseKey, showcaseLabel } from "@lib/showcase"

const StoreTemplate = async ({
  sortBy,
  page,
  minPrice,
  maxPrice,
  categoryId,
  inStock,
  showcase,
  countryCode,
  showSeoContent = true,
}: {
  sortBy?: SortOptions
  page?: string
  minPrice?: string
  maxPrice?: string
  categoryId?: string
  inStock?: string
  showcase?: string
  countryCode: string
  showSeoContent?: boolean
}) => {
  const parsedPage = page ? parseInt(page, 10) : 1
  const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const sort = sortBy || "created_at"
  // Geçersiz showcase key'i yok say (filtre uygulanmaz).
  const activeShowcase = isShowcaseKey(showcase) ? showcase : undefined
  const categories = await listCategories().catch(() => [])

  // /kategoriler sayfasından ?categoryId=<id> ile gelindiğinde başlıkta seçili
  // kategori ad(lar)ını göster (jenerik "Tüm ürünler" yerine bağlam ver).
  const selectedCategoryNames = (categoryId ? categoryId.split(",").filter(Boolean) : [])
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[]

  return (
    <>
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
          showcase={activeShowcase}
          categories={categories}
        />
        <div className="w-full">
          {activeShowcase && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                {showcaseLabel(activeShowcase)}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Bu vitrin kategorisindeki tüm ürünler.
              </p>
            </div>
          )}
          {!activeShowcase && selectedCategoryNames.length > 0 && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                {selectedCategoryNames.join(", ")}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {selectedCategoryNames.length > 1
                  ? "Seçili kategorilerdeki ürünler."
                  : "Bu kategorideki tüm ürünler."}
              </p>
            </div>
          )}
          {showSeoContent && !activeShowcase && selectedCategoryNames.length === 0 && (
            <div className="mb-6">
              <h1
                data-testid="store-page-title"
                className="text-2xl font-bold text-slate-800"
              >
                Tüm Deprem ve Afet Hazırlık Ürünleri
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
                Deprem çantalarından ilk yardım setlerine, aydınlatmadan ısınma ve
                acil durum gıdasına kadar afet hazırlığı için ihtiyacınız olan tüm
                ürünler tek sayfada.
              </p>
            </div>
          )}
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              minPrice={minPrice}
              maxPrice={maxPrice}
              categoryId={categoryId}
              inStock={inStock}
              showcase={activeShowcase}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default StoreTemplate
