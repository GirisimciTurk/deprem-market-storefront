import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSellerByHandle } from "@lib/data/sellers"
import SellerTemplate from "@modules/sellers/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const data = await getSellerByHandle(params.handle)

  if (!data) {
    notFound()
  }

  const metadata = {
    title: `${data.seller.name} | EKYP Deprem Market`,
    description: `${data.seller.name} satıcısının ürünleri`,
  } as Metadata

  return metadata
}

export default async function SellerPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const data = await getSellerByHandle(params.handle)

  if (!data) {
    notFound()
  }

  return (
    <SellerTemplate
      seller={data.seller}
      productIds={data.product_ids}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}
