"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  /**
   * loginGate namespace'indeki mesaj anahtarı. Dar (compact) yerleşimde
   * "<key>Inline" varyantı kullanılır — cümlenin tamamı (bağlantı ve noktalama
   * dahil) çeviri dosyasında durur, JSX'te parçalanmaz.
   */
  messageKey: "favorite" | "stockAlert"
  /**
   * Dar alan (ürün kartı, mobil yapışkan çubuk): tek satır + satır içi bağlantı.
   * Blok CTA burada kart yüksekliğini şişirip ızgara satırını zıplatıyor.
   */
  compact?: boolean
}

/**
 * "Bunun için giriş yapmanız gerekiyor" uyarısı — favori kalbi ve "stoğa gelince
 * haber ver" butonu AYNI bileşeni kullanır ki iki farklı görsel dil oluşmasın.
 *
 * Giriş bağlantısı, kullanıcının o an baktığı yolu `?redirect=` ile taşır:
 * eskiden giriş sonrası hesap panelinde kalınıyor, kullanıcının niyeti
 * (favoriye ekle / haber ver) tamamen kayboluyordu. Yol sunucu tarafında
 * `safeInternalPath` ile doğrulanır (açık yönlendirme koruması).
 */
const LoginHint = ({ messageKey, compact = false }: Props) => {
  const t = useTranslations("loginGate")
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.toString()
  const returnTo = query ? `${pathname}?${query}` : pathname
  // LocalizedClientLink başa /{countryCode} ekler; returnTo zaten ülke kodunu
  // içerdiği için yalnız /account kısmı gönderilir.
  const href = `/account?redirect=${encodeURIComponent(returnTo)}`

  if (compact) {
    return (
      <p>
        {t.rich(`${messageKey}Inline`, {
          link: (chunks) => (
            <LocalizedClientLink
              href={href}
              className="font-bold text-brand-700 underline underline-offset-2"
            >
              {chunks}
            </LocalizedClientLink>
          ),
        })}
      </p>
    )
  }

  return (
    <>
      <p>{t(messageKey)}</p>
      <LocalizedClientLink
        href={href}
        className="mt-2 block rounded-md bg-brand-600 px-2 py-1.5 text-center text-xs font-bold text-white transition-colors hover:bg-brand-700"
      >
        {t("cta")}
      </LocalizedClientLink>
    </>
  )
}

export default LoginHint
