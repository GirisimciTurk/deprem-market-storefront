import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import CookieConsent from "@modules/layout/components/cookie-consent"
import PushPrompt from "@modules/layout/components/push-prompt"
import InstallPrompt from "@modules/layout/components/install-prompt"
import ContactDock from "@modules/layout/components/contact-dock"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  // Bağımsız iki çağrı paralel — bu layout HER (main) sayfasını sarar, sıralı
  // bekleme her sayfaya ~300-500ms ekliyordu.
  const [customer, cart, region] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
    getRegion(countryCode),
  ])
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <>
      <Nav countryCode={countryCode} />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
      <CookieConsent countryCode={countryCode} />
      <PushPrompt />
      <InstallPrompt />
      <ContactDock countryCode={countryCode} region={region ?? null} />
    </>
  )
}
