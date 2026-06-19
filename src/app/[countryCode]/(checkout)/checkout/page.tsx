import { refreshCartPrices, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import TrackCheckoutStart from "@modules/checkout/components/track-checkout"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("checkoutTitle"),
    description: t("checkoutDescription"),
  }
}

export default async function Checkout() {
  // Ödeme adımından önce fiyatları güncelle → müşteri daima güncel fiyatı öder.
  await refreshCartPrices()
  const cart = await retrieveCart(undefined, undefined, { fresh: true })

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <TrackCheckoutStart
        value={cart.total != null ? Math.round(Number(cart.total) * 100) : null}
        currency={cart.currency_code}
      />
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
