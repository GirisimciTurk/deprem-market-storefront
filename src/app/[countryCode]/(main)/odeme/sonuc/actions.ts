"use server"

import { removeCartId } from "@lib/data/cookies"

/** Ödeme başarıyla tamamlandığında (sipariş callback'te oluştu) sepet çerezini temizler. */
export async function clearCartCookie() {
  try {
    await removeCartId()
  } catch {
    /* best-effort */
  }
}
