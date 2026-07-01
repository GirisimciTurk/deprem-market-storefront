import { Suspense } from "react"
import { Building2, ShoppingCart } from "lucide-react"
import SearchModal from "@modules/layout/components/search-modal"

import { getTranslations } from "next-intl/server"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Logo from "@modules/layout/components/logo"
import FavoritesNavIcon from "@modules/layout/components/favorites-nav-icon"
import CategoryDrawer from "@modules/layout/components/category-drawer"
import DealerMenu from "@modules/layout/components/dealer-menu"
import LocaleSelect from "@modules/layout/components/locale-select"

export default async function Nav({ countryCode }: { countryCode: string }) {
  const [regions, customer, t] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    retrieveCustomer().catch(() => null),
    getTranslations("nav"),
  ])

  // Etiket: masaüstünde (≥small) ikon yanında metin; mobilde yalnız ikon.
  const labelCls =
    "hidden small:inline text-sm font-medium text-slate-700 whitespace-nowrap"

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-20 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center gap-x-2 small:gap-x-6 w-full h-full text-small-regular">
          {/* Sol: Logo */}
          <div className="flex items-center h-full shrink-0">
            <LocalizedClientLink
              href="/"
              data-testid="nav-store-link"
              className="hover:opacity-90 transition-opacity"
            >
              <Logo />
            </LocalizedClientLink>
          </div>

          {/* Logo ile arama arasında: dil seçici */}
          <div className="flex items-center h-full shrink-0">
            <LocaleSelect />
          </div>

          {/* Orta: büyük arama çubuğu (Amazon tarzı) */}
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="w-full max-w-lg">
              <SearchModal />
            </div>
          </div>

          {/* Sağ: temel aksiyonlar (etiketli) + tek menü (☰).
              Tüm kategori/bilgi/uzman gezinmesi CategoryDrawer'a taşındı. */}
          <div className="flex items-center gap-x-2 small:gap-x-5 h-full shrink-0">
            {/* Bayimiz ol açılır menüsü (Giriş Yap'ın solunda) */}
            <DealerMenu />

            {/* Firmamız ol — ayrı öğe (/firma-ol kurumsal başvuru) */}
            <LocalizedClientLink
              className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2"
              href="/firma-ol"
              title={t("firmaMenu")}
              aria-label={t("firmaMenu")}
            >
              <Building2 className="w-5 h-5 shrink-0 text-slate-700 hover:text-slate-900 transition-colors" />
              <span className={labelCls}>{t("firmaMenu")}</span>
            </LocalizedClientLink>

            <LocalizedClientLink
              className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2"
              href="/account"
              data-testid="nav-account-link"
              title={t("loginLabel")}
              aria-label={t("loginLabel")}
            >
              {/* Baretli kişi (afet/güvenlik temalı hesap ikonu) */}
              <svg
                className="w-5 h-5 shrink-0 text-slate-700 hover:text-slate-900 transition-colors"
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
              <span className={labelCls}>{t("loginLabel")}</span>
            </LocalizedClientLink>

            {/* Favoriler yalnızca giriş yapmış kullanıcıya gösterilir */}
            {customer && <FavoritesNavIcon label={t("favoritesLabel")} />}

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                  title={t("cartLabel")}
                  aria-label={t("cartLabel")}
                >
                  <ShoppingCart className="w-5 h-5 shrink-0 text-slate-700" />
                  <span className={labelCls}>{t("cartLabel")}</span>
                </LocalizedClientLink>
              }
            >
              <CartButton label={t("cartLabel")} />
            </Suspense>

            <CategoryDrawer regions={regions} />
          </div>
        </nav>
      </header>
    </div>
  )
}
