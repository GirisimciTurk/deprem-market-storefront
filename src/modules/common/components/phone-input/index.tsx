"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  formatTrPhone,
  TR_PHONE_PLACEHOLDER,
  trPhoneProblem,
} from "@lib/util/tr-phone"

/**
 * Doluysa ama eksikse alanın yerel doğrulamasını Türkçe iletiyle düşürür: form
 * `noValidate` değilse tarayıcı gönderimi durdurur ve iletiyi alanın yanında
 * gösterir. `noValidate` formlar ayrıca kendi kontrolünü yapar.
 */
function usePhoneValidity(value: string, mobileOnly?: boolean) {
  const ref = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    ref.current?.setCustomValidity(trPhoneProblem(value, { mobileOnly }))
  }, [value, mobileOnly])
  return ref
}

/**
 * Hazır bir girdi bileşenine (ör. hesap sayfalarındaki yüzen etiketli Input)
 * yayılacak telefon alanı özellikleri. Başlangıç değeri hangi biçimde gelirse
 * gelsin (ör. "+905321234567") "0 532 123 45 67" olarak açılır.
 */
export function useTrPhoneField(
  initial?: string | null,
  opts: { mobileOnly?: boolean } = {}
) {
  const [value, setValue] = useState(() => formatTrPhone(initial))
  const ref = usePhoneValidity(value, opts.mobileOnly)
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(formatTrPhone(e.target.value)),
    []
  )
  return {
    value,
    setValue,
    inputProps: {
      type: "tel" as const,
      inputMode: "tel" as const,
      autoComplete: "tel",
      maxLength: 15,
      value,
      onChange,
      ref,
    },
  }
}

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  value: string
  /** Biçimlenmiş değeri ("0 532 123 45 67") verir; göndermeden önce normalizeTrPhone. */
  onChange: (formatted: string) => void
  /** Yalnız cep telefonu (05…) kabul edilir. */
  mobileOnly?: boolean
}

/**
 * Türkiye telefon girdisi: yalnız rakam alır, yazdıkça "0 5xx xxx xx xx"
 * biçimine girer (sabit hat 0 2xx/3xx/4xx da olur). Görünümü formun kendi
 * sınıfıyla verilir (`className`).
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    { value, onChange, mobileOnly, placeholder = TR_PHONE_PLACEHOLDER, ...rest },
    forwardedRef
  ) => {
    const shown = formatTrPhone(value)
    const innerRef = usePhoneValidity(shown, mobileOnly)
    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        innerRef.current = el
        if (typeof forwardedRef === "function") forwardedRef(el)
        else if (forwardedRef) forwardedRef.current = el
      },
      [forwardedRef, innerRef]
    )
    return (
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={15}
        placeholder={placeholder}
        {...rest}
        value={shown}
        onChange={(e) => onChange(formatTrPhone(e.target.value))}
        ref={setRef}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export default PhoneInput
