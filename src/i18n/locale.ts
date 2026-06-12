"use server"

import { cookies } from "next/headers"
import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_COOKIE, type AppLocale } from "./config"

// Görüntüleme dili bir çerezde tutulur (ülke/Medusa region'dan bağımsız). Çerez
// yoksa varsayılan dile (tr) düşülür.
export async function getUserLocale(): Promise<AppLocale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE
}

export async function setUserLocale(locale: AppLocale): Promise<void> {
  ;(await cookies()).set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  })
}
