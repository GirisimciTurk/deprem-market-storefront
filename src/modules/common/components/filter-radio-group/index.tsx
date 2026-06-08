import { Label, RadioGroup, Text, clx } from "@modules/common/components/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3">
      <Text className="text-xs font-bold text-slate-400 tracking-wider uppercase">
        {title}
      </Text>
      <RadioGroup data-testid={dataTestId} className="flex flex-col gap-y-2">
        {items?.map((i) => {
          const isSelected = i.value === value
          return (
            <div
              key={i.value}
              onClick={() => handleChange(i.value)}
              className={clx(
                "flex items-center gap-x-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 select-none",
                {
                  "border-rose-600 bg-rose-50/30 text-rose-950 font-semibold shadow-sm":
                    isSelected,
                  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50":
                    !isSelected,
                }
              )}
            >
              {/* Custom Radio Circle */}
              <div
                className={clx(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0",
                  {
                    "border-rose-600 bg-rose-600": isSelected,
                    "border-slate-300 bg-white": !isSelected,
                  }
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              <Label
                htmlFor={i.value}
                className="text-sm font-medium hover:cursor-pointer !transform-none !text-current"
                data-testid="radio-label"
                data-active={isSelected}
              >
                {i.label}
              </Label>

              <RadioGroup.Item
                checked={isSelected}
                onChange={() => handleChange(i.value)}
                className="hidden"
                id={i.value}
                value={i.value}
              />
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
