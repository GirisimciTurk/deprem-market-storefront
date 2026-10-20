import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getCollectionByHandle } from "@lib/data/collections"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
    minPrice?: string
    maxPrice?: string
    inStock?: string
    showcase?: string
  }>
}

export const PRODUCT_LIMIT = 12

// Her istekte çizilir (çerez + searchParams); generateStaticParams'ın boş dönmesi
// rotayı statik sanıp 500'e düşürüyordu — bkz. products/[handle]/page.tsx.
export const dynamic = "force-dynamic"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const t = await getTranslations("metadata")

  const metadata = {
    title: t("collectionTitle", { title: collection.title }),
    description: t("collectionDescription", { title: collection.title }),
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, minPrice, maxPrice, inStock, showcase } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      minPrice={minPrice}
      maxPrice={maxPrice}
      inStock={inStock}
      showcase={showcase}
      countryCode={params.countryCode}
    />
  )
}
