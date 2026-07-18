"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { X, Volume2, VolumeX } from "lucide-react"

// Oturumda bir kez göster (aynı oturumda sayfa gezinince tekrar açılmaz).
const SHOWN_KEY = "_dm_promo_video_shown"

/**
 * Site açılışında bir kez çıkan tanıtım videosu popup'ı (merkez modal).
 * Video sessiz otomatik oynar (tarayıcı politikası); "Sesi aç" ile ses açılır.
 * Kapat / Esc / arka plana tıklama ile kapanır. Video same-origin
 * (/videos/tanitim.mp4) olduğu için CSP default-src 'self' ile uyumlu.
 */
const PromoVideoPopup = () => {
  const t = useTranslations("promoVideo")
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mount'ta: bu oturumda gösterilmediyse kısa gecikmeyle aç.
  useEffect(() => {
    if (typeof window === "undefined") return
    let shown = false
    try {
      shown = !!window.sessionStorage.getItem(SHOWN_KEY)
    } catch {
      shown = false
    }
    if (shown) return
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(SHOWN_KEY, "1")
      } catch {
        /* sessionStorage yoksa sessiz geç */
      }
      setOpen(true)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [])

  // Açıkken Esc ile kapat + arka plan kaydırmasını kilitle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = () => {
    videoRef.current?.pause()
    setOpen(false)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const next = !v.muted
    v.muted = next
    setMuted(next)
    // Sesi açmak bir kullanıcı jesti → oynatmayı garantiye al.
    if (!next) v.play().catch(() => {})
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative aspect-[9/16] w-full max-w-[min(92vw,calc(88vh*9/16))] overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src="/videos/tanitim.mp4"
          poster="/videos/tanitim-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Kapat */}
        <button
          onClick={close}
          aria-label={t("closeAria")}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Sesi aç / kapat */}
        <button
          onClick={toggleMute}
          aria-label={muted ? t("unmute") : t("mute")}
          className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/75"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? t("unmute") : t("mute")}
        </button>
      </div>
    </div>
  )
}

export default PromoVideoPopup
