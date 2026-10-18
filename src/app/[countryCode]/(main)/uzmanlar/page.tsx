import { Metadata } from "next"
import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { ShieldCheck, FileSearch, MessageSquareText } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Breadcrumb from "@modules/common/components/breadcrumb"
import { BreadcrumbJsonLd } from "@modules/common/components/json-ld"
import { Pagination } from "@modules/store/components/pagination"
import { listExperts } from "@lib/data/experts"
import ExpertCard from "@modules/experts/components/expert-card"
import ExpertFilters from "@modules/experts/components/expert-filters"
import { ENGINEER_SPECIALIZATIONS, specializationLabel } from "@lib/expert-config"
import { getBaseURL } from "@lib/util/env"
import { findCity } from "@lib/util/tr-cities-districts"
import { seoAlternates } from "@lib/util/seo"

const PAGE_SIZE = 24

type Params = Promise<{ countryCode: string }>
type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() || undefined

function readFilters(sp: SP) {
  const page = Math.max(1, parseInt(one(sp.page) ?? "1", 10) || 1)
  return {
    // Eski bağlantılardaki "istanbul" gibi yazımlar başlıkta da düzgün görünsün.
    city: findCity(one(sp.city)) ?? one(sp.city),
    district: one(sp.district),
    specialization: one(sp.specialization),
    q: one(sp.q),
    page,
  }
}

/** "Kadıköy, İstanbul" + "Zemin Etüdü" gibi filtre özetinden başlık parçası. */
function filterHeading(f: ReturnType<typeof readFilters>) {
  const place = [f.district, f.city].filter(Boolean).join(", ")
  const spec = f.specialization ? specializationLabel(f.specialization) : ""
  return [place, spec].filter(Boolean).join(" · ")
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>
}): Promise<Metadata> {
  const f = readFilters(await searchParams)
  const heading = filterHeading(f)
  const title = heading
    ? `${heading} İnşaat Mühendisleri`
    : "İnşaat Mühendisi Dizini — Bölgenizdeki Mühendisler"

  return {
    title,
    description: heading
      ? `${heading} için inşaat mühendisleri: bina risk tespiti, güçlendirme projesi, zemin etüdü ve danışmanlık. Profilleri inceleyin, doğrudan ulaşın.`
      : "İl/ilçe ve uzmanlık alanına göre inşaat mühendislerini bulun: bina risk tespiti, güçlendirme projesi, zemin etüdü, kentsel dönüşüm danışmanlığı.",
    alternates: seoAlternates("/uzmanlar"),
    // Arama ve sayfa kombinasyonları ayrı sayfa olarak indekslenmesin.
    robots: f.q || f.page > 1 ? { index: false, follow: true } : undefined,
  }
}

export default async function UzmanlarPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Promise<SP>
}) {
  const [{ countryCode }, sp, locale] = await Promise.all([params, searchParams, getLocale()])
  const isTr = locale === "tr"
  const f = readFilters(sp)
  const hasFilter = !!(f.city || f.district || f.specialization || f.q)
  const heading = filterHeading(f)

  // Dizin yalnız inşaat mühendislerini (engineer) listeler. Uygulama/montaj işi
  // bayi (satıcı) üzerinden yürüdüğü için ayrı "uygulayıcı" listesi yoktur.
  const { experts, count } = await listExperts({
    type: "engineer",
    city: f.city,
    district: f.district,
    specialization: f.specialization,
    q: f.q,
    limit: PAGE_SIZE,
    offset: (f.page - 1) * PAGE_SIZE,
  })
  const totalPages = Math.ceil(count / PAGE_SIZE)
  const baseUrl = getBaseURL()

  return (
    <div className="content-container max-w-6xl py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", url: `${baseUrl}/${countryCode}` },
          { name: "İnşaat Mühendisi Dizini", url: `${baseUrl}/${countryCode}/uzmanlar` },
        ]}
      />
      <Breadcrumb
        items={[{ label: "Ana Sayfa", href: "/" }, { label: "Uzman Dizini" }]}
      />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mt-6 mb-8">
        <span className="inline-flex items-center gap-1.5 text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
          {isTr ? "Uzman Dizini" : "Expert Directory"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          {isTr ? "İnşaat Mühendisi Dizini" : "Civil Engineer Directory"}
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          {isTr ? (
            <>
              Binanızı değerlendirip projelendirecek <strong>inşaat mühendislerini</strong>{" "}
              il/ilçe ve uzmanlık alanına göre bulun; profilleri inceleyin,
              doğrudan ulaşın ya da talep bırakın.
            </>
          ) : (
            <>
              Find civil engineers for building assessment, retrofit design and
              consulting by location and specialization.
            </>
          )}
        </p>
      </div>

      <HowItWorks isTr={isTr} />

      {/* Filtreler (useSearchParams → Suspense sınırı) */}
      <Suspense fallback={<div className="h-36 mb-8 rounded-2xl bg-ui-bg-subtle animate-pulse" />}>
        <ExpertFilters />
      </Suspense>

      {/* Sonuçlar */}
      {experts.length > 0 ? (
        <>
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-sm text-ui-fg-muted">
              {heading && (
                <span className="font-semibold text-ui-fg-base">{heading}: </span>
              )}
              {count} {isTr ? "mühendis" : "engineers"}
              {totalPages > 1 && (
                <span>
                  {" "}
                  · {isTr ? "Sayfa" : "Page"} {f.page}/{totalPages}
                </span>
              )}
            </h2>
            <span className="hidden sm:inline text-xs text-ui-fg-muted">
              {isTr
                ? "Doğrulanmış profiller öne çıkarılır"
                : "Verified profiles are listed first"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((e) => (
              <ExpertCard key={e.slug} expert={e} />
            ))}
          </div>
          {totalPages > 1 && (
            <Suspense>
              <Pagination page={f.page} totalPages={totalPages} />
            </Suspense>
          )}
        </>
      ) : hasFilter || f.page > 1 ? (
        <div className="text-center py-16 border border-dashed border-ui-border-base rounded-2xl bg-ui-bg-subtle">
          <p className="text-ui-fg-base font-semibold mb-1">
            {isTr ? "Bu kriterlere uygun mühendis bulunamadı" : "No results found"}
          </p>
          <p className="text-sm text-ui-fg-muted mb-4">
            {isTr
              ? f.district
                ? "İlçe seçimini kaldırıp tüm ilde aramayı deneyin."
                : "Farklı bir il veya uzmanlık alanı deneyin."
              : "Try a different location or specialization."}
          </p>
          <LocalizedClientLink
            href="/uzmanlar"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {isTr ? "Tüm mühendisleri göster" : "Show all engineers"}
          </LocalizedClientLink>
        </div>
      ) : (
        <EmptyDirectory isTr={isTr} />
      )}

      {/* Kayıt CTA — yalnız mühendis. Uygulayıcılar bayi olarak katılır. */}
      <div className="max-w-2xl mx-auto mt-14">
        <div className="border border-brand-100 bg-brand-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-ui-fg-base mb-1">
              {isTr ? "İnşaat mühendisi misiniz?" : "Are you a civil engineer?"}
            </h2>
            <p className="text-sm text-ui-fg-muted">
              {isTr
                ? "Ücretsiz profil oluşturun; bölgenizdeki bina sahiplerinden talep alın. Belgelerinizi yükleyerek doğrulanmış rozeti kazanın."
                : "Create a free profile and receive requests from building owners in your area."}
            </p>
          </div>
          <LocalizedClientLink
            href="/uzman-ol"
            className="shrink-0 inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            {isTr ? "Profil Oluştur →" : "Create Profile →"}
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

/** Ziyaretçiye dizinin nasıl işlediğini 3 adımda anlatır. */
function HowItWorks({ isTr }: { isTr: boolean }) {
  const steps = isTr
    ? [
        { icon: FileSearch, title: "Bulun", text: "İl, ilçe ve uzmanlık alanına göre filtreleyin." },
        { icon: ShieldCheck, title: "İnceleyin", text: "Deneyim, oda kaydı, doğrulama ve değerlendirmelere bakın." },
        { icon: MessageSquareText, title: "Ulaşın", text: "Doğrudan arayın ya da talep bırakın; mühendis size dönsün." },
      ]
    : [
        { icon: FileSearch, title: "Find", text: "Filter by province, district and specialization." },
        { icon: ShieldCheck, title: "Review", text: "Check experience, chamber membership, verification and reviews." },
        { icon: MessageSquareText, title: "Contact", text: "Call directly or leave a request." },
      ]

  return (
    <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="flex items-start gap-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-3"
        >
          <span className="shrink-0 w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <s.icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ui-fg-base">
              {i + 1}. {s.title}
            </p>
            <p className="text-xs text-ui-fg-muted leading-relaxed">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Henüz yayınlanmış profil yokken gösterilen tanıtım (mühendis uzmanlık önizleme). */
function EmptyDirectory({ isTr }: { isTr: boolean }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6">
        <h2 className="font-extrabold text-ui-fg-base text-base mb-1">
          {isTr ? "İnşaat Mühendisi" : "Civil Engineer"}
        </h2>
        <p className="text-xs text-ui-fg-muted mb-4">
          {isTr
            ? "Tespit, proje ve danışmanlık."
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
      <div className="text-center text-sm text-ui-fg-muted pt-4">
        {isTr
          ? "İlk profiller çok yakında burada listelenecek."
          : "The first profiles will be listed here soon."}
      </div>
    </div>
  )
}
