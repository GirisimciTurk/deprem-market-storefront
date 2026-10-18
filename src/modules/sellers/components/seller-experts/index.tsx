import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Expert } from "@lib/data/experts"

// Mağazanın uygulama yolu: kendi uygulama noktası ya da anlaşmalı uzmanları;
// ikisi de yoksa uzman dizini.
export default function SellerExperts({ experts, hasInstallationPoint }: { experts: Expert[]; hasInstallationPoint: boolean }) {
  return (
    <section id="uygulama" className="mb-8 rounded-xl bg-brand-50 p-4">
      <h2 className="text-lg font-bold text-gray-900">Uygulatmak mı istiyorsunuz?</h2>
      <p className="mt-1 text-sm text-gray-600">
        {hasInstallationPoint
          ? "Bu mağaza ürünlerini kendi uygulama noktasından da uyguluyor (yukarıda)."
          : "Bu mağazanın kendi uygulama noktası yok."}{" "}
        {experts.length > 0 ? "Mağazanın anlaşmalı uygulayıcıları:" : "Bölgenizdeki uzmanlara uzman dizininden ulaşabilirsiniz."}
      </p>
      {experts.length > 0 && (
        <ul className="mt-3 grid grid-cols-1 small:grid-cols-2 gap-3">
          {experts.map((e) => (
            <li key={e.slug} className="rounded-lg bg-white p-3 border border-brand-100">
              <LocalizedClientLink href={`/uzmanlar/${e.slug}`} className="font-semibold text-brand-700 hover:underline">
                {e.full_name}
              </LocalizedClientLink>
              <p className="text-xs text-gray-600">{[e.title || e.headline, e.city].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
      <LocalizedClientLink href="/uzmanlar" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
        Tüm uzmanlar →
      </LocalizedClientLink>
    </section>
  )
}
