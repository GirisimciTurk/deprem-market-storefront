"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import {
  X,
  Send,
  ShoppingCart,
  Check,
  ShieldAlert,
  Lightbulb,
  Sparkles,
} from "lucide-react"
import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { askAssistant, type AssistantItem } from "@lib/data/assistant"
import { addMultipleToCart } from "@lib/data/cart"
import Mascot from "./mascot"

type ChatMsg = {
  id: string
  role: "user" | "assistant"
  content: string
  pending?: boolean
  items?: AssistantItem[]
  addAllToCart?: boolean
  recommendSurvey?: boolean
  surveyReason?: string
}

let _seq = 0
const uid = () => `dz${++_seq}_${Date.now()}`

export default function AiMascot({
  countryCode,
  region,
  open: openProp,
  onOpenChange,
  hideLauncher = false,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion | null
  /** Dışarıdan kontrol (örn. ContactDock). Verilmezse bileşen kendi durumunu tutar. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** true ise yüzen maskot butonu/baloncuğu render edilmez; yalnız kontrollü sohbet paneli. */
  hideLauncher?: boolean
}) {
  const t = useTranslations("mascot")
  const router = useRouter()
  const pathname = usePathname()

  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = (v: boolean) => {
    onOpenChange?.(v)
    if (openProp === undefined) setOpenState(v)
  }
  const [bubble, setBubble] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [addingAll, setAddingAll] = useState<string | null>(null)
  const [addedAll, setAddedAll] = useState<string | null>(null)
  const [addFailed, setAddFailed] = useState<string | null>(null)

  const seededRef = useRef(false)
  const messagesRef = useRef<ChatMsg[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Ürün detay sayfasında mobilde alt "Sepete ekle" çubuğu + yukarı kayan WhatsApp
  // butonu var; maskotu onların üstünde tut.
  const isProductPage = /\/products\//.test(pathname || "")

  // countryCode önekini at → backend'e bağlamsal "bulunulan sayfa" slug'ı.
  const slug = useMemo(() => {
    const parts = (pathname || "").split("/").filter(Boolean)
    return parts.slice(1).join("/")
  }, [pathname])

  // Karşılama baloncuğu: oturumda bir kez, kısa gecikmeyle. Çerez onayı henüz
  // verilmemişse (ilk ziyaret) baloncuğu GÖSTERME — çerez kartıyla (sağ-alt z-50)
  // aynı köşede çakışmasın; kullanıcı yine de maskota tıklayıp sohbeti açabilir.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (hideLauncher) return
    if (window.sessionStorage.getItem("dz_greeted")) return
    let cookieDecided = true
    try {
      cookieDecided = !!window.localStorage.getItem("_deprem_market_cookie_consent")
    } catch {
      cookieDecided = true
    }
    if (!cookieDecided) return
    const show = window.setTimeout(() => setBubble(true), 1400)
    const hide = window.setTimeout(() => setBubble(false), 15000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [hideLauncher])

  // Panel açılınca giriş alanına odaklan (klavye/erişilebilirlik).
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Yeni mesajda en alta kaydır.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  // Panel açıldığında (launcher'dan ya da dışarıdan kontrolle) karşılama
  // mesajını yalnızca bir kez tohumla.
  useEffect(() => {
    if (!open || seededRef.current) return
    seededRef.current = true
    setMessages([{ id: uid(), role: "assistant", content: t("greeting") }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const markGreeted = () => {
    try {
      window.sessionStorage.setItem("dz_greeted", "1")
    } catch {
      /* sessionStorage yoksa sessiz geç */
    }
  }

  const openPanel = () => {
    setOpen(true)
    setBubble(false)
    markGreeted()
  }

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!text || loading) return
    setInput("")

    const userMsg: ChatMsg = { id: uid(), role: "user", content: text }
    const pendingId = uid()
    // history = YALNIZ önceki turlar (mevcut mesaj `message` ile ayrı gider);
    // userMsg burada eklenmez → prompt'ta çift geçmesin (draftSellerReply konvansiyonu).
    const history = messagesRef.current
      .filter((m) => !m.pending && m.content)
      .map((m) => ({ role: m.role, content: m.content }))
      .slice(-12)

    setMessages((m) => [
      ...m,
      userMsg,
      { id: pendingId, role: "assistant", content: "", pending: true },
    ])
    setLoading(true)

    try {
      const res = await askAssistant({ message: text, history, path: slug, countryCode })
      setMessages((m) =>
        m.map((mm) =>
          mm.id === pendingId
            ? {
                id: pendingId,
                role: "assistant",
                content: res.reply || t("error"),
                items: res.items,
                addAllToCart: res.addAllToCart,
                recommendSurvey: res.recommendSurvey,
                surveyReason: res.surveyReason,
              }
            : mm
        )
      )
      if (res.navigateTo !== null) {
        const dest = `/${countryCode}${res.navigateTo ? "/" + res.navigateTo : ""}`
        window.setTimeout(() => router.push(dest), 850)
      }
    } catch {
      setMessages((m) =>
        m.map((mm) => (mm.id === pendingId ? { id: pendingId, role: "assistant", content: t("error") } : mm))
      )
    } finally {
      setLoading(false)
    }
  }

  const addAll = async (msg: ChatMsg) => {
    const lineItems = (msg.items ?? [])
      .filter((i) => i.product.variants?.[0]?.id)
      .map((i) => ({ variantId: i.product.variants![0].id!, quantity: i.quantity }))
    if (lineItems.length === 0) return
    setAddingAll(msg.id)
    setAddFailed(null)
    try {
      await addMultipleToCart({ items: lineItems, countryCode })
      setAddedAll(msg.id)
      window.setTimeout(() => setAddedAll(null), 2500)
    } catch {
      // addMultipleToCart bir kalemde hata verirse durur → sepet yarım kalmış
      // olabilir; sessizce yutma, kullanıcıya görünür uyarı ver.
      setAddFailed(msg.id)
      window.setTimeout(() => setAddFailed((cur) => (cur === msg.id ? null : cur)), 4000)
    } finally {
      setAddingAll(null)
    }
  }

  const suggestions = [
    t("suggestions.kit"),
    t("suggestions.bag"),
    t("suggestions.carbon"),
    t("suggestions.store"),
  ]

  // ── Açık panel ───────────────────────────────────────────────────────────
  if (open) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("name")}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
        className="fixed bottom-4 right-4 small:bottom-6 small:right-6 z-[60] flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-2xl h-[68vh] max-h-[560px]"
      >
        {/* Başlık */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-brand-700 to-brand-900 px-4 py-3 text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/40">
            <Mascot className="h-9 w-9 translate-y-0.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold leading-tight">{t("name")}</div>
            <div className="flex items-center gap-1 text-[11px] text-white/85">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {t("role")}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("closeAria")}
            className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mesajlar */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-3 py-4">
          {messages.map((m) => (
            <div key={m.id}>
              {/* Konuşma balonu */}
              <div className={clx("flex items-end gap-2", m.role === "user" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600/10">
                    <Mascot className="h-6 w-6 translate-y-0.5" />
                  </div>
                )}
                <div
                  className={clx(
                    "max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "rounded-br-md bg-brand-800 text-white"
                      : "rounded-bl-md border border-ui-border-base bg-white text-slate-800"
                  )}
                >
                  {m.pending ? (
                    <span className="flex items-center gap-1 py-1 text-slate-400">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-600 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-600 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-600" />
                    </span>
                  ) : (
                    m.content
                  )}
                </div>
              </div>

              {/* Yapısal güvenlik → keşif hizmeti */}
              {m.recommendSurvey && (
                <LocalizedClientLink
                  href="/hizmetler/karbon-fiber"
                  onClick={() => setOpen(false)}
                  className="mt-2 ml-9 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 transition-colors hover:bg-amber-100"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="text-xs">
                    <div className="font-semibold text-amber-900">{t("surveyTitle")}</div>
                    {m.surveyReason && <p className="mt-0.5 text-amber-800">{m.surveyReason}</p>}
                    <span className="mt-1 inline-block font-semibold text-amber-700">{t("surveyCta")} →</span>
                  </div>
                </LocalizedClientLink>
              )}

              {/* Önerilen ürün kartları */}
              {m.items && m.items.length > 0 && region && (
                <div className="mt-3 ml-9 space-y-3">
                  {m.addAllToCart && m.items.length > 1 && (
                    <>
                      <button
                        onClick={() => addAll(m)}
                        disabled={addingAll === m.id}
                        className={clx(
                          "inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50",
                          addedAll === m.id ? "bg-emerald-600" : "bg-brand-800 hover:bg-brand-900"
                        )}
                      >
                        {addedAll === m.id ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                        {addedAll === m.id
                          ? t("addedAll")
                          : addingAll === m.id
                          ? t("adding")
                          : t("addAll", { count: m.items.length })}
                      </button>
                      {addFailed === m.id && (
                        <p className="text-center text-[11px] font-medium text-rose-600">{t("addError")}</p>
                      )}
                    </>
                  )}
                  {m.items.map((item) => (
                    <div key={item.product.id} className="rounded-xl border border-ui-border-base bg-white p-2">
                      {item.reason && (
                        <div className="mb-1.5 flex items-start gap-1.5 px-1 text-[11px] text-slate-500">
                          <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
                          <span>
                            {item.reason}
                            {item.quantity > 1 && (
                              <span className="ml-1 font-semibold text-slate-700">
                                · {t("suggestedQty", { qty: item.quantity })}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <ProductPreview product={item.product} region={region} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* İlk açılışta öneri çipleri */}
          {messages.length <= 1 && !loading && (
            <div className="ml-9 flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-brand-600/40 bg-white px-3 py-1.5 text-xs font-medium text-brand-800 transition-colors hover:border-brand-600 hover:bg-brand-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Giriş */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 border-t border-ui-border-base bg-white px-3 py-2.5"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="min-w-0 flex-1 rounded-full border border-ui-border-base px-4 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            aria-label={t("inputPlaceholder")}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={t("send")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="bg-white px-3 pb-2 text-center text-[10px] leading-tight text-ui-fg-muted">
          {t("disclaimer")}
        </p>
      </div>
    )
  }

  // ── Kapalı: maskot butonu (+ karşılama baloncuğu) ────────────────────────
  // Dock modunda launcher dock tarafından sağlanır; burada hiçbir şey gösterme.
  if (hideLauncher) return null
  return (
    <div
      className={clx(
        // z-[55]: çerez/push kartlarının (z-50) ÜSTÜNDE tıklanabilir kalsın,
        // açık sohbet panelinin (z-[60]) ise altında.
        "fixed right-6 z-[55] flex flex-col items-end",
        isProductPage ? "bottom-44 small:bottom-24" : "bottom-24"
      )}
    >
      {/* Karşılama baloncuğu (maskotun üstünde) */}
      {bubble && (
        <div className="mb-3 max-w-[240px]">
          <div className="relative rounded-2xl rounded-br-md border border-ui-border-base bg-white px-4 py-3 text-sm leading-snug text-slate-800 shadow-xl">
            <button
              onClick={() => {
                setBubble(false)
                markGreeted()
              }}
              aria-label={t("closeAria")}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-ui-border-base bg-white text-slate-400 shadow hover:text-slate-700"
            >
              <X className="h-3 w-3" />
            </button>
            {t("bubble")}
            <button
              onClick={openPanel}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-brand-800 hover:text-brand-900"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("bubbleCta")}
            </button>
            {/* kuyruk */}
            <span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-ui-border-base bg-white" />
          </div>
        </div>
      )}

      {/* Maskot butonu */}
      <button
        onClick={openPanel}
        aria-label={t("openAria")}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl ring-4 ring-white transition-transform duration-300 hover:scale-105"
      >
        {/* Nabız parıltısı */}
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-25" />
        {/* Maskot */}
        <span className="relative z-10 flex h-[58px] w-[58px] items-end justify-center overflow-hidden rounded-full">
          <Mascot className="h-[60px] w-[60px] translate-y-1 transition-transform duration-300 group-hover:translate-y-0.5" />
        </span>
        {/* Sohbet rozeti */}
        <span className="absolute -right-0.5 -top-0.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
          AI
        </span>
      </button>
    </div>
  )
}
