import { VariantPrice } from "types/global"
import React from "react"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  let isOnSale =
    price.price_type === "sale" ||
    (price.original_price_number &&
      price.calculated_price_number &&
      price.original_price_number > price.calculated_price_number)

  let percentageDiff = price.percentage_diff || "14"
  let originalPrice = price.original_price
  const calculatedPrice = price.calculated_price

  if (!isOnSale) {
    isOnSale = true
    percentageDiff = "14"
    const calcVal = (price.calculated_price_number || 0) / 100
    const origVal = Math.round(calcVal / (1 - 0.14))
    
    // Format original price
    if (price.calculated_price.includes("TRY") || price.calculated_price.includes("TL") || price.calculated_price.includes("₺")) {
      originalPrice = `${origVal.toLocaleString("tr-TR")} TL`
    } else {
      originalPrice = `$${origVal}.00`
    }
  }

  if (isOnSale) {
    return (
      <div className="flex flex-col gap-y-1">
        {/* Pink Badge for Sepette Discount percentage */}
        <div className="flex items-center gap-x-1.5 flex-wrap">
          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
            Sepette %{percentageDiff} İndirim
          </span>
        </div>

        {/* Price display with Sepette styling */}
        <div className="flex flex-col mt-0.5">
          <span className="text-[11px] text-gray-500 font-semibold line-through">
            {originalPrice}
          </span>
          <span className="bg-rose-50/80 border border-rose-150 text-rose-600 font-extrabold text-xs sm:text-sm px-2 py-1 rounded-md w-fit mt-0.5 shadow-2xs">
            Sepette{" "}
            <span className="text-sm sm:text-base font-black text-rose-700 ml-0.5">
              {calculatedPrice}
            </span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <span className="text-sm sm:text-base font-black text-orange-600">
        {calculatedPrice}
      </span>
    </div>
  )
}
