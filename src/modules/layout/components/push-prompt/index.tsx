"use client"

import { useEffect, useState } from "react"
import {
  isPushSupported,
  getPermission,
  subscribeToPush,
} from "@lib/util/push"

const DISMISS_KEY = "_deprem_market_push_prompt"

/**
 * Site geneli "Bildirimlere izin ver" istemi (çerez bandı stilinde, sol-altta).
 * Sadece: push destekleniyorsa + izin "default" ise + daha önce kapatılmadıysa
 * + çerez kararı verilmişse (iki bandın çakışmaması için) gösterilir.
 */
const PushPrompt = () => {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) return
    if (getPermission() !== "default") return
    if (localStorage.getItem(DISMISS_KEY)) return
    // Çerez bandı ile aynı anda çıkmasın: çerez kararı verilmemişse bekle.
    const cookieDecided = !!localStorage.getItem(
      "_deprem_market_cookie_consent"
    )
    const delay = cookieDecided ? 2500 : 8000
    const timer = setTimeout(() => {
      // Tetiklenince izin durumu hâlâ "default" mı tekrar bak.
      if (getPermission() === "default" && !localStorage.getItem(DISMISS_KEY)) {
        setVisible(true)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "dismissed")
    setVisible(false)
  }

  const allow = async () => {
    setBusy(true)
    try {
      const sub = await subscribeToPush()
      // İzin verilse de verilmese de bandı kapat ve bir daha gösterme.
      localStorage.setItem(DISMISS_KEY, sub ? "granted" : "decided")
      setVisible(false)
    } finally {
      setBusy(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-ui-border-base shadow-2xl p-6 rounded-xl flex flex-col gap-y-4">
        <div className="flex items-start gap-x-3">
          <svg
            className="text-orange-600 w-6 h-6 flex-shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          <div className="flex flex-col gap-y-1">
            <h4 className="font-bold text-ui-fg-base text-sm">
              Bildirimlere izin verin
            </h4>
            <p className="text-xs text-ui-fg-subtle leading-relaxed">
              Sipariş durumunuz (kargo & teslimat), stoğa gelen ürünler ve özel
              kampanyalardan anında haberdar olun.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-3 text-xs font-semibold">
          <button
            onClick={dismiss}
            disabled={busy}
            className="px-4 py-2 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover rounded-md transition-colors"
          >
            Şimdi değil
          </button>
          <button
            onClick={allow}
            disabled={busy}
            className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 rounded-md shadow-sm transition-colors disabled:opacity-60"
          >
            {busy ? "..." : "İzin ver"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PushPrompt
