import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Mağaza",
  description: "Tüm deprem hazırlık ve acil durum ürünlerimizi keşfedin.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    categoryId?: string
    inStock?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, minPrice, maxPrice, categoryId, inStock } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      minPrice={minPrice}
      maxPrice={maxPrice}
      categoryId={categoryId}
      inStock={inStock}
      countryCode={params.countryCode}
    />
  )
}
