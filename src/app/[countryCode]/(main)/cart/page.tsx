import { refreshCartPrices, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
  }
}

export default async function Cart() {
  // Sepet açılırken kalem fiyatlarını güncel fiyat/kampanyalara göre tazele,
  // sonra taze (cache'siz) oku.
  await refreshCartPrices()
  const cart = await retrieveCart(undefined, undefined, { fresh: true }).catch(
    (error) => {
      console.error(error)
      return notFound()
    }
  )

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
