"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HERO_SLIDES, type HeroSlide } from "./slides"

/** Otomatik geçiş aralığı (ms). */
const AUTOPLAY_MS = 5000
/** Dokunmatik kaydırmanın "geçiş" sayılması için gereken minimum mesafe (px). */
const SWIPE_THRESHOLD = 48

/**
 * Ana sayfa karşılama slider'ı — bağımlılıksız (saf CSS transform).
 * Otomatik geçer; üzerine gelince, odaklanınca ve sekme arka plandayken durur.
 * Ok tuşları, noktalar, dokunmatik kaydırma ve klavye ile gezilebilir;
 * `prefers-reduced-motion` açıksa otomatik geçiş yapılmaz.
 */
export default function HeroSlider({
  slides = HERO_SLIDES,
}: {
  slides?: HeroSlide[]
}) {
  const t = useTranslations("hero")
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const count = slides.length

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  )
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Hareket azaltma tercihi — otomatik geçişi kapatır.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  // Otomatik geçiş. Sekme gizlenince de durur (boşa sayaç çalışmasın).
  useEffect(() => {
    if (paused || reducedMotion || count < 2) return
    let id: ReturnType<typeof setInterval> | null = null
    const start = () => {
      stop()
      id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    }
    const stop = () => {
      if (id) clearInterval(id)
      id = null
    }
    const onVisibility = () =>
      document.visibilityState === "visible" ? start() : stop()
    start()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [paused, reducedMotion, count])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      next()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      prev()
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
    setPaused(true)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current
    touchStartX.current = null
    setPaused(false)
    if (startX == null) return
    const dx = (e.changedTouches[0]?.clientX ?? startX) - startX
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    dx < 0 ? next() : prev()
  }

  if (!count) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("title")}
      className="relative w-full overflow-hidden bg-slate-950 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      {/* Kayan şerit: mobilde görselin tamamı (16:9), geniş ekranda yükseklik sınırlı. */}
      <div
        className="flex aspect-[16/9] max-h-[70vh] w-full transition-transform duration-700 ease-out motion-reduce:transition-none lg:aspect-auto lg:h-[520px]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={i !== index}
            className="relative h-full w-full shrink-0"
          >
            {/* Ekran dışı slaytlar tembel yüklenirse ilk geçişte boş kare
                görünüyor; görseller küçük, hepsi peşin yüklenir. */}
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Alt gradyan + marka metni. Görsel baskın kalsın diye yalnız alt kenar. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent pt-24 pb-10 sm:pb-14">
        <div className="content-container flex flex-col items-start gap-y-2 sm:gap-y-3">
          <h2 className="max-w-5xl text-2xl font-black uppercase leading-tight tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-5xl">
            {t("sliderTitleLead")}
            <span className="block text-brand-300">{t("sliderTitleHighlight")}</span>
          </h2>
          <LocalizedClientLink
            href="/store"
            className="pointer-events-auto mt-1 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-brand-700 active:bg-brand-800"
          >
            {t("cta")}
          </LocalizedClientLink>
        </div>
      </div>

      {count > 1 && (
        <>
          {/* Oklar */}
          <button
            type="button"
            onClick={prev}
            aria-label={t("sliderPrev")}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5 sm:p-2.5"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("sliderNext")}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:p-2.5"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Noktalar */}
          <div
            role="tablist"
            aria-label={t("sliderDots")}
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-4"
          >
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t("sliderGoTo", { n: i + 1 })}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
