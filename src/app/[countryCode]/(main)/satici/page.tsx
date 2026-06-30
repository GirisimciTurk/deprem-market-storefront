import { Metadata } from "next"
import { Star, Store } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { toReachableImageUrl } from "@lib/util/image-url"
import { listSellers } from "@lib/data/sellers"

export const metadata: Metadata = {
  title: "Bayi Mağazaları | depremTek Market",
  description:
    "depremTek Market bayilerinin mağazaları. Doğrulanmış bayilerden deprem hazırlık ve güvenlik ürünleri.",
}

/**
 * Bayi mağazaları index'i (/satici) — tüm aktif bayi/satıcı dükkanlarını listeler.
 * Header'daki "Mağazalar" linki ile mobil menüler buraya bağlanır (eski sabit-kodlu
 * /satici/deprem-market 404 veriyordu). Üstte "Bayi Ol" CTA.
 */
export default async function SellersIndexPage() {
  const sellers = await listSellers()

  return (
    <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
            Bayilerimiz
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ui-fg-base tracking-tight mt-1">
            Bayi Mağazaları
          </h1>
          <p className="text-sm text-ui-fg-subtle mt-2 max-w-xl">
            Doğrulanmış bayilerimizin mağazalarını keşfedin. Siz de bayimiz olup
            kendi dükkanınızı açabilirsiniz.
          </p>
        </div>
        <LocalizedClientLink
          href="/satici-ol"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
        >
          Bayi Ol
        </LocalizedClientLink>
      </div>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center text-center border border-dashed border-ui-border-base rounded-2xl py-16 px-6">
          <Store className="w-10 h-10 text-ui-fg-muted mb-3" />
          <h2 className="font-bold text-ui-fg-base">Henüz bayi mağazası yok</h2>
          <p className="text-sm text-ui-fg-muted mt-1 max-w-sm">
            İlk bayimiz siz olun. Başvurun, onaylandığında kendi mağazanızı açıp
            ürünlerinizi satmaya başlayın.
          </p>
          <LocalizedClientLink
            href="/satici-ol"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-colors"
          >
            Bayilik Başvurusu
          </LocalizedClientLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sellers.map((s) => {
            const logo = toReachableImageUrl(s.logo || undefined)
            return (
              <LocalizedClientLink
                key={s.id}
                href={`/satici/${s.handle}`}
                className="group flex flex-col items-center text-center border border-ui-border-base rounded-2xl bg-ui-bg-base p-5 hover:shadow-md hover:border-brand-300 transition-all"
              >
                <div className="w-16 h-16 rounded-xl bg-ui-bg-subtle border border-ui-border-base overflow-hidden flex items-center justify-center mb-3">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-7 h-7 text-ui-fg-muted" />
                  )}
                </div>
                <h3 className="font-bold text-sm text-ui-fg-base group-hover:text-brand-700 transition-colors line-clamp-1">
                  {s.name}
                </h3>
                {(s.rating_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-ui-fg-muted mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {(s.rating_avg ?? 0).toFixed(1)} ({s.rating_count})
                  </span>
                )}
                {s.description && (
                  <p className="text-xs text-ui-fg-muted mt-2 line-clamp-2">
                    {s.description}
                  </p>
                )}
              </LocalizedClientLink>
            )
          })}
        </div>
      )}
    </div>
  )
}
