import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listMyReviews } from "@lib/data/reviews"

// Gerçek veri: müşterinin kendi yorumları backend review modülünden gelir
// (/store/reviews/me). Eskiden localStorage demo'su kullanılıyordu.
export default async function ReviewsPage() {
  const reviews = await listMyReviews()

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("tr-TR")
    } catch {
      return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          ⭐ Yorumlarım
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Satın aldığınız ürünler hakkında yaptığınız değerlendirmeler ve onay durumları.
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => {
            const image = review.images?.[0]
            const isApproved = review.status === "approved"
            return (
              <div
                key={review.id}
                className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-5 hover:shadow-sm transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-ui-border-base">
                  <div className="flex items-center gap-3 group">
                    <LocalizedClientLink
                      href={`/products/${review.product_handle}`}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-ui-bg-base border flex-shrink-0 flex items-center justify-center"
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={review.product_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </LocalizedClientLink>
                    <div>
                      <LocalizedClientLink href={`/products/${review.product_handle}`}>
                        <h3 className="font-bold text-ui-fg-base text-sm group-hover:text-brand-600 transition-colors">
                          {review.product_title}
                        </h3>
                      </LocalizedClientLink>
                      <span className="text-3xs text-ui-fg-muted block mt-0.5">
                        {fmtDate(review.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xs font-extrabold px-3 py-1 rounded-full ${
                        isApproved
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : review.status === "spam"
                          ? "bg-brand-100 text-brand-700 border border-brand-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {isApproved
                        ? "Yayında ✓"
                        : review.status === "spam"
                        ? "Reddedildi"
                        : "Onay Bekliyor ⏳"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm">
                        {i < review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-ui-fg-base italic leading-relaxed bg-ui-bg-base/50 p-3.5 rounded-xl border border-ui-border-base">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-ui-bg-subtle rounded-2xl border border-ui-border-base border-dashed">
          <span className="text-5xl mb-4 block">💬</span>
          <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">
            Henüz yorumunuz bulunmuyor
          </h3>
          <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-sm mx-auto mb-6">
            Satın aldığınız deprem ve afet çantaları hakkında deneyimlerinizi paylaşarak diğer kullanıcılarımıza yardımcı olabilirsiniz.
          </p>
          <LocalizedClientLink
            href="/account/orders"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Siparişlerime Git
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
