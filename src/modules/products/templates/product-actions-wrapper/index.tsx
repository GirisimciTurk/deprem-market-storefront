import { listProducts } from "@lib/data/products"
import { retrieveCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, customer] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    // Hizmet verilebilir ürünlerde talep formunu ön-doldurmak için (request-cached).
    retrieveCustomer().catch(() => null),
  ])

  if (!product) {
    return null
  }

  const fullName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
    : undefined

  return (
    <ProductActions
      product={product}
      region={region}
      defaultName={fullName || undefined}
      defaultEmail={customer?.email || undefined}
      defaultPhone={customer?.phone || undefined}
    />
  )
}
