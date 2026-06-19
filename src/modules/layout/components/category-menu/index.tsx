"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clx from "clsx"

/**
 * Masaüstü "Kategoriler" açılır mega-menüsü. Üst kategorileri sütunlar halinde,
 * her birinin altında (varsa) alt kategorilerini listeler. Hover ile açılır,
 * tıklamayla da aç/kapa; Escape kapatır. Yalnız `small:` ve üstünde görünür
 * (mobilde kategoriler side-menu'de). Veri `Nav`'da server-side çekilip geçilir.
 */
export default function CategoryMenu({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[] | null
}) {
  const t = useTranslations("categoryMenu")
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tops = (categories ?? []).filter((c) => !c.parent_category)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  // Buton ile panel arasında imleç gezerken kapanmaması için küçük gecikme.
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  useEffect(() => () => cancelClose(), [])

  if (tops.length === 0) return null

  return (
    <div
      className="relative hidden small:flex items-center h-full"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
        data-testid="category-menu-button"
        className={clx(
          "flex items-center gap-x-1 h-full border-b-2 transition-all duration-200 uppercase text-sm font-semibold tracking-wide",
          open
            ? "text-orange-600 border-orange-600"
            : "border-transparent text-slate-600 hover:text-orange-600 hover:border-orange-600/30"
        )}
      >
        {t("heading")}
        <ChevronDown
          className={clx("w-4 h-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute top-full left-0 z-[60] w-[min(92vw,720px)] rounded-b-lg border border-ui-border-base bg-white shadow-xl p-6"
          data-testid="category-menu-panel"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            {tops.map((cat) => {
              const children = cat.category_children ?? []
              return (
                <div key={cat.id} className="min-w-0">
                  <LocalizedClientLink
                    href={`/categories/${cat.handle}`}
                    onClick={() => setOpen(false)}
                    className="block font-bold text-slate-800 hover:text-orange-600 transition-colors truncate"
                    data-testid="category-menu-link"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                  {children.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {children.slice(0, 6).map((ch) => (
                        <li key={ch.id}>
                          <LocalizedClientLink
                            href={`/categories/${ch.handle}`}
                            onClick={() => setOpen(false)}
                            className="block text-sm text-slate-500 hover:text-orange-600 transition-colors truncate"
                            data-testid="category-menu-link"
                          >
                            {ch.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-ui-border-base">
            <LocalizedClientLink
              href="/kategoriler"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-x-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {t("all")} →
            </LocalizedClientLink>
          </div>
        </div>
      )}
    </div>
  )
}
