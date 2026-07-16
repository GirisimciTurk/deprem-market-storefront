"use server"

import { sdk } from "@lib/config"

/** Anonim bülten aboneliği. Idempotent; başarıda success:true. */
export async function subscribeNewsletter(
  email: string,
  source = "footer"
): Promise<{ success: boolean; error: string | null }> {
  try {
    await sdk.client.fetch(`/store/newsletter`, {
      method: "POST",
      body: { email, source },
    })
    return { success: true, error: null }
  } catch (e: any) {
    // Backend nötr 400/500 mesajı döndürür; kullanıcıya kısa bir uyarı yeter.
    return { success: false, error: "Kayıt yapılamadı. Lütfen e-postanızı kontrol edip tekrar deneyin." }
  }
}
