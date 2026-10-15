"use server"

import { HttpTypes } from "@medusajs/types"
import { gobitData } from "@lib/gobit/client"
import { medusaProviderId } from "@lib/gobit/cart"

// Mağazanın ödeme yöntemleri. depremtek vitrini kartla PayTR'yi gösterir;
// hediye kartı, puan ve cüzdan sağlayıcıları ödeme adımında seçilmez.
const SHOWN = new Set(["paytr"])

export const listCartPaymentMethods = async (regionId: string) => {
  return gobitData<string[]>(`/store/v1/payment-providers`, { query: { region_id: regionId }, cache: "no-store" })
    .then(
      (ids) =>
        ids
          .filter((id) => SHOWN.has(id))
          .map((id) => ({ id: medusaProviderId(id), is_enabled: true })) as HttpTypes.StorePaymentProvider[]
    )
    .catch(() => null)
}
