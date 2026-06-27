import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { Check, ShieldCheck } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { MEMBERSHIP_PLANS } from "@lib/expert-config"

export const metadata: Metadata = {
  title: "Üyelik Paketleri — Uzman & Uygulayıcı | Deprem Market",
  description:
    "İnşaat mühendisleri ve uygulayıcılar için üyelik paketleri: doğrulanmış dizin profili, öne çıkma ve daha fazlası. Beta döneminde ücretsiz.",
}

export default async function UzmanPaketleriPage() {
  const isTr = (await getLocale()) === "tr"

  return (
    <div className="content-container max-w-5xl py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          <ShieldCheck className="w-3.5 h-3.5" />{" "}
          {isTr ? "Üyelik Paketleri" : "Membership Plans"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          {isTr
            ? "Uzman & Uygulayıcı Üyelik Paketleri"
            : "Expert & Contractor Membership Plans"}
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          {isTr ? (
            <>
              Komisyon yok, gizli ücret yok — sadece üyelik. Doğrulanmış dizinde
              yer alın, talep alın. <strong>Beta döneminde tüm paketler ücretsiz.</strong>
            </>
          ) : (
            <>
              No commission, no hidden fees — membership only. Get listed in the
              verified directory and receive requests.{" "}
              <strong>All plans are free during the beta period.</strong>
            </>
          )}
        </p>
      </div>

      {/* Paketler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {MEMBERSHIP_PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl border p-6 sm:p-7 flex flex-col ${
              plan.featured
                ? "border-amber-300 ring-1 ring-amber-200 bg-amber-50/40"
                : "border-ui-border-base bg-ui-bg-base"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.66rem] font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-950 shadow-sm">
                ★ {isTr ? "ÖNERİLEN" : "RECOMMENDED"}
              </span>
            )}
            <h2 className="text-xl font-extrabold text-ui-fg-base">{plan.name}</h2>
            <p className="text-sm text-ui-fg-muted mt-1">{plan.tagline}</p>
            <div className="mt-4 mb-5">
              <span
                className={`text-lg font-extrabold ${
                  plan.featured ? "text-amber-700" : "text-brand-600"
                }`}
              >
                {plan.priceLabel}
              </span>
            </div>
            <ul className="space-y-2.5 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ui-fg-subtle">
                  <Check
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      plan.featured ? "text-amber-600" : "text-green-600"
                    }`}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <LocalizedClientLink
                href="/uzman-ol"
                className={`text-center font-bold py-2.5 px-3 rounded-xl text-sm transition-colors ${
                  plan.featured
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-brand-600 hover:bg-brand-700 text-white"
                }`}
              >
                {isTr ? "Uzman Ol" : "Engineer"}
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/uygulayici-ol"
                className="text-center font-bold py-2.5 px-3 rounded-xl text-sm border border-ui-border-base bg-ui-bg-base hover:border-brand-400 text-ui-fg-base transition-colors"
              >
                {isTr ? "Uygulayıcı Ol" : "Contractor"}
              </LocalizedClientLink>
            </div>
          </div>
        ))}
      </div>

      {/* Nasıl çalışır */}
      <div className="mt-14 border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8 max-w-3xl mx-auto">
        <h3 className="font-extrabold text-ui-fg-base text-base mb-4 text-center">
          {isTr ? "Nasıl Çalışır?" : "How it works"}
        </h3>
        <ol className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            isTr ? "Ön kayıt olun" : "Pre-register",
            isTr ? "Belgenizi yükleyin" : "Upload your documents",
            isTr ? "Ekip doğrulasın" : "We verify",
            isTr ? "Dizinde yayınlanın" : "Get published",
          ].map((step, i) => (
            <li key={i} className="text-center">
              <span className="flex items-center justify-center w-9 h-9 mx-auto rounded-full bg-brand-600 text-white font-extrabold text-sm mb-2">
                {i + 1}
              </span>
              <span className="text-xs text-ui-fg-subtle">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-xs text-ui-fg-muted mt-8 max-w-xl mx-auto">
        {isTr
          ? "Beta sonrası ücretlendirme öncesinde tüm üyelere bilgi verilecektir. Ücretli döneme geçişte mevcut üyeler için avantajlı koşullar sunulacaktır."
          : "Members will be notified before any pricing starts after the beta. Existing members will get favorable terms when paid plans launch."}
      </p>
    </div>
  )
}
