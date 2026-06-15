"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const DISMISS_KEY = "_deprem_market_install_prompt"
// push-prompt ile PAYLAŞILAN kilit: aynı anda iki alt-bant çıkmasın (görsel çakışma).
// İlk gösterilen bant bu sessionStorage anahtarını set eder, diğeri o oturum atlar.
const OVERLAY_KEY = "_dm_overlay_shown"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const iDevice = /iphone|ipad|ipod/i.test(ua)
  // iPadOS 13+ masaüstü Safari gibi görünür → dokunmatik + Mac kontrolü.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  // Sadece gerçek Safari (Chrome/Firefox/Edge iOS'ta "Ana Ekrana Ekle" desteklemez).
  const safari = /safari/i.test(ua) && !/(crios|fxios|edgios|chrome|android)/i.test(ua)
  return (iDevice || iPadOS) && safari
}

/**
 * "Uygulamayı yükle" istemi (çerez/push bandı stilinde, sol-altta).
 * - Android/Chrome: beforeinstallprompt yakalanır → buton native kurulumu tetikler.
 * - iOS Safari: bu event yoktur → manuel "Paylaş → Ana Ekrana Ekle" yönergesi gösterilir.
 * Zaten kuruluysa (standalone) ya da daha önce kapatıldıysa hiç görünmez; push-prompt
 * ile OVERLAY_KEY kilidi sayesinde aynı anda iki bant çıkmaz.
 */
const InstallPrompt = () => {
  const t = useTranslations("pwa")
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<"android" | "ios" | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY)) return

    // Bandı göstermeden hemen önce: hâlâ uygun mu + kilidi kapabildik mi?
    const claim = (): boolean => {
      if (localStorage.getItem(DISMISS_KEY)) return false
      if (isStandalone()) return false
      // Çerez bandı ile AYNI ANDA çıkmasın (alt köşede üst üste binmesinler):
      // çerez kararı verilmemişse bu band gösterilmez.
      if (!localStorage.getItem("_deprem_market_cookie_consent")) return false
      if (sessionStorage.getItem(OVERLAY_KEY)) return false
      sessionStorage.setItem(OVERLAY_KEY, "install")
      return true
    }

    const onBeforeInstall = (e: Event) => {
      // Tarayıcının kendi mini-infobar'ını engelle, kontrolü biz alalım.
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      // Sayfa otursun diye kısa gecikme (push bandı 2.5sn → genelde o önce açılır).
      window.setTimeout(() => {
        if (claim()) setMode("android")
      }, 4000)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)

    let iosTimer: number | undefined
    if (isIosSafari()) {
      iosTimer = window.setTimeout(() => {
        if (claim()) setMode("ios")
      }, 6000)
    }

    const onInstalled = () => {
      localStorage.setItem(DISMISS_KEY, "installed")
      setMode(null)
    }
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
      if (iosTimer) window.clearTimeout(iosTimer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "dismissed")
    setMode(null)
  }

  const install = async () => {
    if (!deferred) return
    setBusy(true)
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      localStorage.setItem(
        DISMISS_KEY,
        choice.outcome === "accepted" ? "installed" : "dismissed"
      )
      setDeferred(null)
      setMode(null)
    } finally {
      setBusy(false)
    }
  }

  if (!mode) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-ui-border-base shadow-2xl p-6 rounded-xl flex flex-col gap-y-4">
        <div className="flex items-start gap-x-3">
          <svg
            className="text-brand-600 w-6 h-6 flex-shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <div className="flex flex-col gap-y-1">
            <h4 className="font-bold text-ui-fg-base text-sm">
              {mode === "ios" ? t("iosTitle") : t("installTitle")}
            </h4>
            <p className="text-xs text-ui-fg-subtle leading-relaxed">
              {mode === "ios" ? t("iosBody") : t("installBody")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-3 text-xs font-semibold">
          <button
            onClick={dismiss}
            disabled={busy}
            className="px-4 py-2 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover rounded-md transition-colors"
          >
            {mode === "ios" ? t("gotIt") : t("dismiss")}
          </button>
          {mode === "android" && (
            <button
              onClick={install}
              disabled={busy}
              className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 rounded-md shadow-sm transition-colors disabled:opacity-60"
            >
              {busy ? "..." : t("installCta")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
