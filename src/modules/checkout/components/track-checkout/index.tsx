"use client"

import { useEffect } from "react"
import { track } from "@lib/util/analytics"

/**
 * Checkout sayfasına girişte bir kez `checkout_start` davranış olayı gönderir
 * (funnel'ın "ödemeye geçiş" adımı). `value` minor (kuruş) cinsindendir.
 */
export default function TrackCheckoutStart({
  value,
  currency,
}: {
  value?: number | null
  currency?: string | null
}) {
  useEffect(() => {
    track("checkout_start", { value: value ?? null, currency_code: currency ?? null })
  }, [value, currency])
  return null
}
