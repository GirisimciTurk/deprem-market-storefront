"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clx from "clsx"

export default function NavLinks({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const t = useTranslations("navLinks")
  
  // Strip locale prefix (e.g. "/tr", "/en") from the pathname to make comparison easy
  const strippedPathname = pathname ? pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") : "/"

  const links = [
    {
      href: "/store",
      label: t("store"),
      active: strippedPathname === "/store" || strippedPathname.startsWith("/store/"),
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/collections/featured",
      label: t("trending"),
      active: strippedPathname === "/collections/featured",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/havar",
      label: t("havar"),
      active: strippedPathname === "/havar",
      colorClass: "hover:text-brandblue-700 hover:border-brandblue-700/30 text-brandblue-700 font-bold",
      activeColorClass: "text-brandblue-700 border-brandblue-700 font-bold"
    },
    {
      href: "/satici-ol",
      label: t("reseller"),
      active: strippedPathname === "/satici-ol",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/siparis-takip",
      label: t("trackOrder"),
      active: strippedPathname === "/siparis-takip",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30 text-brand-600 font-bold",
      activeColorClass: "text-brand-600 border-brand-600 font-bold"
    },
    {
      href: "/sikca-sorulan-sorular",
      label: t("faq"),
      active: strippedPathname === "/sikca-sorulan-sorular",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/iletisim",
      label: t("contact"),
      active: strippedPathname === "/iletisim",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/blog",
      label: "Blog",
      active: strippedPathname === "/blog" || strippedPathname.startsWith("/blog/"),
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    }
  ]

  return (
    <div className="hidden small:flex items-center gap-x-8 text-sm font-semibold tracking-wide text-slate-600 h-full">
      {links.map((link) => (
        <LocalizedClientLink
          key={link.href}
          href={link.href}
          className={clx(
            "flex items-center h-full border-b-2 transition-all duration-200 uppercase",
            link.active ? link.activeColorClass : clx("border-transparent", link.colorClass)
          )}
        >
          {link.label}
        </LocalizedClientLink>
      ))}
    </div>
  )
}
