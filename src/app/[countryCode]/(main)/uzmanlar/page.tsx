import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ENGINEER_SPECIALIZATIONS,
  IMPLEMENTER_SPECIALIZATIONS,
} from "@lib/expert-config"

export const metadata: Metadata = {
  title: "Uzman & Uygulayıcı Dizini — Doğrulanmış Mühendis ve Yükleniciler | Deprem Market",
  description:
    "İl/ilçe ve uzmanlık alanına göre doğrulanmış inşaat mühendislerini (tespit/proje) ve uygulayıcıları (güçlendirme/inşaat) bulun. Yakında.",
}

const STEPS = [
  {
    no: "1",
    title: "Ara & Filtrele",
    desc: "İl/ilçe ve uzmanlık/uygulama alanına göre size en yakın mühendis veya uygulayıcıyı listeleyin.",
  },
  {
    no: "2",
    title: "Doğrulanmışı Seçin",
    desc: "Belgesi incelenip onaylanmış “doğrulanmış” rozetli profilleri görün.",
  },
  {
    no: "3",
    title: "İletişime Geçin",
    desc: "Mühendisten tespit/proje, uygulayıcıdan sahada uygulama; ihtiyacınıza göre doğrudan ulaşın.",
  },
]

export default async function UzmanlarPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-6">
          Verified Engineer & Contractor Directory — Coming Soon
        </h1>
        <p className="text-ui-fg-subtle">
          A directory of verified civil engineers (assessment/design) and
          implementers/contractors (retrofitting/construction) is on the way.
        </p>
        <div className="pt-8">
          <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
            &larr; Return to Home Page
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-5xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" /> Yakında
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          Doğrulanmış Uzman & Uygulayıcı Dizini
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Deprem güvenliği için iki taraf: binayı değerlendirip projelendiren{" "}
          <strong>inşaat mühendisleri</strong> ve bu işi sahada uygulayan{" "}
          <strong>uygulayıcı/yükleniciler</strong>. İl/ilçe ve uzmanlık alanına
          göre, belgesi onaylanmış profilleri bulabileceğiniz dizin çok yakında.
        </p>
      </div>

      {/* Nasıl çalışacak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        {STEPS.map((s) => (
          <div key={s.no} className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold text-lg mb-4">
              {s.no}
            </span>
            <h3 className="font-bold text-ui-fg-base text-sm mb-1">{s.title}</h3>
            <p className="text-xs text-ui-fg-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* İki rol + uzmanlık önizleme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
        <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6">
          <h2 className="font-extrabold text-ui-fg-base text-base mb-1">
            🧠 İnşaat Mühendisi
          </h2>
          <p className="text-xs text-ui-fg-muted mb-4">
            Tespit, proje ve danışmanlık (beyin).
          </p>
          <div className="flex flex-wrap gap-2">
            {ENGINEER_SPECIALIZATIONS.map((s) => (
              <span key={s.key} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-base text-ui-fg-subtle">
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6">
          <h2 className="font-extrabold text-ui-fg-base text-base mb-1">
            🏗️ Uygulayıcı / Yüklenici
          </h2>
          <p className="text-xs text-ui-fg-muted mb-4">
            Fiziki inşaat & güçlendirme uygulaması (eller).
          </p>
          <div className="flex flex-wrap gap-2">
            {IMPLEMENTER_SPECIALIZATIONS.map((s) => (
              <span key={s.key} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-base text-ui-fg-subtle">
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA'lar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="border border-brand-100 bg-brand-50 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-extrabold text-ui-fg-base mb-1">
            İnşaat Mühendisi misiniz?
          </h2>
          <p className="text-sm text-ui-fg-muted mb-4">
            Dizine ön kayıt olun; doğrulanmış rozetiyle görünür olun.
          </p>
          <LocalizedClientLink
            href="/uzman-ol"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            Uzman Ön Kaydı →
          </LocalizedClientLink>
        </div>
        <div className="border border-brand-100 bg-brand-50 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-extrabold text-ui-fg-base mb-1">
            Uygulayıcı / Yüklenici misiniz?
          </h2>
          <p className="text-sm text-ui-fg-muted mb-4">
            Güçlendirme/inşaat işlerinde sahada yer alın.
          </p>
          <LocalizedClientLink
            href="/uygulayici-ol"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            Uygulayıcı Ön Kaydı →
          </LocalizedClientLink>
        </div>
      </div>

      <div className="pt-8 border-t mt-12">
        <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
