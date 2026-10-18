"use server"

import { GobitError, gobitFetch } from "@lib/gobit/client"

export type HavarRequestInput = {
  type: "purchase" | "rental"
  full_name: string
  email: string
  phone: string
  city: string
  buyer_type: "individual" | "family"
  usage: "cargo" | "human" | "both"
  quantity: number
  want_door_mechanism: boolean
  rental_duration: string
  note: string
}

/** HavarTek ön alım / ön kiralama talebi (dtm): giriş gerekmez. */
export async function sendHavarRequest(input: HavarRequestInput): Promise<{ success: boolean; error: string | null }> {
  try {
    await gobitFetch("/store/v1/dtm/havar-requests", { method: "POST", body: input })
    return { success: true, error: null }
  } catch (e) {
    if (e instanceof GobitError && e.status === 429) {
      return { success: false, error: "Bu e-posta adresiyle son 24 saatte çok fazla talep bırakıldı; lütfen yarın tekrar deneyin." }
    }
    if (e instanceof GobitError && e.status === 422) {
      return { success: false, error: "Lütfen bilgileri kontrol edin (ör. e-posta adresi)." }
    }
    return { success: false, error: "Talep gönderilemedi. Lütfen tekrar deneyin." }
  }
}
