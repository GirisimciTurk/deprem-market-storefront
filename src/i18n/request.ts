import { getRequestConfig } from "next-intl/server"
import { getUserLocale } from "./locale"

// next-intl "URL routing'siz" mod: dil çerezden okunur, mesajlar locale'e göre yüklenir.
export default getRequestConfig(async () => {
  const locale = await getUserLocale()
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
