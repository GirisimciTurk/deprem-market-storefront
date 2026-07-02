"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { ChevronDown, Handshake, Search, Store } from "lucide-react"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment, useEffect, useRef, useState } from "react"

/**
 * Header "Bayimiz ol" açılır menüsü — hesap (Giriş Yap) bağlantısının soluna
 * yerleşir. Masaüstünde hover, mobilde tıklama ile açılır.
 * Üstte "Bayimiz ol" (/satici-ol başvuru formu), altta "Bayi bul" (/satici
 * bayi mağazaları). cart-dropdown ile aynı Popover/hover desenini kullanır.
 */
export default function DealerMenu() {
  const t = useTranslations("nav")
  const label = t("dealerMenu")
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

  return (
    <div
      ref={ref}
      className="h-full flex items-center"
      onMouseEnter={openNow}
      onMouseLeave={close}
    >
      <Popover className="relative h-full flex items-center">
        <PopoverButton
          onClick={openNow}
          className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2 outline-none"
          aria-label={label}
          title={label}
        >
          <Store className="w-5 h-5 shrink-0 text-slate-700 hover:text-slate-900 transition-colors" />
          <span className="hidden small:inline text-sm font-medium text-slate-700 whitespace-nowrap">
            {label}
          </span>
          <ChevronDown
            className={`hidden small:inline w-3.5 h-3.5 shrink-0 text-slate-500 transition-transform ${
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
            className="absolute top-[calc(100%+1px)] right-0 small:right-auto small:left-0 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden text-ui-fg-base"
            data-testid="nav-dealer-dropdown"
          >
            <LocalizedClientLink
              href="/satici-ol"
              onClick={close}
              className="flex items-start gap-x-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <Handshake className="w-5 h-5 shrink-0 text-brand-600 mt-0.5" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {t("dealerJoin")}
                </span>
                <span className="text-xs text-ui-fg-subtle">
                  {t("dealerJoinDesc")}
                </span>
              </span>
            </LocalizedClientLink>

            <div className="h-px bg-gray-100" />

            <LocalizedClientLink
              href="/satici"
              onClick={close}
              className="flex items-start gap-x-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <Search className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {t("dealerFind")}
                </span>
                <span className="text-xs text-ui-fg-subtle">
                  {t("dealerFindDesc")}
                </span>
              </span>
            </LocalizedClientLink>
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}
