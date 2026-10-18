"use server"

import { GobitError, gobitFetch } from "@lib/gobit/client"

// dtm'nin bülten listesi (/store/v1/dtm/newsletter). Yanıt adresin yeni, zaten
// kayıtlı ya da yeniden abone olmasından bağımsız aynıdır (kim listede, sızmaz).
export async function subscribeNewsletter(
  email: string,
  source = "footer"
): Promise<{ success: boolean; error: string | null }> {
  const address = (email || "").trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return { success: false, error: "Geçerli bir e-posta adresi girin." }
  try {
    await gobitFetch("/store/v1/dtm/newsletter", {
      method: "POST",
      body: { email: address, source: (source || "footer").slice(0, 40) },
    })
    return { success: true, error: null }
  } catch (e) {
    if (e instanceof GobitError && e.status === 422) return { success: false, error: "Geçerli bir e-posta adresi girin." }
    if (e instanceof GobitError && e.status === 429)
      return { success: false, error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." }
    return { success: false, error: "Abonelik şu an kaydedilemedi. Lütfen daha sonra tekrar deneyin." }
  }
}

/**
 * Bültenden ayrılma: kampanya e-postasındaki bağlantının jetonuyla
 * (/{ülke}/bulten/ayril?token=…). Tekrar çağrılması hata değildir.
 */
export async function unsubscribeNewsletter(token: string): Promise<{ success: boolean; error: string | null }> {
  const t = (token || "").trim()
  if (!t) return { success: false, error: "Abonelikten çıkma bağlantısı eksik." }
  try {
    await gobitFetch("/store/v1/dtm/newsletter/unsubscribe", { method: "POST", body: { token: t } })
    return { success: true, error: null }
  } catch (e) {
    if (e instanceof GobitError && (e.status === 404 || e.status === 422))
      return { success: false, error: "Bu abonelikten çıkma bağlantısı geçersiz." }
    return { success: false, error: "İşlem şu an yapılamadı. Lütfen daha sonra tekrar deneyin." }
  }
}

/**
 * Pazarlama e-postalarından ayrılma (/{ülke}/abonelik-iptal?token=…): gobit'in
 * kampanya ve sepet hatırlatma e-postalarındaki imzalı jetonla. Adres bülten
 * listesinden çıkar ve hesabın e-posta izni (metadata.comm_email) kapanır.
 * Tekrar çağrılması hata değildir.
 */
export async function unsubscribeMarketing(token: string): Promise<{ success: boolean; error: string | null }> {
  const t = (token || "").trim()
  if (!t) return { success: false, error: "Abonelikten çıkma bağlantısı eksik." }
  try {
    await gobitFetch("/store/v1/dtm/marketing/unsubscribe", { method: "POST", body: { token: t } })
    return { success: true, error: null }
  } catch (e) {
    if (e instanceof GobitError && (e.status === 404 || e.status === 422))
      return { success: false, error: "Bu abonelikten çıkma bağlantısı geçersiz." }
    if (e instanceof GobitError && e.status === 429)
      return { success: false, error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." }
    return { success: false, error: "İşlem şu an yapılamadı. Lütfen daha sonra tekrar deneyin." }
  }
}
