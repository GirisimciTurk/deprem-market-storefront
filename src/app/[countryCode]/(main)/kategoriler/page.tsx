import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categoryMenu")
  return {
    title: t("indexTitle"),
    description: t("indexSubtitle"),
  }
}

/**
 * "Tüm Kategoriler" indeks/landing sayfası — üst kategorileri kart ızgarasında,
 * her birinin altında (varsa) alt kategorilerini gösterir. Müşterinin kategorilere
 * tek sayfadan göz atmasını sağlar (nav mega-menüsü ve mobil menüden de linklenir).
 */
export default async function CategoriesIndexPage() {
  const [categories, t] = await Promise.all([
    listCategories(),
    getTranslations("categoryMenu"),
  ])

  const tops = (categories ?? []).filter((c) => !c.parent_category)

  return (
    <div className="content-container py-12" data-testid="categories-index">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">{t("indexTitle")}</h1>
        <p className="mt-2 text-base text-ui-fg-subtle max-w-2xl">
          {t("indexSubtitle")}
        </p>
      </div>

      {tops.length === 0 ? (
        <p className="text-ui-fg-muted">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tops.map((cat) => {
            const children = cat.category_children ?? []
            const count = cat.products?.length ?? 0
            return (
              <div
                key={cat.id}
                className="rounded-lg border border-ui-border-base p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
                data-testid="category-card"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <LocalizedClientLink
                    href={`/store?categoryId=${cat.id}`}
                    className="text-lg font-bold text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                  {count > 0 && (
                    <span className="shrink-0 text-xs text-ui-fg-muted">
                      {t("productCount", { count })}
                    </span>
                  )}
                </div>
                {children.length > 0 && (
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {children.map((ch) => (
                      <li key={ch.id}>
                        <LocalizedClientLink
                          href={`/store?categoryId=${ch.id}`}
                          className="text-sm text-slate-500 hover:text-brand-600 transition-colors"
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
      )}
    </div>
  )
}
