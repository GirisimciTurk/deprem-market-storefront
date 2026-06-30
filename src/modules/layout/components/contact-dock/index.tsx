"use client"

import React, { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import { Headset, X, Phone, PhoneCall, MessageCircle, Copy, Check } from "lucide-react"
import { clx } from "@modules/common/components/ui"
import AiMascot from "@modules/layout/components/ai-mascot"

// ── Geçici iletişim bilgileri ────────────────────────────────────────────────
// TODO: Gerçek çağrı merkezi numarasıyla değiştirin (şimdilik geçici).
const CALL_CENTER_DISPLAY = "0 (850) 123 45 67"
const CALL_CENTER_TEL = "+908501234567"
// TODO: Gerçek WhatsApp numarasıyla doğrulayın (whatsapp-button ile aynı).
const WHATSAPP_NUMBER = "905395741904"
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Merhaba, deprem hazırlık ürünleri hakkında bilgi almak istiyorum."
)}`

const COOKIE_KEY = "_deprem_market_cookie_consent"

/**
 * ContactDock — sağ-alt "speed-dial" iletişim merkezi.
 * Tek genel FAB (kulaklık/destek ikonu) → dokununca 3 öğe yelpazelenir:
 * Asistan (Depremzede sohbeti), WhatsApp, Çağrı Merkezi (numara kartı).
 * Önceki üç ayrı yüzen buton (WhatsApp + maskot) bu tek butonda toplanır.
 */
export default function ContactDock({
  countryCode,
  region,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion | null
}) {
  const t = useTranslations("dock")
  const tm = useTranslations("mascot")
  const pathname = usePathname()

  const [open, setOpen] = useState(false) // yelpaze menüsü
  const [phoneOpen, setPhoneOpen] = useState(false) // numara kartı
  const [chatOpen, setChatOpen] = useState(false) // maskot sohbeti
  const [bubble, setBubble] = useState(false) // ilk ziyaret karşılaması
  const [copied, setCopied] = useState(false)
  // Çerez bandı aynı köşeyi (sağ-alt) kaplıyor; karar verilene kadar FAB'ı gizle
  // ki "Kabul Et" butonunu örtmesin.
  const [cookieActive, setCookieActive] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const fanRef = useRef<HTMLDivElement>(null)
  const showTimerRef = useRef<number | null>(null)

  // Ürün detay sayfasında mobilde alt "Sepete ekle" çubuğu var; FAB'ı yukarı al.
  const isProductPage = /\/products\//.test(pathname || "")

  // Çerez kararı verilmeden FAB'ı gösterme; karar/yeniden-açılma olaylarını dinle.
  useEffect(() => {
    if (typeof window === "undefined") return
    let decided = true
    try {
      decided = !!window.localStorage.getItem(COOKIE_KEY)
    } catch {
      decided = true
    }
    setCookieActive(!decided)
    const onOpenSettings = () => setCookieActive(true)
    const onResolved = () => setCookieActive(false)
    window.addEventListener("open-cookie-settings", onOpenSettings)
    window.addEventListener("cookie-consent-resolved", onResolved)
    return () => {
      window.removeEventListener("open-cookie-settings", onOpenSettings)
      window.removeEventListener("cookie-consent-resolved", onResolved)
    }
  }, [])

  // Dışarı tıklama / Esc → menüyü ve numara kartını kapat.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setPhoneOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setPhoneOpen(false)
        fabRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Menü açılınca odağı ilk öğeye (Asistan) taşı → klavye kullanıcısı ileri Tab
  // ile yelpazeye ulaşsın (Esc odağı FAB'a döndürür: simetrik). Fare kullanıcıları
  // için :focus-visible sayesinde halka görünmez.
  useEffect(() => {
    if (!open) return
    fanRef.current?.querySelector<HTMLElement>("a,button")?.focus()
  }, [open])

  // Karşılama baloncuğu: oturumda bir kez, çerez kararı verildiyse (maskotun
  // eski davranışı korunur; artık dock üzerinden gösterilir).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.sessionStorage.getItem("dz_greeted")) return
    let cookieDecided = true
    try {
      cookieDecided = !!window.localStorage.getItem(COOKIE_KEY)
    } catch {
      cookieDecided = true
    }
    if (!cookieDecided) return
    showTimerRef.current = window.setTimeout(() => {
      // Kullanıcı bu arada etkileşime girdiyse (markGreeted) baloncuğu gösterme.
      if (window.sessionStorage.getItem("dz_greeted")) return
      setBubble(true)
    }, 1600)
    const hide = window.setTimeout(() => setBubble(false), 15000)
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current)
      window.clearTimeout(hide)
    }
  }, [])

  const markGreeted = () => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    try {
      window.sessionStorage.setItem("dz_greeted", "1")
    } catch {
      /* sessionStorage yoksa sessiz geç */
    }
  }

  const openChat = () => {
    setChatOpen(true)
    setOpen(false)
    setPhoneOpen(false)
    setBubble(false)
    markGreeted()
  }

  const toggleDock = () => {
    setBubble(false)
    markGreeted()
    setPhoneOpen(false) // her açılışta numara kartını sıfırla (kapanışta da zararsız)
    setOpen((v) => !v)
  }

  const copyNumber = async () => {
    try {
      await navigator.clipboard?.writeText(CALL_CENTER_DISPLAY)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* pano API yoksa sessiz geç — tel: linki yine çalışır */
    }
  }

  return (
    <>
      {/* Kontrollü maskot sohbet paneli (kendi launcher'ı gizli) */}
      <AiMascot
        countryCode={countryCode}
        region={region}
        open={chatOpen}
        onOpenChange={setChatOpen}
        hideLauncher
      />

      {/* Çerez bandı açıkken FAB'ı gizle (sağ-alt köşe çakışması). */}
      {!cookieActive && (
        <div
          ref={containerRef}
          className={clx(
            // z-[55]: çerez/push kartlarının (z-50) üstünde; açık sohbet paneli z-[60] üstte kalır.
            "fixed right-6 z-[55] flex flex-col items-end",
            isProductPage ? "bottom-28 small:bottom-6" : "bottom-6"
          )}
        >
          {/* Karşılama baloncuğu */}
          {bubble && !open && !chatOpen && (
            <div className="mb-3 max-w-[240px]">
              <div className="relative rounded-2xl rounded-br-md border border-ui-border-base bg-white px-4 py-3 text-sm leading-snug text-slate-800 shadow-xl">
                <button
                  onClick={() => {
                    setBubble(false)
                    markGreeted()
                  }}
                  aria-label={tm("closeAria")}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-ui-border-base bg-white text-slate-400 shadow hover:text-slate-700"
                >
                  <X className="h-3 w-3" />
                </button>
                {tm("bubble")}
                <button
                  onClick={openChat}
                  className="mt-2 flex items-center gap-1 text-xs font-bold text-brand-800 hover:text-brand-900"
                >
                  {tm("bubbleCta")}
                </button>
                <span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-ui-border-base bg-white" />
              </div>
            </div>
          )}

          {/* Açılan yığın (numara kartı + yelpaze): kısa/yatay ekranlarda taşmasın
              diye yükseklik sınırlı ve kaydırılabilir; FAB sabit kalır. */}
          <div className="flex max-h-[calc(100svh-7rem)] flex-col items-end overflow-y-auto">
            {/* Numara kartı (telefon öğesi açıkken) */}
            {open && phoneOpen && (
              <div className="mb-3 w-[230px] rounded-2xl border border-ui-border-base bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none">
                <div className="flex items-center gap-2 text-brand-800">
                  <PhoneCall className="h-4 w-4" />
                  <span className="text-sm font-bold">{t("phoneTitle")}</span>
                </div>
                <a
                  href={`tel:${CALL_CENTER_TEL}`}
                  className="mt-2 block text-center text-lg font-extrabold tracking-wide text-slate-900 hover:text-brand-700"
                >
                  {CALL_CENTER_DISPLAY}
                </a>
                <p className="mt-0.5 text-center text-[11px] text-ui-fg-muted">{t("phoneHours")}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${CALL_CENTER_TEL}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-800"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {t("callNow")}
                  </a>
                  <button
                    onClick={copyNumber}
                    aria-label={copied ? t("copied") : t("copy")}
                    className="flex items-center justify-center rounded-lg border border-ui-border-base px-3 py-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {/* Kopyalama sonucunu ekran okuyuculara duyur. */}
                <span className="sr-only" aria-live="polite">
                  {copied ? t("copied") : ""}
                </span>
              </div>
            )}

            {/* Yelpaze aksiyon öğeleri (yukarıdan aşağı: Asistan, WhatsApp, Telefon) */}
            <div ref={fanRef} className="mb-3 flex flex-col items-end gap-3" aria-hidden={!open}>
              <FanItem
                show={open}
                index={2}
                label={t("chat")}
                onClick={openChat}
                className="bg-gradient-to-br from-brand-600 to-brand-800 text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </FanItem>

              <FanItem
                show={open}
                index={1}
                label={t("whatsapp")}
                href={WHATSAPP_URL}
                onClick={() => {
                  setOpen(false)
                  setPhoneOpen(false)
                }}
                className="bg-[#25D366] text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </FanItem>

              <FanItem
                show={open}
                index={0}
                label={t("phone")}
                active={phoneOpen}
                onClick={() => setPhoneOpen((v) => !v)}
                className="bg-slate-800 text-white"
              >
                <Phone className="h-5 w-5" />
              </FanItem>
            </div>
          </div>

          {/* Ana FAB */}
          <button
            ref={fabRef}
            onClick={toggleDock}
            aria-expanded={open}
            aria-label={open ? t("closeAria") : t("openAria")}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-2xl ring-4 ring-white transition-transform duration-300 hover:scale-105"
          >
            {!open && (
              <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-20 motion-reduce:hidden" />
            )}
            <span className="relative z-10 flex items-center justify-center">
              {open ? <X className="h-7 w-7" /> : <Headset className="h-7 w-7" />}
            </span>
          </button>
        </div>
      )}
    </>
  )
}

// ── Tek yelpaze öğesi (etiket + yuvarlak mini buton). href varsa <a>. ─────────
function FanItem({
  show,
  index,
  label,
  href,
  onClick,
  active,
  className,
  children,
}: {
  show: boolean
  index: number
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  className?: string
  children: React.ReactNode
}) {
  // Açılırken aşağıdan yukarı kademeli; kapanırken anında topla.
  const style: React.CSSProperties = {
    transitionDelay: `${show ? index * 45 : 0}ms`,
    transform: show ? "translateY(0) scale(1)" : "translateY(12px) scale(0.6)",
    opacity: show ? 1 : 0,
  }

  const wrapper = clx(
    "flex items-center gap-2 transition-all duration-200 motion-reduce:transition-none",
    show ? "pointer-events-auto" : "pointer-events-none"
  )

  const inner = (
    <>
      <span className="pointer-events-none whitespace-nowrap rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white shadow-md">
        {label}
      </span>
      <span
        className={clx(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-xl ring-2 ring-white transition-transform duration-200 hover:scale-110 motion-reduce:transition-none",
          className
        )}
      >
        {children}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={onClick}
        tabIndex={show ? 0 : -1}
        className={wrapper}
        style={style}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      tabIndex={show ? 0 : -1}
      className={wrapper}
      style={style}
    >
      {inner}
    </button>
  )
}

// WhatsApp marka ikonu (inline SVG — whatsapp-button ile aynı path).
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.129 6.744 3.047 9.379L1.054 30.27a1 1 0 001.222 1.222l4.891-1.993A15.924 15.924 0 0016.004 32C24.826 32 32 24.824 32 16S24.826 0 16.004 0zm9.335 22.594c-.387 1.09-1.929 1.996-3.158 2.26-.84.18-1.937.322-5.631-1.21-4.725-1.959-7.763-6.748-7.998-7.062-.225-.314-1.893-2.521-1.893-4.81s1.197-3.413 1.623-3.879c.348-.383.924-.576 1.475-.576.178 0 .338.009.482.017.426.018.64.044.92.716.35.84 1.204 2.935 1.31 3.15.107.215.215.502.068.779-.138.283-.26.459-.476.709-.214.25-.42.44-.635.709-.195.234-.414.486-.178.912.236.42 1.05 1.732 2.254 2.808 1.549 1.383 2.854 1.813 3.26 2.012.308.15.674.126.918-.143.31-.348.693-.926 1.082-1.496.277-.406.625-.459.965-.314.344.138 2.18 1.028 2.555 1.215.375.188.625.281.717.437.09.155.09.902-.297 1.992z" />
    </svg>
  )
}
