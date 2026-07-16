import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRight } from "lucide-react"

export type Crumb = { label: string; href?: string }

/** Görünür kırıntı navigasyonu (Ana Sayfa > Mağaza > Ürün). Son öğe link değildir. */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  if (!items || items.length === 0) return null
  return (
    <nav aria-label="Sayfa konumu" className="text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-x-1.5 min-w-0">
              {item.href && !isLast ? (
                <LocalizedClientLink
                  href={item.href}
                  className="hover:text-orange-600 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </LocalizedClientLink>
              ) : (
                <span
                  className={isLast ? "text-gray-700 font-semibold truncate" : "whitespace-nowrap"}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
