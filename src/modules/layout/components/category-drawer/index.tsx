"use client"

import { Fragment, useState } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { Menu, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "../country-select"
import LocaleSwitcher from "../locale-switcher"

// İkincil gezinme — eski üst menü/yan menüyle aynı kategorizasyon (navMenu.<key>).
// Kategoriler BİLEREK yok: zaten ana sayfada (mağaza filtreleri) listeleniyor.
type NavItem = { key: string; href: string; highlight?: boolean }
const MENU_GROUPS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "shop",
    items: [
      { key: "shopAll", href: "/store" },
      { key: "categories", href: "/kategoriler" },
      { key: "houseStore", href: "/satici" },
    ],
  },
  {
    titleKey: "info",
    items: [
      { key: "educationCenter", href: "/bilgi-merkezi" },
      { key: "blog", href: "/blog" },
      { key: "assistant", href: "/hazirlik-asistani" },
    ],
  },
  {
    titleKey: "experts",
    items: [
      { key: "findEngineer", href: "/uzmanlar" },
      { key: "havar", href: "/havar" },
    ],
  },
  {
    titleKey: "join",
    items: [
      { key: "becomeExpert", href: "/uzman-ol", highlight: true },
      { key: "becomeDealer", href: "/satici-ol", highlight: true },
      { key: "packages", href: "/uzman-paketleri" },
    ],
  },
]
const SINGLE_LINKS: NavItem[] = [
  { key: "trackOrder", href: "/siparis-takip" },
  { key: "faq", href: "/sikca-sorulan-sorular" },
  { key: "contact", href: "/iletisim" },
]

/**
 * CategoryDrawer — sağdan açılan tek menü şeridi (☰). İkincil gezinme
 * (Mağaza/Bilgi/Uzman/Katıl + yardım linkleri) + dil/ülke. Kategoriler ana
 * sayfada listelendiği için burada gösterilmez. `regions` Nav'da çekilip geçilir.
 */
export default function CategoryDrawer({
  regions,
}: {
  regions: HttpTypes.StoreRegion[] | null
}) {
  const t = useTranslations("drawer")
  const tNav = useTranslations("navMenu")
  const tSide = useTranslations("sideMenu")
  const countryToggleState = useToggleState()

  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      {/* Tetikleyici (☰) — üst barın en sağında */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-x-1.5 p-2 text-slate-700 hover:text-slate-900 transition-colors"
        data-testid="category-drawer-button"
      >
        <Menu className="w-6 h-6" />
        <span className="hidden small:inline text-sm font-semibold uppercase tracking-wide">
          {tSide("menu")}
        </span>
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={setOpen} className="relative z-[70]">
          {/* Arka plan karartma */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          </TransitionChild>

          {/* Sağ panel */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-y-0 right-0 flex max-w-full">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel
                  className="flex h-full w-screen max-w-sm flex-col bg-white shadow-2xl"
                  data-testid="category-drawer-panel"
                >
                  {/* Başlık */}
                  <div className="flex items-center justify-between bg-gradient-to-br from-brand-700 to-brand-900 px-5 py-4 text-white">
                    <DialogTitle className="text-base font-bold">{tSide("menu")}</DialogTitle>
                    <button
                      onClick={close}
                      aria-label={t("close")}
                      className="rounded-full p-1.5 transition-colors hover:bg-white/15"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* İçerik (kaydırılabilir) */}
                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="flex flex-col gap-6 px-5 py-4">
                      {MENU_GROUPS.map((group) => (
                        <div key={group.titleKey} className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {tNav(group.titleKey)}
                          </span>
                          <ul className="flex flex-col">
                            {group.items.map(({ key, href, highlight }) => (
                              <li key={key}>
                                <LocalizedClientLink
                                  href={href}
                                  onClick={close}
                                  className={
                                    "block py-1.5 text-sm transition-colors " +
                                    (highlight
                                      ? "font-semibold text-brand-700 hover:text-brand-800"
                                      : "text-slate-700 hover:text-brand-700")
                                  }
                                  data-testid={`drawer-${key}-link`}
                                >
                                  {tNav(key)}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      <ul className="flex flex-col border-t border-ui-border-base pt-3">
                        {SINGLE_LINKS.map(({ key, href }) => (
                          <li key={key}>
                            <LocalizedClientLink
                              href={href}
                              onClick={close}
                              className="block py-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700"
                              data-testid={`drawer-${key}-link`}
                            >
                              {tNav(key)}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Alt: dil + ülke + telif */}
                  <div className="flex flex-col gap-3 border-t border-ui-border-base bg-slate-50 px-5 py-4">
                    <LocaleSwitcher />
                    <div
                      className="flex items-center justify-between text-slate-600"
                      onClick={countryToggleState.toggle}
                    >
                      {regions && (
                        <CountrySelect toggleState={countryToggleState} regions={regions} />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {tSide("copyright", { year: new Date().getFullYear() })}
                    </p>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
