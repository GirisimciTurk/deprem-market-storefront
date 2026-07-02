import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SHOWCASE_CATEGORIES } from "@lib/showcase"

/**
 * Ana sayfa "vitrin" bölümleri — satıcıların ürün girerken seçtiği sabit vitrin
 * kategorilerine (product.metadata.showcase) göre gruplanmış ürün şeritleri.
 * Her bölüm yalnız ürünü varsa render edilir; başlıktaki "Tümünü gör" o vitrin
 * kategorisinin tam listesine (/store?showcase=<key>) gider.
 *
 * Not: Medusa store API metadata dizisini kolay filtrelemediği için ürünler tek
 * seferde (fiyat + metadata ile) çekilip in-app bölümlere ayrılır (fiyat filtresi
 * gibi). Katalog büyürse bir /store/showcase endpoint'ine geçilebilir.
 */
const PER_SECTION = 10

export default async function ShowcaseSections({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100 } as any,
  })
  const products = response.products
  if (!products.length) return null

  const sections = SHOWCASE_CATEGORIES.map((sc) => {
    const items = products
      .filter((p) => {
        const s = (p.metadata as Record<string, unknown> | null)?.showcase
        return Array.isArray(s) && s.includes(sc.key)
      })
      .slice(0, PER_SECTION)
    return { ...sc, items }
  }).filter((s) => s.items.length > 0)

  if (!sections.length) return null

  return (
    <div className="content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-4">
      {sections.map((sec) => (
        <section key={sec.key} aria-label={sec.label}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{sec.emoji}</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-ui-fg-base tracking-tight">
                {sec.label}
              </h2>
            </div>
            <LocalizedClientLink
              href={`/store?showcase=${sec.key}`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline whitespace-nowrap"
            >
              Tümünü gör &rarr;
            </LocalizedClientLink>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sec.items.map((p) => (
              <ProductPreview key={p.id} product={p} region={region} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
