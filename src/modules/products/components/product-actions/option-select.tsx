import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

// Color map to translate Turkish & English color names to hex codes for swatches
const colorMap: Record<string, string> = {
  "turuncu": "#ff6b00",
  "orange": "#ff6b00",
  "siyah": "#000000",
  "black": "#000000",
  "kırmızı": "#e11d48",
  "red": "#e11d48",
  "yeşil": "#16a34a",
  "green": "#16a34a",
  "mavi": "#2563eb",
  "blue": "#2563eb",
  "gri": "#4b5563",
  "gray": "#4b5563",
  "beyaz": "#ffffff",
  "white": "#ffffff",
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const isColor = title.toLowerCase() === "renk" || title.toLowerCase() === "color"

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
          if (isColor) {
            const colorKey = v.toLowerCase()
            const hexColor = colorMap[colorKey] || "#cccccc"
            const isSelected = v === current
            return (
              <button
                key={v}
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
              />
            )
          }

          // Default styling for non-color options
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1 ",
                {
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
