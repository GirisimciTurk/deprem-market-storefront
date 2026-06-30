import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"

import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import HizmetAlClient from "./hizmet-al-client"

export const metadata: Metadata = {
  title: "Hizmet Al",
  description:
    "Uzman mühendislik veya bayi montaj hizmeti alın; hizmete uygun ürünü seçip talep başlatın.",
}

export default async function HizmetAlPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const customer = await retrieveCustomer().catch(() => null)

  // Hizmet verilebilir ürünler (metadata.is_serviceable=true). Store API metadata'ya
  // göre süzemiyor → ürünleri çekip burada filtreliyoruz. Henüz işaretli ürün yoksa
  // liste boş döner; client boş-durum gösterir.
  let serviceable: HttpTypes.StoreProduct[] = []
  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: { limit: 100 },
    })
    serviceable = response.products.filter(
      (p) => (p.metadata as Record<string, unknown> | null)?.is_serviceable === true
    )
  } catch {
    serviceable = []
  }

  const defaultName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <HizmetAlClient
      products={serviceable}
      defaultName={defaultName}
      defaultEmail={customer?.email ?? ""}
      defaultPhone={customer?.phone ?? ""}
    />
  )
}
