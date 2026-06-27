import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import VisionPillars from "@modules/layout/components/vision-pillars"
import FeaturedSellers from "@modules/sellers/components/featured-sellers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  }
}

type Params = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    categoryId?: string
    inStock?: string
  }>
}

export default async function Home(props: Params) {
  const { countryCode } = await props.params
  const { sortBy, page, minPrice, maxPrice, categoryId, inStock } =
    await props.searchParams

  // Ana sayfa: üstte PDF vizyon şeridi (Bilgilen·Hazırlan·Koru) + doğrudan mağaza
  // (sol filtreler + ürün gridi).
  return (
    <>
      <VisionPillars />
      <FeaturedSellers />
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        minPrice={minPrice}
        maxPrice={maxPrice}
        categoryId={categoryId}
        inStock={inStock}
        countryCode={countryCode}
        showSeoContent={false}
      />
    </>
  )
}
