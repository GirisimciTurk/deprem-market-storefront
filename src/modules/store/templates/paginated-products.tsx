import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import InfiniteProducts from "./infinite-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  minPrice,
  maxPrice,
  inStock,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    minPrice,
    maxPrice,
    inStock,
  })

  return (
    <InfiniteProducts
      initialProducts={products}
      region={region}
      sortBy={sortBy}
      collectionId={collectionId}
      categoryId={categoryId}
      productsIds={productsIds}
      countryCode={countryCode}
      minPrice={minPrice}
      maxPrice={maxPrice}
      inStock={inStock}
      initialCount={count}
    />
  )
}

