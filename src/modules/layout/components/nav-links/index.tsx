"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clx from "clsx"

export default function NavLinks({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  
  // Strip locale prefix (e.g. "/tr", "/en") from the pathname to make comparison easy
  const strippedPathname = pathname ? pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") : "/"

  const links = [
    {
      href: "/store",
      label: countryCode === "tr" ? "Mağaza" : "Store",
      active: strippedPathname === "/store" || strippedPathname.startsWith("/store/"),
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/collections/featured",
      label: countryCode === "tr" ? "Trend Ürünler" : "Trending",
      active: strippedPathname === "/collections/featured",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/bayilik-basvuru-formu",
      label: countryCode === "tr" ? "Bayilik Başvurusu" : "Reseller",
      active: strippedPathname === "/bayilik-basvuru-formu",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/siparis-takip",
      label: countryCode === "tr" ? "Sipariş Takip" : "Track Order",
      active: strippedPathname === "/siparis-takip",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30 text-red-600 font-bold",
      activeColorClass: "text-red-600 border-red-600 font-bold"
    },
    {
      href: "/sikca-sorulan-sorular",
      label: countryCode === "tr" ? "S.S.S." : "FAQ",
      active: strippedPathname === "/sikca-sorulan-sorular",
      colorClass: "hover:text-orange-600 hover:border-orange-600/30",
      activeColorClass: "text-orange-600 border-orange-600"
    },
    {
      href: "/iletisim",
      label: countryCode === "tr" ? "İletişim" : "Contact",
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
