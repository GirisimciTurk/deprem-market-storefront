"use client"

import { ChevronRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Hesap panelindeki "Hizmet Al" sayfası: uzman ve güçlendirme hizmetlerine
 * bağlantılar. Talepler doğrudan bize düşer; bayi havuzu ya da teklif yarışı yok.
 */
export default function HizmetAlClient() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ui-fg-base">
          🛠️ Hizmet Al
        </h1>
        <p className="mt-1 text-xs text-ui-fg-muted">
          Uzman mühendislik ve karbon fiber güçlendirme hizmetleri.
        </p>
      </div>

      <div className="rounded-2xl border border-ui-border-base bg-white p-5 shadow-sm">
        <ul className="flex flex-col divide-y divide-ui-border-base">
          <ServiceLink
            href="/hizmetler/karbon-fiber"
            title="Karbon Fiber Kolon Güçlendirme"
            desc="Talebinizi bırakın; sizi arayıp yüz yüze görüşelim, malzeme ve uygulamada anlaşalım."
          />
          <ServiceLink
            href="/uzmanlar"
            title="Uzman / Mühendis Bul"
            desc="Doğrulanmış inşaat mühendislerini inceleyin, iletişime geçin."
          />
          <ServiceLink
            href="/uzman-paketleri"
            title="Uzman Paketleri"
            desc="Hazır mühendislik hizmet paketlerini görüntüleyin."
          />
        </ul>
      </div>
    </div>
  )
}

function ServiceLink({
  href,
  title,
  desc,
}: {
  href: string
  title: string
  desc: string
}) {
  return (
    <li>
      <LocalizedClientLink
        href={href}
        className="group flex items-center justify-between gap-3 py-3 transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ui-fg-base group-hover:text-brand-700">
            {title}
          </span>
          <span className="block text-xs text-ui-fg-muted">{desc}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ui-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </LocalizedClientLink>
    </li>
  )
}
