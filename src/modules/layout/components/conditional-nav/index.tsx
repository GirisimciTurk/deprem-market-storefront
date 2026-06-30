"use client"

import React from "react"
import { usePathname } from "next/navigation"

/**
 * Üst başlığı (Nav) hesap sayfalarında gizler. Kullanıcı giriş yapınca hesap
 * paneline gelir; orada odaklı bir deneyim için tüm üst bar gizlenir. Diğer tüm
 * sayfalarda Nav normal gösterilir. (Nav sunucuda render edilir, burada yalnız
 * görünürlük kontrol edilir.)
 */
export default function ConditionalNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const onAccount = /^\/[a-z]{2}\/account(\/|$)/.test(pathname || "")
  if (onAccount) return null
  return <>{children}</>
}
