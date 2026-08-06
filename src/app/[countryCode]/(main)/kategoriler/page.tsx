import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { expandCategoryIds } from "@lib/util/category-tree"

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
export default async function CategoriesIndexPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const [categories, t] = await Promise.all([
    listCategories(),
    getTranslations("categoryMenu"),
  ])

  const all = categories ?? []
  const tops = all.filter((c) => !c.parent_category)

  // Alt kategoriler DÜZ listeden türetilir, `category_children`ten değil:
  // ilişki alanı pasif/dahili kategorileri de taşıyor, düz liste ise backend'in
  // is_active/is_internal süzgecinden geçmiş. İkisi ayrışınca listede görünen
  // kategori sayaçta yer almıyordu.
  const childrenOf = (parentId: string) =>
    all.filter(
      (c) => (c.parent_category_id ?? c.parent_category?.id) === parentId
    )

  // Sayaç, kartın gittiği /store sorgusuyla AYNI uçtan geliyor: `*products`
  // gömülü listesi yayınlanmamış ve satış kanalı dışı ürünleri de içerdiği için
  // "24 ürün" yazan kart 16 ürünle açılıyordu.
  const counts = new Map<string, number>(
    await Promise.all(
      tops.map(async (cat) => {
        try {
          const { response } = await listProducts({
            countryCode,
            queryParams: {
              limit: 1,
              category_id: expandCategoryIds([cat.id], all),
            } as any,
          })
          return [cat.id, response.count] as [string, number]
        } catch {
          // Sayaç gösterilmesin; yanlış sayı göstermekten iyidir.
          return [cat.id, 0] as [string, number]
        }
      })
    )
  )

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start gap-6">
          {tops.map((cat) => {
            const children = childrenOf(cat.id)
            const count = counts.get(cat.id) ?? 0
            return (
              <div
                key={cat.id}
                className="rounded-lg border border-ui-border-base p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
                data-testid="category-card"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="min-w-0 text-lg font-bold text-slate-800">
                    <LocalizedClientLink
                      href={`/store?categoryId=${cat.id}`}
                      className="hover:text-brand-600 transition-colors"
                    >
                      {cat.name}
                    </LocalizedClientLink>
                  </h2>
                  {count > 0 && (
                    <span className="shrink-0 text-xs text-ui-fg-muted">
                      {t("productCount", { count })}
                    </span>
                  )}
                </div>
                {children.length > 0 && (
                  // Alt alta liste: yan yana sarmalanan bağlantılarda hangi
                  // adın nerede bittiği okunmuyordu.
                  <ul className="-mb-1 flex flex-col divide-y divide-ui-border-base border-t border-ui-border-base">
                    {children.map((ch) => (
                      <li key={ch.id}>
                        <LocalizedClientLink
                          href={`/store?categoryId=${ch.id}`}
                          className="group flex items-center gap-2 py-2 text-sm text-slate-600 transition-colors hover:text-brand-600"
                        >
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 transition-colors group-hover:bg-brand-500"
                          />
                          <span className="min-w-0 truncate" title={ch.name}>
                            {ch.name}
                          </span>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
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
