import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

// Çevrimdışı yedek sayfası. Service worker (src/app/sw.ts) bir navigasyon isteği
// ağ + önbellekte karşılanamazsa bu sayfayı döndürür (fallbacks.entries → /offline).
// next.config.js'te additionalPrecacheEntries ile precache edilir, middleware'de
// matcher dışı bırakılır (yoksa /tr/offline'a yönlenip precache'i kırardı).
export const metadata: Metadata = {
  title: "Çevrimdışı",
  robots: { index: false, follow: false },
}

export default async function OfflinePage() {
  const t = await getTranslations("offline")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <svg
        width="96"
        height="96"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 3L4 9V17C4 24.5 9.5 31.5 18 33C26.5 31.5 32 24.5 32 17V9L18 3Z"
          stroke="#E11D48"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#FFF1F2"
        />
        <path
          d="M9 19H13L16 12L20 24L23 16L25 19H27"
          stroke="#E11D48"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="7" r="2" fill="#E11D48" />
      </svg>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="max-w-md text-base text-gray-600">{t("description")}</p>
      </div>

      <a
        href="/tr"
        className="rounded-md bg-rose-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      >
        {t("retry")}
      </a>

      <p className="max-w-xs text-sm text-gray-400">{t("hint")}</p>
    </div>
  )
}
