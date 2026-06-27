import { Star, Store } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { toReachableImageUrl } from "@lib/util/image-url"
import { listFeaturedSellers } from "@lib/data/sellers"

/**
 * "Öne Çıkan Satıcılar" vitrini — admin tarafından öne çıkarılmış (is_featured)
 * aktif bayiler. PDF Slayt 4: bayiler için "mağazada öne çıkma" değeri.
 * Öne çıkan bayi yoksa hiç render edilmez.
 */
export default async function FeaturedSellers() {
  const sellers = await listFeaturedSellers()
  if (!sellers.length) return null

  return (
    <section className="content-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            ★ Öne Çıkan Satıcılar
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ui-fg-base tracking-tight mt-1">
            Mağazada Öne Çıkan Bayiler
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sellers.map((s) => {
          const logo = toReachableImageUrl(s.logo || undefined)
          return (
            <LocalizedClientLink
              key={s.id}
              href={`/satici/${s.handle}`}
              className="group flex flex-col items-center text-center border border-amber-200 ring-1 ring-amber-100 rounded-2xl bg-ui-bg-base p-5 hover:shadow-md hover:border-amber-300 transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-ui-bg-subtle border border-ui-border-base overflow-hidden flex items-center justify-center mb-3">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={s.name} className="w-full h-full object-cover" />
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
                <p className="text-xs text-ui-fg-muted mt-2 line-clamp-2">{s.description}</p>
              )}
              <span className="mt-2 text-[0.66rem] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ★ Öne Çıkan
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
