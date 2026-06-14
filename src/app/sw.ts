import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

// serwist, build sırasında precache edilecek dosya listesini bu global'e enjekte eder.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  // Build çıktısındaki statik varlıklar (JS/CSS/font) yüklendikçe önbelleğe alınır.
  precacheEntries: self.__SW_MANIFEST,
  // Yeni SW yayınlandığında beklemeden devral → güncellemeler hızlı yansır.
  skipWaiting: true,
  clientsClaim: true,
  // Navigasyonda tarayıcının preload'unu kullan (daha hızlı ilk yanıt).
  navigationPreload: true,
  // @serwist/next'in Next.js'e göre ayarlı varsayılan runtime cache stratejileri:
  // sayfalar (NetworkFirst), statik chunk'lar (CacheFirst), görseller, API vb.
  // → daha önce ziyaret edilmiş sayfalar internet kesikken (afet anında) açılır.
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// ── Web Push ───────────────────────────────────────────────────────────────
// Backend (web-push) JSON payload gönderir: { title, body, url?, icon?, image?,
// tag? }. Sunucu bir bildirim ittiğinde burada yakalanıp gösterilir.
type PushPayload = {
  title?: string
  body?: string
  url?: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
}

self.addEventListener("push", (event: PushEvent) => {
  let payload: PushPayload = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = { title: "Deprem Market", body: event.data?.text() }
  }

  const title = payload.title || "Deprem Market"
  // `image` standart NotificationOptions tipinde yok ama tarayıcılar destekler
  // (büyük görsel önizleme) → tipi genişletiyoruz.
  const options: NotificationOptions & { image?: string } = {
    body: payload.body || "",
    icon: payload.icon || "/icon",
    badge: payload.badge || "/icon",
    image: payload.image,
    tag: payload.tag,
    data: { url: payload.url || "/" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()
  const targetUrl = (event.notification.data as { url?: string })?.url || "/"

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      // Açık bir sekme varsa onu hedefe yönlendirip öne getir; yoksa yeni aç.
      for (const client of allClients) {
        if ("focus" in client) {
          try {
            await client.navigate(targetUrl)
          } catch {
            /* navigate engellenirse sadece focus */
          }
          return client.focus()
        }
      }
      return self.clients.openWindow(targetUrl)
    })()
  )
})
