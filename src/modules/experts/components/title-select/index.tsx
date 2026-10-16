"use client"

import { useState } from "react"
import { EXPERT_TITLE_OTHER, EXPERT_TITLES } from "@lib/expert-config"

/**
 * Uzman unvanı: EXPERT_TITLES listesinden seçilir; "Diğer" serbest metin
 * alanını açar. Listede olmayan kayıtlı unvan "Diğer" altında metniyle açılır.
 */
export default function ExpertTitleSelect({
  id,
  value,
  onChange,
  disabled,
  className,
}: {
  id?: string
  value: string
  onChange: (title: string) => void
  disabled?: boolean
  className?: string
}) {
  const inList = EXPERT_TITLES.includes(value)
  const [otherChosen, setOtherChosen] = useState(!!value && !inList)
  const other = otherChosen || (!!value && !inList)

  return (
    <>
      <select
        id={id}
        disabled={disabled}
        value={other ? EXPERT_TITLE_OTHER : inList ? value : ""}
        onChange={(e) => {
          const v = e.target.value
          if (v === EXPERT_TITLE_OTHER) {
            setOtherChosen(true)
            onChange("")
          } else {
            setOtherChosen(false)
            onChange(v)
          }
        }}
        className={className}
      >
        <option value="">Unvan seçin</option>
        {EXPERT_TITLES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
        <option value={EXPERT_TITLE_OTHER}>{EXPERT_TITLE_OTHER}</option>
      </select>
      {other && (
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Unvanınızı yazın"
          aria-label="Unvan (diğer)"
          maxLength={100}
          className={`${className ?? ""} mt-2`}
        />
      )}
    </>
  )
}
