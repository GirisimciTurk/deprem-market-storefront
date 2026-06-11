import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  // GERÇEK indirim: ya "sale" fiyat listesi ya da orijinal fiyat > hesaplanan fiyat.
  // İndirim yoksa hiçbir indirim rozeti/üstü çizili fiyat gösterilmez.
  const discountPercentage = Number(selectedPrice.percentage_diff) || 0
  const hasDiscount =
    (selectedPrice.price_type === "sale" ||
      (!!selectedPrice.original_price_number &&
        !!selectedPrice.calculated_price_number &&
        selectedPrice.original_price_number >
          selectedPrice.calculated_price_number)) &&
    discountPercentage > 0

  return (
    <div className="flex items-center gap-x-4 my-3">
      {hasDiscount && (
        <div className="bg-red-600 text-white font-extrabold text-lg px-3 py-2 rounded-md flex items-center justify-center min-w-[55px] select-none">
          %{discountPercentage}
        </div>
      )}
      <div className="flex flex-col text-ui-fg-base">
        {hasDiscount && (
          <span
            className="text-sm line-through text-gray-400 font-medium"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        )}
        <span
          className="text-2xl font-extrabold text-gray-900 tracking-tight"
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </div>
    </div>
  )
}
