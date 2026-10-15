"use server"

import { gobitFetch } from "@lib/gobit/client"

// gobit'te bülten listesi yok: abonelik isteği dtm'nin iletişim kutusuna
// "Bülten aboneliği" konusuyla düşer, operatör listeye ekler.
export async function subscribeNewsletter(
  email: string,
  source = "footer"
): Promise<{ success: boolean; error: string | null }> {
  const address = (email || "").trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return { success: false, error: "Geçerli bir e-posta adresi girin." }
  try {
    await gobitFetch("/store/v1/dtm/contact", {
      method: "POST",
      body: { name: "Bülten", email: address, subject: "Bülten aboneliği", message: `${address} bültene abone olmak istiyor (kaynak: ${source}).` },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
