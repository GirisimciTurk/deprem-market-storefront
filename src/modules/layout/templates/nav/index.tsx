import { Suspense } from "react"
import { Backpack } from "lucide-react"
import SearchModal from "@modules/layout/components/search-modal"

import { getTranslations } from "next-intl/server"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Logo from "@modules/layout/components/logo"
import FavoritesNavIcon from "@modules/layout/components/favorites-nav-icon"
import NavLinks from "@modules/layout/components/nav-links"

export default async function Nav({ countryCode }: { countryCode: string }) {
  const [regions, t] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    getTranslations("nav"),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          
          {/* Left: Mobile Menu Trigger / Desktop Logo */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="block small:hidden">
              <SideMenu regions={regions} />
            </div>
            <div className="hidden small:block">
              <LocalizedClientLink
                href="/"
                data-testid="nav-store-link"
                className="hover:opacity-90 transition-opacity"
              >
                <Logo />
              </LocalizedClientLink>
            </div>
          </div>

          {/* Center: Mobile Logo / Desktop Horizontal Menu */}
          <div className="flex items-center h-full">
            <div className="block small:hidden">
              <LocalizedClientLink
                href="/"
                data-testid="nav-store-link"
                className="hover:opacity-90 transition-opacity"
              >
                <Logo />
              </LocalizedClientLink>
            </div>

            <NavLinks countryCode={countryCode} />
          </div>

          {/* Right: User actions & Cart */}
          <div className="flex items-center gap-x-4 small:gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="flex items-center gap-x-4 small:gap-x-6 h-full">
              <SearchModal />
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex items-center justify-center p-2"
                href="/account"
                data-testid="nav-account-link"
                title={t("account")}
                aria-label={t("account")}
              >
                {/* Baretli kişi (afet/güvenlik temalı hesap ikonu) */}
                <svg
                  className="w-5 h-5 text-slate-700 hover:text-slate-900 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {/* baş */}
                  <circle cx="12" cy="11.5" r="3.3" />
                  {/* baret siperi (geniş) */}
                  <path d="M6.5 8.2h11" />
                  {/* baret kubbesi */}
                  <path d="M9 8.2a3 3 0 0 1 6 0" />
                  {/* omuzlar */}
                  <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
                </svg>
              </LocalizedClientLink>
              <FavoritesNavIcon />
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                  title={t("cart")}
                  aria-label={t("cart")}
                >
                  <Backpack className="w-5 h-5 text-slate-700" />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>

        </nav>
      </header>
    </div>
  )
}
