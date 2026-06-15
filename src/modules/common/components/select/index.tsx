import { ChevronUpDown } from "@medusajs/icons"
import { Label } from "@modules/common/components/ui"
import React, { useImperativeHandle } from "react"

type SelectProps = Omit<
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ name, label, touched: _touched, required, topLabel, children, value, ...props }, ref) => {
    const selectRef = React.useRef<HTMLSelectElement>(null)

    useImperativeHandle(ref, () => selectRef.current!)

    const hasValue = value !== "" && value !== undefined && value !== null

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
        )}
        <div className="flex relative z-0 w-full txt-compact-medium">
          <select
            name={name}
            required={required}
            className={`pt-4 pb-1 block w-full h-11 px-4 pr-10 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover text-ui-fg-base ${
              hasValue ? "select-has-val" : ""
            }`}
            value={value}
            {...props}
            ref={selectRef}
          >
            <option value="" disabled hidden></option>
            {children}
          </select>
          <label
            htmlFor={name}
            onClick={() => selectRef.current?.focus()}
            className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 top-3 -z-1 origin-0 text-ui-fg-subtle cursor-pointer"
          >
            {label}
            {required && <span className="text-brand-500">*</span>}
          </label>
          <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none text-ui-fg-subtle">
            <ChevronUpDown />
          </span>
        </div>
      </div>
    )
  }
)

Select.displayName = "Select"

export default Select
