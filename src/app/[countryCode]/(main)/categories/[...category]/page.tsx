import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getCategoryByHandle } from "@lib/data/categories"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { seoAlternates } from "@lib/util/seo"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    showcase?: string
  }>
}

// Her istekte çizilir (çerez + searchParams); generateStaticParams'ın boş dönmesi
// rotayı statik sanıp 500'e düşürüyordu — bkz. products/[handle]/page.tsx.
export const dynamic = "force-dynamic"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const t = await getTranslations("metadata")

    const title = t("categoryTitle", { name: productCategory.name })

    const description =
      productCategory.description ??
      t("categoryFallbackDescription", { title: productCategory.name })

    return {
      title: title,
      description,
      // Canonical birincil bölgeye sabit (bkz. @lib/util/seo): bölgesel önekler
      // aynı Türkçe içeriği sunduğu için ayrı ayrı indekslenmemeli.
      alternates: seoAlternates(`/categories/${params.category.join("/")}`),
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, minPrice, maxPrice, inStock, showcase } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      minPrice={minPrice}
      maxPrice={maxPrice}
      inStock={inStock}
      showcase={showcase}
      countryCode={params.countryCode}
    />
  )
}
