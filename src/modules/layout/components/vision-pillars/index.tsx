import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BookOpen, ShoppingBag, ShieldCheck } from "lucide-react"

/**
 * Ana sayfa vizyon şeridi — PDF s.1/s.2: üç sütun (Bilgilen · Hazırlan · Koru)
 * = Bilgi · Ürün · Hizmet. Halkı içerik, ürün ve doğrulanmış uzmanlarla buluşturan
 * üç taraflı ekosistemi kapıda gösterir. Server component (statik TR içerik).
 */
const PILLARS = [
  {
    icon: BookOpen,
    eyebrow: "Bilgilen",
    title: "Bilgi & Hazırlık",
    desc: "Deprem öncesi/sonrası ne yapmalı? Doğru bilgi, rehberler ve kişisel hazırlık asistanı.",
    href: "/blog",
    cta: "Bilgi Merkezi",
  },
  {
    icon: ShoppingBag,
    eyebrow: "Hazırlan",
    title: "Mağaza",
    desc: "Deprem çantası, ilk yardım, güçlendirme ve hayatta kalma ürünleri — tek noktadan.",
    href: "/store",
    cta: "Ürünlere Göz At",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Koru",
    title: "Doğrulanmış Uzmanlar",
    desc: "Bina risk tespiti, güçlendirme ve daha fazlası için doğrulanmış inşaat mühendisleri.",
    href: "/uzmanlar",
    cta: "Uzman Bul",
  },
]

export default function VisionPillars() {
  return (
    <section className="content-container py-8 sm:py-10">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase">
          Deprem Güvenliği Platformu
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-ui-fg-base tracking-tight mt-1">
          Bilgilen · Hazırlan · Koru
        </h2>
        <p className="text-ui-fg-muted text-sm mt-1">
          Halkı; doğru bilgi, dayanıklı ürünler ve doğrulanmış mühendislerle
          buluşturan ekosistem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PILLARS.map((p) => {
          const Icon = p.icon
          return (
            <LocalizedClientLink
              key={p.eyebrow}
              href={p.href}
              className="group flex flex-col rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-600 text-white mb-3">
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-brand-650 text-[0.7rem] font-bold tracking-wider uppercase">
                {p.eyebrow}
              </span>
              <h3 className="font-bold text-ui-fg-base text-base mt-0.5 mb-1">
                {p.title}
              </h3>
              <p className="text-xs text-ui-fg-muted leading-relaxed flex-1">
                {p.desc}
              </p>
              <span className="mt-3 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                {p.cta} →
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
