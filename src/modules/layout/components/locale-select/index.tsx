"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"
import ReactCountryFlag from "react-country-flag"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useRef, useState, useTransition } from "react"
import { setUserLocale } from "@i18n/locale"
import { SUPPORTED_LOCALES, LOCALE_META, type AppLocale } from "@i18n/config"

/**
 * Kompakt header dil seçici — logo ile arama çubuğu arasında durur.
 * Aktif dilin bayrağı + kodu (▾) gösterir; açılınca TR/EN listesi çıkar.
 * Görüntü dilini değiştirir (NEXT_LOCALE çerezi + sayfa tazele); ülke/region'dan
 * bağımsız. Masaüstünde hover, mobilde tıklama ile açılır (DealerMenu ile aynı desen).
 */
export default function LocaleSelect() {
  const active = useLocale() as AppLocale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const openNow = () => setOpen(true)
  const close = () => setOpen(false)

  // Dışarı tıklayınca/dokununca kapat (mobil için; masaüstünde mouseleave da kapatır).
  useEffect(() => {
    if (!open) return
    const onDoc = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("touchstart", onDoc)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("touchstart", onDoc)
    }
  }, [open])

  const change = (locale: AppLocale) => {
    close()
    if (locale === active) return
    startTransition(async () => {
      await setUserLocale(locale)
      router.refresh()
    })
  }

  const activeMeta = LOCALE_META[active] ?? LOCALE_META[SUPPORTED_LOCALES[0]]

  return (
    <div
      ref={ref}
      className="h-full flex items-center shrink-0"
      onMouseEnter={openNow}
      onMouseLeave={close}
    >
      <Popover className="relative h-full flex items-center">
        <PopoverButton
          onClick={openNow}
          disabled={isPending}
          className="hover:text-ui-fg-base flex items-center gap-x-1.5 px-2 py-2 outline-none disabled:opacity-60"
          aria-label="Dil / Language"
          title="Dil / Language"
        >
          <ReactCountryFlag
            svg
            countryCode={activeMeta.flag}
            style={{ width: "18px", height: "18px", borderRadius: "2px" }}
            aria-label={activeMeta.label}
          />
          <span className="hidden small:inline text-sm font-medium text-slate-700 uppercase">
            {active}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </PopoverButton>

        <Transition
          show={open}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="absolute top-[calc(100%+1px)] left-0 z-50 w-44 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden text-ui-fg-base"
            data-testid="nav-locale-dropdown"
          >
            {SUPPORTED_LOCALES.map((locale) => {
              const meta = LOCALE_META[locale]
              const isActive = locale === active
              return (
                <button
                  key={locale}
                  type="button"
                  onClick={() => change(locale)}
                  disabled={isPending}
                  aria-pressed={isActive}
                  className={`w-full flex items-center gap-x-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                    isActive ? "bg-slate-50" : ""
                  }`}
                >
                  <ReactCountryFlag
                    svg
                    countryCode={meta.flag}
                    style={{ width: "18px", height: "18px", borderRadius: "2px" }}
                    aria-label={meta.label}
                  />
                  <span className="flex-1 text-sm font-medium text-slate-800">
                    {meta.label}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4 shrink-0 text-brand-600" />
                  )}
                </button>
              )
            })}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}
