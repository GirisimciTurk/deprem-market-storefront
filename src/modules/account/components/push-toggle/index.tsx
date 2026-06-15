"use client"

import { useEffect, useState } from "react"
import { clx } from "@modules/common/components/ui"
import {
  isPushSupported,
  getPermission,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@lib/util/push"

/**
 * Hesap sayfasında "Bildirimler" aç/kapat anahtarı. Açıkken sipariş durumu ve
 * kampanya bildirimleri bu cihaza gelir. Mevcut izin/abonelik durumunu yansıtır.
 */
const PushToggle = () => {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const supp = isPushSupported()
    setSupported(supp)
    if (!supp) return
    setDenied(getPermission() === "denied")
    getExistingSubscription().then((sub) => setEnabled(!!sub))
  }, [])

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (enabled) {
        await unsubscribeFromPush()
        setEnabled(false)
      } else {
        const sub = await subscribeToPush()
        if (sub) {
          setEnabled(true)
          setDenied(false)
        } else {
          setDenied(getPermission() === "denied")
        }
      }
    } finally {
      setBusy(false)
    }
  }

  // Sunucuda/desteklenmeyen tarayıcıda gösterme (hydration sonrası belli olur).
  if (supported === null || supported === false) {
    return null
  }

  return (
    <div className="flex items-start justify-between gap-x-4 border border-ui-border-base rounded-lg p-4">
      <div className="flex flex-col gap-y-1">
        <span className="text-base-semi text-ui-fg-base">
          Anlık Bildirimler
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          Sipariş durumu (kargo/teslimat) ve kampanyalardan bu cihazda anında
          haberdar olun.
        </span>
        {denied && (
          <span className="text-xs text-brand-600 mt-1">
            Bildirim izni tarayıcıda engellenmiş. Site ayarlarından izin verip
            tekrar deneyin.
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Anlık bildirimleri aç/kapat"
        onClick={toggle}
        disabled={busy || denied}
        className={clx(
          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors mt-1 disabled:opacity-50",
          enabled ? "bg-orange-600" : "bg-gray-300"
        )}
        data-testid="push-toggle"
      >
        <span
          className={clx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )
}

export default PushToggle
