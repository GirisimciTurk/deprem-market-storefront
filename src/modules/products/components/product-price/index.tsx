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

  // Check if it's on sale, or mock a 14% discount for preview purposes
  let isSale = selectedPrice.price_type === "sale"
  let discountPercentage = selectedPrice.percentage_diff || 14
  const calculatedPrice = selectedPrice.calculated_price
  let originalPrice = selectedPrice.original_price

  if (!isSale) {
    isSale = true
    discountPercentage = 14
    const calcVal = (selectedPrice.calculated_price_number || 0) / 100
    const origVal = Math.round(calcVal / (1 - 0.14))
    
    // Format original price
    if (
      selectedPrice.calculated_price.includes("TRY") ||
      selectedPrice.calculated_price.includes("TL") ||
      selectedPrice.calculated_price.includes("₺")
    ) {
      originalPrice = `${origVal.toLocaleString("tr-TR")} TL`
    } else {
      originalPrice = `$${origVal}.00`
    }
  }

  return (
    <div className="flex items-center gap-x-4 my-3">
      {isSale && (
        <div className="bg-red-600 text-white font-extrabold text-lg px-3 py-2 rounded-md flex items-center justify-center min-w-[55px] select-none">
          %{discountPercentage}
        </div>
      )}
      <div className="flex flex-col text-ui-fg-base">
        {isSale && (
          <span
            className="text-sm line-through text-gray-400 font-medium"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {originalPrice}
          </span>
        )}
        <span
          className="text-2xl font-extrabold text-gray-900 tracking-tight"
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {calculatedPrice}
        </span>
      </div>
    </div>
  )
}
