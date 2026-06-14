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
  // Hiç ziyaret edilmemiş bir sayfaya çevrimdışıyken gidilirse tarayıcının çirkin
  // hata ekranı yerine markalı /offline sayfasını göster. /offline, next.config.js'te
  // additionalPrecacheEntries ile precache edilir (bu yüzden fallback'te kullanılabilir).
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document"
        },
      },
    ],
  },
})

serwist.addEventListeners()

// ── Web Push ───────────────────────────────────────────────────────────────
// Backend (web-push) JSON payload gönderir: { title, body, url?, icon?, image?,
// tag?, actions? }. Sunucu bir bildirim ittiğinde burada yakalanıp gösterilir.
// actions = bildirim altındaki butonlar (örn. "Siparişi gör"). Her aksiyonun
// kendi `url`'i olabilir; yoksa ana `url`'e gider.
type PushAction = {
  action: string
  title: string
  icon?: string
  url?: string
}
type PushPayload = {
  title?: string
  body?: string
  url?: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  actions?: PushAction[]
}

self.addEventListener("push", (event: PushEvent) => {
  let payload: PushPayload = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = { title: "Deprem Market", body: event.data?.text() }
  }

  const title = payload.title || "Deprem Market"
  // Aksiyon başına URL'leri data'ya gömeriz (NotificationAction tipi url taşımaz),
  // notificationclick'te tıklanan aksiyona göre hedefi çözeriz.
  const actions = (payload.actions || []).slice(0, 2) // tarayıcılar genelde 2 buton gösterir
  const actionUrls: Record<string, string> = {}
  for (const a of actions) {
    if (a.url) actionUrls[a.action] = a.url
  }

  // `image` standart NotificationOptions tipinde yok ama tarayıcılar destekler
  // (büyük görsel önizleme) → tipi genişletiyoruz.
  const options: NotificationOptions & { image?: string } = {
    body: payload.body || "",
    icon: payload.icon || "/icon",
    badge: payload.badge || "/icon",
    image: payload.image,
    tag: payload.tag,
    actions: actions.map((a) => ({
      action: a.action,
      title: a.title,
      icon: a.icon,
    })),
    data: { url: payload.url || "/", actionUrls },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()
  const data = event.notification.data as {
    url?: string
    actionUrls?: Record<string, string>
  }
  // Bir aksiyon butonuna tıklandıysa onun URL'i; yoksa bildirimin ana URL'i.
  const targetUrl =
    (event.action && data?.actionUrls?.[event.action]) || data?.url || "/"

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
