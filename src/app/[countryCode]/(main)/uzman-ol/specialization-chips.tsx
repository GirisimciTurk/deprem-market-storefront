"use client"

import { ENGINEER_SPECIALIZATIONS } from "@lib/expert-config"

/** "Uzman ol" formlarının uzmanlık seçimi: çoklu seçilen çipler. */
export default function SpecializationChips({
  value,
  onChange,
  disabled,
  labelClassName,
}: {
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  labelClassName: string
}) {
  const toggle = (key: string) =>
    onChange(
      value.includes(key) ? value.filter((k) => k !== key) : [...value, key]
    )

  return (
    <div>
      <span className={labelClassName}>
        Uzmanlık Alanları <span className="text-brand-500">*</span>
      </span>
      <p className="text-xs text-ui-fg-muted mb-2">
        Birden fazla seçebilirsiniz. Her uzmanlık ayrıca belge ile doğrulanır.
      </p>
      <div className="flex flex-wrap gap-2">
        {ENGINEER_SPECIALIZATIONS.map((s) => {
          const active = value.includes(s.key)
          return (
            <button
              type="button"
              key={s.key}
              disabled={disabled}
              onClick={() => toggle(s.key)}
              aria-pressed={active}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base hover:border-brand-400"
              }`}
            >
              {active ? "✓ " : ""}
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
