"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clx from "clsx"

type NavItem = {
  href: string
  label: string
  /** Vurgu (CTA) öğesi — Uzman Ol / Bayi Ol gibi. */
  highlight?: boolean
  /** Kısa açıklama (dropdown panelinde alt satır). */
  desc?: string
}

type NavGroup = {
  key: string
  label: string
  items: NavItem[]
}

/**
 * Masaüstü üst menü — PDF vizyonuna göre kategorize (Mağaza / Bilgi Merkezi /
 * Uzman & Hizmet / Platforma Katıl) açılır dropdown'lar + tekil yardım linkleri.
 * Dropdown davranışı category-menu deseniyle aynı (hover aç + tık + Escape).
 */
function NavDropdown({
  group,
  strippedPathname,
}: {
  group: NavGroup
  strippedPathname: string
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  useEffect(() => () => cancelClose(), [])

  const active = group.items.some(
    (i) => strippedPathname === i.href || strippedPathname.startsWith(i.href + "/")
  )

  return (
    <div
      className="relative flex items-center h-full"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
        className={clx(
          "flex items-center gap-x-1 h-full border-b-2 transition-all duration-200 uppercase text-sm font-semibold tracking-wide",
          open || active
            ? "text-orange-600 border-orange-600"
            : "border-transparent text-slate-600 hover:text-orange-600 hover:border-orange-600/30"
        )}
      >
        {group.label}
        <ChevronDown
          className={clx("w-4 h-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute top-full left-0 z-[60] w-[min(92vw,300px)] rounded-b-lg border border-ui-border-base bg-white shadow-xl p-3"
        >
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const isActive =
                strippedPathname === item.href ||
                strippedPathname.startsWith(item.href + "/")
              return (
                <li key={item.href}>
                  <LocalizedClientLink
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={clx(
                      "block rounded-lg px-3 py-2 transition-colors",
                      item.highlight
                        ? "bg-brand-50 hover:bg-brand-100"
                        : "hover:bg-ui-bg-subtle",
                      isActive && "bg-ui-bg-subtle"
                    )}
                  >
                    <span
                      className={clx(
                        "block text-sm font-semibold normal-case",
                        item.highlight ? "text-brand-700" : "text-slate-800"
                      )}
                    >
                      {item.label}
                    </span>
                    {item.desc && (
                      <span className="block text-xs text-slate-500 normal-case mt-0.5">
                        {item.desc}
                      </span>
                    )}
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function NavLinks({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const t = useTranslations("navMenu")

  // Strip locale prefix (e.g. "/tr", "/en") from the pathname for active matching.
  const strippedPathname = pathname ? pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") : "/"

  const groups: NavGroup[] = [
    {
      key: "shop",
      label: t("shop"),
      items: [
        { href: "/store", label: t("shopAll") },
        { href: "/kategoriler", label: t("categories") },
        { href: "/satici/deprem-market", label: t("houseStore") },
      ],
    },
    {
      key: "info",
      label: t("info"),
      items: [
        { href: "/blog", label: t("blog") },
        { href: "/hazirlik-asistani", label: t("assistant") },
      ],
    },
    {
      key: "experts",
      label: t("experts"),
      items: [
        { href: "/uzmanlar", label: t("findEngineer"), desc: t("findEngineerDesc") },
        { href: "/havar", label: t("havar") },
      ],
    },
    {
      key: "join",
      label: t("join"),
      items: [
        {
          href: "/uzman-ol",
          label: t("becomeExpert"),
          desc: t("becomeExpertDesc"),
          highlight: true,
        },
        {
          href: "/uygulayici-ol",
          label: t("becomeImplementer"),
          desc: t("becomeImplementerDesc"),
          highlight: true,
        },
      ],
    },
  ]

  // Tekil (dropdown'sız) yardım linkleri.
  const singles: { href: string; label: string; emphasis?: boolean }[] = [
    { href: "/siparis-takip", label: t("trackOrder"), emphasis: true },
    { href: "/sikca-sorulan-sorular", label: t("faq") },
    { href: "/iletisim", label: t("contact") },
  ]

  return (
    <div className="hidden small:flex items-center gap-x-6 text-sm font-semibold tracking-wide text-slate-600 h-full">
      {groups.map((g) => (
        <NavDropdown key={g.key} group={g} strippedPathname={strippedPathname} />
      ))}
      {singles.map((s) => {
        const active = strippedPathname === s.href
        return (
          <LocalizedClientLink
            key={s.href}
            href={s.href}
            className={clx(
              "flex items-center h-full border-b-2 transition-all duration-200 uppercase",
              active
                ? "text-orange-600 border-orange-600"
                : clx(
                    "border-transparent hover:text-orange-600 hover:border-orange-600/30",
                    s.emphasis && "text-brand-600 font-bold"
                  )
            )}
          >
            {s.label}
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
