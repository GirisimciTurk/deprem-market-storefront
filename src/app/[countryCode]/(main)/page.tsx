import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
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
  const t = await getTranslations("metadata")

  // Ana sayfa: ürünler EN ÜSTTE başlasın (sol filtreler + ürün gridi). İkincil
  // içerik (öne çıkan satıcılar + PDF vizyon şeridi) gridin altına alındı; geri
  // kalan gezinme sağdaki menü şeridinde (CategoryDrawer). Büyük "mağaza" başlığı
  // yalnız /store'da; ana sayfada SEO/erişilebilirlik için görsel-gizli H1.
  return (
    <>
      <h1 className="sr-only">{t("homeTitle")}</h1>
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
      <FeaturedSellers />
    </>
  )
}
