import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import AccountFavorites from "@modules/favorites/components/account-favorites"

export const metadata: Metadata = {
  title: "Favori Ürünlerim",
  description: "Beğenip kaydettiğiniz ürünler.",
}

/**
 * Hesap panelindeki favoriler. Favoriler müşteri hesabına bağlı olduğundan bu
 * sayfa giriş gerektirir (account layout zaten koruyor; burada region + customer
 * doğrulanıp liste client bileşene devrediliyor — güncel fiyat için region şart).
 */
export default async function AccountFavoritesPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const [customer, region] = await Promise.all([
    retrieveCustomer(),
    getRegion(params.countryCode),
  ])

  if (!customer || !region) {
    notFound()
  }

  return <AccountFavorites region={region} />
}
