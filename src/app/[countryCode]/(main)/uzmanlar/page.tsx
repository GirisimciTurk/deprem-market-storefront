import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listExperts } from "@lib/data/experts"
import ExpertCard from "@modules/experts/components/expert-card"
import ExpertFilters from "@modules/experts/components/expert-filters"
import {
  ENGINEER_SPECIALIZATIONS,
  IMPLEMENTER_SPECIALIZATIONS,
} from "@lib/expert-config"

export const metadata: Metadata = {
  title:
    "Uzman & Uygulayıcı Dizini — Doğrulanmış Mühendis ve Yükleniciler | Deprem Market",
  description:
    "İl/ilçe ve uzmanlık alanına göre doğrulanmış inşaat mühendislerini (tespit/proje) ve uygulayıcıları (güçlendirme/inşaat) bulun.",
}

type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v

export default async function UzmanlarPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const isTr = (await getLocale()) === "tr"
  const sp = await searchParams

  const type = one(sp.type)
  const city = one(sp.city)
  const district = one(sp.district)
  const specialization = one(sp.specialization)
  const q = one(sp.q)
  const hasFilter = !!(type || city || district || specialization || q)

  const { experts, count } = await listExperts({
    type,
    city,
    district,
    specialization,
    q,
  })

  return (
    <div className="content-container max-w-6xl py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
          {isTr ? "Doğrulanmış Profiller" : "Verified Profiles"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          {isTr
            ? "Uzman & Uygulayıcı Dizini"
            : "Engineer & Contractor Directory"}
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          {isTr ? (
            <>
              Binayı değerlendirip projelendiren{" "}
              <strong>inşaat mühendisleri</strong> ve bu işi sahada uygulayan{" "}
              <strong>uygulayıcı/yükleniciler</strong>. İl/ilçe ve uzmanlık
              alanına göre, belgesi onaylanmış profilleri bulun.
            </>
          ) : (
            <>
              Verified civil engineers (assessment/design) and
              implementers/contractors (retrofitting/construction). Filter by
              location and specialization.
            </>
          )}
        </p>
      </div>

      {/* Filtreler */}
      <ExpertFilters />

      {/* Sonuçlar */}
      {experts.length > 0 ? (
        <>
          <p className="text-sm text-ui-fg-muted mb-4">
            {count} {isTr ? "profil bulundu" : "profiles found"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((e) => (
              <ExpertCard key={e.slug} expert={e} />
            ))}
          </div>
        </>
      ) : hasFilter ? (
        <div className="text-center py-16 border border-dashed border-ui-border-base rounded-2xl bg-ui-bg-subtle">
          <p className="text-ui-fg-base font-semibold mb-1">
            {isTr ? "Sonuç bulunamadı" : "No results found"}
          </p>
          <p className="text-sm text-ui-fg-muted">
            {isTr
              ? "Farklı bir il/ilçe veya uzmanlık alanı deneyin."
              : "Try a different location or specialization."}
          </p>
        </div>
      ) : (
        <EmptyDirectory isTr={isTr} />
      )}

      {/* Kayıt CTA'ları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-14">
        <div className="border border-brand-100 bg-brand-50 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-extrabold text-ui-fg-base mb-1">
            {isTr ? "İnşaat Mühendisi misiniz?" : "Are you a civil engineer?"}
          </h2>
          <p className="text-sm text-ui-fg-muted mb-4">
            {isTr
              ? "Dizine ön kayıt olun; doğrulanmış rozetiyle görünür olun."
              : "Pre-register; get listed with a verified badge."}
          </p>
          <LocalizedClientLink
            href="/uzman-ol"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            {isTr ? "Uzman Ön Kaydı →" : "Engineer Sign-up →"}
          </LocalizedClientLink>
        </div>
        <div className="border border-brand-100 bg-brand-50 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-extrabold text-ui-fg-base mb-1">
            {isTr
              ? "Uygulayıcı / Yüklenici misiniz?"
              : "Are you an implementer/contractor?"}
          </h2>
          <p className="text-sm text-ui-fg-muted mb-4">
            {isTr
              ? "Güçlendirme/inşaat işlerinde sahada yer alın."
              : "Get matched with retrofitting/construction jobs."}
          </p>
          <LocalizedClientLink
            href="/uygulayici-ol"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            {isTr ? "Uygulayıcı Ön Kaydı →" : "Implementer Sign-up →"}
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

/** Henüz yayınlanmış profil yokken gösterilen tanıtım (iki rol + uzmanlık önizleme). */
function EmptyDirectory({ isTr }: { isTr: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6">
        <h2 className="font-extrabold text-ui-fg-base text-base mb-1">
          🧠 {isTr ? "İnşaat Mühendisi" : "Civil Engineer"}
        </h2>
        <p className="text-xs text-ui-fg-muted mb-4">
          {isTr
            ? "Tespit, proje ve danışmanlık (beyin)."
            : "Assessment, design and consulting."}
        </p>
        <div className="flex flex-wrap gap-2">
          {ENGINEER_SPECIALIZATIONS.map((s) => (
            <span
              key={s.key}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-base text-ui-fg-subtle"
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6">
        <h2 className="font-extrabold text-ui-fg-base text-base mb-1">
          🏗️ {isTr ? "Uygulayıcı / Yüklenici" : "Implementer / Contractor"}
        </h2>
        <p className="text-xs text-ui-fg-muted mb-4">
          {isTr
            ? "Fiziki inşaat & güçlendirme uygulaması (eller)."
            : "Physical construction & retrofitting."}
        </p>
        <div className="flex flex-wrap gap-2">
          {IMPLEMENTER_SPECIALIZATIONS.map((s) => (
            <span
              key={s.key}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-base text-ui-fg-subtle"
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="md:col-span-2 text-center text-sm text-ui-fg-muted pt-2">
        {isTr
          ? "İlk doğrulanmış profiller çok yakında burada listelenecek."
          : "The first verified profiles will be listed here soon."}
      </div>
    </div>
  )
}
