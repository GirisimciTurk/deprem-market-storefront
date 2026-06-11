import { VariantPrice } from "types/global"
import React from "react"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  // GERÇEK indirim: "sale" fiyat listesi ya da orijinal fiyat > hesaplanan fiyat.
  // İndirim yoksa düz fiyat gösterilir (uydurma indirim YOK).
  const percentageDiff = Number(price.percentage_diff) || 0
  const isOnSale =
    (price.price_type === "sale" ||
      (!!price.original_price_number &&
        !!price.calculated_price_number &&
        price.original_price_number > price.calculated_price_number)) &&
    percentageDiff > 0

  if (isOnSale) {
    return (
      <div className="flex flex-col gap-y-1">
        {/* İndirim yüzdesi rozeti */}
        <div className="flex items-center gap-x-1.5 flex-wrap">
          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
            %{percentageDiff} İndirim
          </span>
        </div>

        {/* Üstü çizili orijinal + indirimli fiyat */}
        <div className="flex flex-col mt-0.5">
          <span className="text-[11px] text-gray-500 font-semibold line-through">
            {price.original_price}
          </span>
          <span className="text-rose-700 font-black text-sm sm:text-base mt-0.5">
            {price.calculated_price}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <span className="text-sm sm:text-base font-black text-orange-600">
        {price.calculated_price}
      </span>
    </div>
  )
}
