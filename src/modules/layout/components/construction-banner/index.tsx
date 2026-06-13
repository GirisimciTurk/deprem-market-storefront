import { getLocale } from "next-intl/server"

/**
 * Site geneli "yapım aşamasındayız / henüz açılmadık" duyuru çubuğu. Layout'un en
 * üstünde (Nav'dan önce) gösterilir. Açılışta kaldırılmak üzere geçici.
 */
export default async function ConstructionBanner() {
  const locale = await getLocale()
  const isTr = locale !== "en"

  const title = isTr ? "YAPIM AŞAMASINDAYIZ" : "UNDER CONSTRUCTION"
  const text = isTr
    ? "Sitemiz henüz açılmadı — şu anda hazırlık ve test aşamasındayız. Çok yakında hizmetinizdeyiz!"
    : "Our site hasn't launched yet — we're currently preparing and testing. We'll be live very soon!"

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative w-full overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white shadow-md"
    >
      {/* kayan parlama efekti */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-construction-shine bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="content-container relative flex items-center justify-center gap-x-2.5 gap-y-1 px-4 py-2.5 text-center flex-wrap">
        <span className="text-lg leading-none animate-bounce" aria-hidden>
          🚧
        </span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[0.7rem] sm:text-xs font-extrabold uppercase tracking-wider ring-1 ring-white/30">
          {title}
        </span>
        <span className="text-xs sm:text-sm font-semibold">{text}</span>
        <span className="text-lg leading-none animate-bounce [animation-delay:200ms]" aria-hidden>
          🚧
        </span>
      </div>
    </div>
  )
}
