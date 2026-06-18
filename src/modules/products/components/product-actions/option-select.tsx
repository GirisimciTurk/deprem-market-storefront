import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React, { useMemo } from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  variants?: HttpTypes.StoreProductVariant[] | null
  "data-testid"?: string
}

// Color map to translate Turkish & English color names to hex codes for swatches
const colorMap: Record<string, string> = {
  "turuncu": "#ff6b00",
  "orange": "#ff6b00",
  "siyah": "#000000",
  "black": "#000000",
  "kırmızı": "#F08C1A",
  "red": "#F08C1A",
  "yeşil": "#16a34a",
  "green": "#16a34a",
  "mavi": "#2563eb",
  "blue": "#2563eb",
  "gri": "#4b5563",
  "gray": "#4b5563",
  "beyaz": "#ffffff",
  "white": "#ffffff",
}

/**
 * Compute stock status per option value.
 * A value is "in stock" if at least one variant that carries this option value
 * has inventory > 0 OR does not manage inventory (unlimited).
 */
function getStockByOptionValue(
  optionId: string,
  variants?: HttpTypes.StoreProductVariant[] | null
): Record<string, { inStock: boolean; quantity: number }> {
  const stockMap: Record<string, { inStock: boolean; quantity: number }> = {}

  if (!variants) return stockMap

  for (const variant of variants) {
    const optVal = variant.options?.find((o) => o.option_id === optionId)?.value
    if (!optVal) continue

    const variantInStock =
      !variant.manage_inventory ||
      variant.allow_backorder ||
      (variant.inventory_quantity ?? 0) > 0

    const qty = variant.inventory_quantity ?? 0

    if (!stockMap[optVal]) {
      stockMap[optVal] = { inStock: variantInStock, quantity: qty }
    } else {
      // Aggregate: if ANY variant with this value is in stock, the value is in stock
      if (variantInStock) stockMap[optVal].inStock = true
      stockMap[optVal].quantity += qty
    }
  }

  return stockMap
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  variants,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const isColor = title.toLowerCase() === "renk" || title.toLowerCase() === "color"

  const stockMap = useMemo(
    () => getStockByOptionValue(option.id, variants),
    [option.id, variants]
  )

  return (
    <div className="flex flex-col gap-y-3 my-2">
      <span className="text-sm font-semibold text-gray-700">
        {title} {isColor && current ? `: ${current}` : ""}
      </span>
      <div
        className="flex flex-wrap gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const stock = stockMap[v]
          const valueInStock = stock ? stock.inStock : true // default to true if no data
          const stockQty = stock ? stock.quantity : 0

          if (isColor) {
            const colorKey = v.toLowerCase()
            const hexColor = colorMap[colorKey] || "#cccccc"
            const isSelected = v === current
            return (
              <div key={v} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => updateOption(option.id, v)}
                  disabled={disabled}
                  style={{ backgroundColor: hexColor }}
                  title={v}
                  className={clx(
                    "w-10 h-10 rounded-md border transition-all relative outline-none",
                    {
                      "ring-2 ring-offset-2 ring-black border-black scale-95": isSelected,
                      "border-gray-200 hover:scale-105 opacity-80 hover:opacity-100": !isSelected,
                      "opacity-40 cursor-not-allowed": disabled
                    }
                  )}
                  aria-label={`Select ${v}`}
                >
                  {/* Out-of-stock diagonal line */}
                  {!valueInStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="block w-[140%] h-[2px] bg-red-500 rotate-45 absolute" />
                    </span>
                  )}
                </button>
                {/* Stock badge under color swatch */}
                {variants && variants.length > 0 && (
                  <span
                    className={clx("text-[10px] font-medium leading-none", {
                      "text-emerald-600": valueInStock,
                      "text-red-500": !valueInStock,
                    })}
                  >
                    {valueInStock ? "Stokta" : "Tükendi"}
                  </span>
                )}
              </div>
            )
          }

          // Default styling for non-color options (e.g., size: S, M, L)
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border bg-white text-small-regular h-auto min-h-[2.75rem] rounded-lg px-4 py-2 flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 relative",
                {
                  "border-orange-500 ring-1 ring-orange-500 shadow-sm": v === current,
                  "border-gray-200 hover:border-gray-300 hover:shadow-sm": v !== current,
                  "opacity-50": !valueInStock,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              <span
                className={clx("font-medium text-sm", {
                  "text-gray-900": valueInStock,
                  "text-gray-400 line-through": !valueInStock,
                })}
              >
                {v}
              </span>
              {/* Stock indicator */}
              {variants && variants.length > 0 && (
                <span
                  className={clx("text-[10px] font-medium leading-tight", {
                    "text-emerald-600": valueInStock,
                    "text-red-500": !valueInStock,
                  })}
                >
                  {valueInStock
                    ? stockQty > 0
                      ? `${stockQty} adet`
                      : "Stokta"
                    : "Tükendi"}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
