"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/navigation"
import { setUserLocale } from "@i18n/locale"
import { SUPPORTED_LOCALES, LOCALE_META, type AppLocale } from "@i18n/config"
import { clx } from "@modules/common/components/ui"

// Görüntüleme dilini değiştirir (çerez + sayfayı tazele). Ülke/region'dan bağımsız.
const LocaleSwitcher = () => {
  const active = useLocale()
  const t = useTranslations("common")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const change = (locale: AppLocale) => {
    if (locale === active) return
    startTransition(async () => {
      await setUserLocale(locale)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-between txt-compact-small">
      <span>{t("language")}</span>
      <div className="flex items-center gap-x-3">
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => change(locale)}
            disabled={isPending}
            aria-pressed={locale === active}
            title={LOCALE_META[locale].label}
            className={clx(
              "flex items-center gap-x-1.5 transition-opacity",
              locale === active ? "opacity-100 font-semibold" : "opacity-60 hover:opacity-90"
            )}
          >
            <ReactCountryFlag
              svg
              countryCode={LOCALE_META[locale].flag}
              style={{ width: "16px", height: "16px" }}
            />
            <span className="uppercase">{locale}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LocaleSwitcher
