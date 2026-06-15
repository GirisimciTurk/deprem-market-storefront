import { getTranslations } from "next-intl/server"

// Footer ödeme/güven bandı: kart şeması logoları + SSL güvenli ödeme + (varsa) ETBİS.
//
// ETBİS: kayıt/doğrulama linki NEXT_PUBLIC_ETBIS_URL env'inde tanımlıysa GERÇEK
// rozet (linkli) gösterilir; yoksa hiç render edilmez. Kayıt olmadan "ETBİS
// Kayıtlı İşyeri" rozeti basmak yanlış yasal beyan olur → bilinçli gizli.
// Resmi ETBİS logosu gelince aşağıdaki metin rozeti <img> ile değiştirilebilir.
const ETBIS_URL = process.env.NEXT_PUBLIC_ETBIS_URL

// Ortak kart-logosu kabı (beyaz, kenarlıklı çip).
const Chip = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div
    aria-label={label}
    title={label}
    className="flex h-8 w-12 items-center justify-center rounded border border-ui-border-base bg-white"
  >
    {children}
  </div>
)

export default async function TrustBadges() {
  const t = await getTranslations("footer")

  return (
    <div className="border-t border-ui-border-base py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Ödeme yöntemleri */}
        <div className="flex flex-col gap-3 xsmall:flex-row xsmall:items-center xsmall:gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ui-fg-muted">
            {t("paymentMethods")}
          </span>
          <div className="flex items-center gap-2">
            <Chip label="Visa">
              <span className="text-[13px] font-bold italic tracking-tight text-[#1A1F71]">
                VISA
              </span>
            </Chip>
            <Chip label="Mastercard">
              <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden="true">
                <circle cx="11" cy="9" r="7" fill="#EB001B" />
                <circle cx="17" cy="9" r="7" fill="#F79E1B" fillOpacity="0.9" />
              </svg>
            </Chip>
            <Chip label="Troy">
              <span className="text-[13px] font-extrabold lowercase tracking-tight text-[#00B2A9]">
                troy
              </span>
            </Chip>
          </div>
        </div>

        {/* Güvenli ödeme + (varsa) ETBİS */}
        <div className="flex flex-col gap-3 xsmall:flex-row xsmall:items-center xsmall:gap-5">
          <span className="inline-flex items-center gap-1.5 text-xs text-ui-fg-subtle">
            <svg
              className="h-4 w-4 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            {t("securePayment")}
          </span>

          {ETBIS_URL && (
            <a
              href={ETBIS_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t("etbisLabel")}
              title={t("etbisLabel")}
              className="inline-flex items-center gap-1.5 rounded border border-ui-border-base bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ui-fg-base hover:border-brand-400 transition-colors"
            >
              <span className="font-bold tracking-wide text-brand-600">ETBİS</span>
              <span className="text-ui-fg-subtle">{t("etbisLabel")}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
