import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import { getBoughtTogetherIds } from "@lib/data/recommendations"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

/**
 * "Birlikte Sıkça Alınanlar" — gerçek sipariş geçmişinden gelen öneriler.
 * Veri yoksa (yeni ürün / az sipariş) hiçbir şey render etmez.
 */
export default async function BoughtTogether({ product, countryCode }: Props) {
  const ids = await getBoughtTogetherIds(product.id)
  if (!ids.length) return null

  const region = await getRegion(countryCode)
  if (!region) return null

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      id: ids,
      region_id: region.id,
      is_giftcard: false,
    } as HttpTypes.StoreProductListParams,
  })

  // Backend'in birliktelik sırasını koru.
  const byId = new Map(response.products.map((p) => [p.id, p]))
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((p): p is HttpTypes.StoreProduct => !!p && p.id !== product.id)

  if (!ordered.length) return null

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-base-regular text-gray-600 mb-2">Birlikte Sıkça Alınanlar</span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          Bu ürünü alanlar bunları da tercih etti.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {ordered.map((p) => (
          <li key={p.id}>
            <Product region={region} product={p} />
          </li>
        ))}
      </ul>
    </div>
  )
}
