"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"
import React from "react"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

// Inline SVG Icon components for premium feel
const HomeIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const HeartIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const StarIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ChatIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const BuildingIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="15" y1="22" x2="15" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <path d="M9 6h6" />
    <path d="M9 10h6" />
  </svg>
)

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  // Helper to determine if a route is active
  const isActive = (path: string) => {
    if (path === "/account") {
      return route === `/${countryCode}/account`
    }
    return (
      route === `/${countryCode}${path}` ||
      route.includes(`/${countryCode}${path}/`)
    )
  }

  return (
    <div>
      {/* Mobile Account Navigation */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-small-regular py-2 text-ui-fg-subtle hover:text-ui-fg-base"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>Hesap Paneli</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8 pt-4 border-t">
              Merhaba {customer?.first_name}
            </div>
            <div className="text-base-regular">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>Profil</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin size={20} />
                        <span>Adreslerim</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package size={20} />
                      <span>Siparişlerim</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/favorilerim"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                  >
                    <div className="flex items-center gap-x-2">
                      <HeartIcon size={20} />
                      <span>Favorilerim</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/yorumlarim"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                  >
                    <div className="flex items-center gap-x-2">
                      <StarIcon size={20} />
                      <span>Yorumlarım</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/mesajlarim"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                  >
                    <div className="flex items-center gap-x-2">
                      <ChatIcon size={20} />
                      <span>Mesajlarım</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/satici"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                  >
                    <div className="flex items-center gap-x-2">
                      <BuildingIcon size={20} />
                      <span>Satıcı Başvurum</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full text-brand-600"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>Çıkış Yap</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Desktop Account Navigation (Sidebar) */}
      <div className="hidden small:block w-full" data-testid="account-nav">
        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-2xl p-5 shadow-sm space-y-6">
          <div className="pb-3 border-b border-ui-border-base flex items-center gap-x-2">
            <span className="text-xl">👤</span>
            <div>
              <h3 className="font-extrabold text-ui-fg-base text-sm">
                Hesap Paneli
              </h3>
              <p className="text-2xs text-ui-fg-muted uppercase tracking-wider font-semibold">
                {customer?.first_name} {customer?.last_name}
              </p>
            </div>
          </div>

          <div className="text-sm">
            <ul className="flex flex-col gap-y-1">
              <li>
                <AccountNavLink
                  href="/account"
                  active={isActive("/account")}
                  icon={<HomeIcon size={18} />}
                >
                  Özet
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/profile"
                  active={isActive("/account/profile")}
                  icon={<User size={18} />}
                >
                  Profil
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/addresses"
                  active={isActive("/account/addresses")}
                  icon={<MapPin size={18} />}
                >
                  Adreslerim
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/orders"
                  active={isActive("/account/orders")}
                  icon={<Package size={18} />}
                >
                  Siparişlerim
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/favorilerim"
                  active={isActive("/account/favorilerim")}
                  icon={<HeartIcon size={18} />}
                >
                  Favorilerim
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/yorumlarim"
                  active={isActive("/account/yorumlarim")}
                  icon={<StarIcon size={18} />}
                >
                  Yorumlarım
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/mesajlarim"
                  active={isActive("/account/mesajlarim")}
                  icon={<ChatIcon size={18} />}
                >
                  Mesajlarım
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/satici"
                  active={isActive("/account/satici")}
                  icon={<BuildingIcon size={18} />}
                >
                  Satıcı Başvurum
                </AccountNavLink>
              </li>

              <li className="mt-4 pt-4 border-t border-ui-border-base">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-x-3 px-3 py-2.5 text-brand-600 hover:bg-brand-50 hover:text-brand-750 font-bold rounded-xl transition-all duration-200 text-left text-xs"
                >
                  <ArrowRightOnRectangle />
                  <span>Çıkış Yap</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}

const AccountNavLink = ({
  href,
  active,
  icon,
  children,
}: AccountNavLinkProps) => {
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "flex items-center gap-x-3 px-3 py-2.5 rounded-xl font-bold transition-all duration-200 text-xs w-full",
        {
          "bg-brand-600 text-white shadow-sm hover:bg-brand-700": active,
          "text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base":
            !active,
        }
      )}
    >
      <span
        className={clx("flex-shrink-0", {
          "text-white": active,
          "text-ui-fg-muted": !active,
        })}
      >
        {icon}
      </span>
      <span>{children}</span>
    </LocalizedClientLink>
  )
}

export default AccountNav
