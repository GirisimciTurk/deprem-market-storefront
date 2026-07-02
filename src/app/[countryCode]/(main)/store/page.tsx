import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("storeTitle"),
    description: t("storeDescription"),
  }
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    categoryId?: string
    inStock?: string
    showcase?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, minPrice, maxPrice, categoryId, inStock, showcase } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      minPrice={minPrice}
      maxPrice={maxPrice}
      categoryId={categoryId}
      inStock={inStock}
      showcase={showcase}
      countryCode={params.countryCode}
    />
  )
}
