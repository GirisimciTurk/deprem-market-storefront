import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"
import { Search } from "lucide-react"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const sp = await props.searchParams
  const q = (sp.q || "").trim()
  return {
    title: q ? `“${q}” için arama sonuçları` : "Ürün Ara",
    // Arama sonuç sayfaları indekslenmez (yinelenen/ince içerik); linkler takip edilir.
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage(props: Props) {
  const { countryCode } = await props.params
  const sp = await props.searchParams
  const q = (sp.q || "").trim()

  const region = await getRegion(countryCode)
  if (!region) notFound()

  let products: HttpTypes.StoreProduct[] = []
  if (q.length >= 2) {
    const { response } = await listProducts({
      countryCode,
      queryParams: { q, limit: 24 } as HttpTypes.StoreProductListParams,
    })
    products = response.products
  }

  return (
    <div className="content-container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {q ? <>“{q}” için sonuçlar</> : "Ürün Ara"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {q.length >= 2
            ? `${products.length} ürün bulundu`
            : "Aramak için yukarıdaki çubuğa en az 2 karakter girin."}
        </p>
      </div>

      {products.length > 0 ? (
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
          data-testid="search-results-grid"
        >
          {products.map((p) => (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          ))}
        </ul>
      ) : q.length >= 2 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/60 py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-base font-semibold text-slate-700">
            “{q}” için sonuç bulunamadı.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Farklı bir anahtar kelime deneyin veya tüm ürünlere göz atın.
          </p>
        </div>
      ) : null}
    </div>
  )
}
