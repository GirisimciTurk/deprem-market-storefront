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
