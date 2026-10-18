"use server"

import { StoreCartShippingOption } from "types/store"
import { gobitData } from "@lib/gobit/client"
import { toShippingOption } from "@lib/gobit/cart"
import { getAuthHeaders } from "./cookies"

// Sepetin kargo seçenekleri: gobit /store/v1/carts/{id}/shipping-options.
export const listCartShippingMethods = async (cartId: string) => {
  return gobitData<{ id: string; name: string; amount: number; currency_code: string }[]>(
    `/store/v1/carts/${cartId}/shipping-options`,
    { headers: await getAuthHeaders(), cache: "no-store" }
  )
    .then((options) => options.map(toShippingOption))
    .catch(() => null)
}

/** gobit kargo tutarı seçenekte sabit (flat); ayrıca hesaplanacak fiyat yok. */
export const calculatePriceForShippingOption = async (
  _optionId: string,
  _cartId: string,
  _data?: Record<string, unknown>
) => null as StoreCartShippingOption | null
