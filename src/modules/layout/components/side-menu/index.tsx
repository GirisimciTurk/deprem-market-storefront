"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import { useTranslations } from "next-intl"
import CountrySelect from "../country-select"
import LocaleSwitcher from "../locale-switcher"

// Mobil menü — masaüstü üst menüyle aynı kategorizasyon (navMenu.<key>).
// key = navMenu çeviri anahtarı + stabil testid; href = hedef; highlight = CTA.
type MobileItem = { key: string; href: string; highlight?: boolean }
const MENU_GROUPS: { titleKey: string; items: MobileItem[] }[] = [
  {
    titleKey: "shop",
    items: [
      { key: "shopAll", href: "/store" },
      { key: "categories", href: "/kategoriler" },
      // Birinci-parti house mağazası (is_house) — backend HOUSE_HANDLE = "deprem-market".
      { key: "houseStore", href: "/satici/deprem-market" },
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
      { key: "becomeImplementer", href: "/uygulayici-ol", highlight: true },
      { key: "packages", href: "/uzman-paketleri" },
    ],
  },
]
// Tekil yardım linkleri (grupsuz, altta).
const SINGLE_LINKS: MobileItem[] = [
  { key: "trackOrder", href: "/siparis-takip" },
  { key: "faq", href: "/sikca-sorulan-sorular" },
  { key: "contact", href: "/iletisim" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  categories?: HttpTypes.StoreProductCategory[] | null
}

const SideMenu = ({ regions, categories }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const t = useTranslations("sideMenu")
  const tNav = useTranslations("navMenu")
  const tCat = useTranslations("categoryMenu")
  const topCategories = (categories ?? []).filter((c) => !c.parent_category)

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                >
                  {t("menu")}
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-[calc(100%-1rem)] pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-[51] inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        aria-label="Menüyü kapat"
                        className="p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        <XMark />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-7 py-4 pr-1">
                      <LocalizedClientLink
                        href="/"
                        className="text-2xl leading-9 hover:text-ui-fg-disabled"
                        onClick={close}
                        data-testid="home-link"
                      >
                        {t("items.home")}
                      </LocalizedClientLink>

                      {MENU_GROUPS.map((group) => (
                        <div key={group.titleKey} className="flex flex-col gap-3">
                          <span className="text-xs uppercase tracking-[0.15em] text-ui-fg-on-color/50">
                            {tNav(group.titleKey)}
                          </span>
                          <ul className="flex flex-col gap-3 items-start justify-start">
                            {group.items.map(({ key, href, highlight }) => (
                              <li key={key}>
                                <LocalizedClientLink
                                  href={href}
                                  className={clx(
                                    "text-xl leading-8 hover:text-ui-fg-disabled",
                                    highlight && "text-orange-300 font-semibold hover:text-orange-200"
                                  )}
                                  onClick={close}
                                  data-testid={`${key}-link`}
                                >
                                  {tNav(key)}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {topCategories.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <span className="text-xs uppercase tracking-[0.15em] text-ui-fg-on-color/50">
                            {tCat("heading")}
                          </span>
                          <ul className="flex flex-col gap-3 items-start">
                            {topCategories.map((cat) => (
                              <li key={cat.id}>
                                <LocalizedClientLink
                                  href={`/categories/${cat.handle}`}
                                  className="text-xl leading-8 hover:text-ui-fg-disabled"
                                  onClick={close}
                                  data-testid="side-category-link"
                                >
                                  {cat.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                            <li>
                              <LocalizedClientLink
                                href="/kategoriler"
                                className="text-base font-semibold text-orange-300 hover:text-orange-200"
                                onClick={close}
                                data-testid="side-all-categories-link"
                              >
                                {tCat("all")} →
                              </LocalizedClientLink>
                            </li>
                          </ul>
                        </div>
                      )}

                      <ul className="flex flex-col gap-3 items-start justify-start pt-2 border-t border-white/10">
                        {SINGLE_LINKS.map(({ key, href }) => (
                          <li key={key}>
                            <LocalizedClientLink
                              href={href}
                              className="text-base leading-7 text-ui-fg-on-color/80 hover:text-ui-fg-disabled"
                              onClick={close}
                              data-testid={`${key}-link`}
                            >
                              {tNav(key)}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-y-6">
                      <LocaleSwitcher />
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        {t("copyright", { year: new Date().getFullYear() })}
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
