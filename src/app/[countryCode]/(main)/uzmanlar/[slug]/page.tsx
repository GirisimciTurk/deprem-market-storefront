import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  MapPin,
  Briefcase,
  Phone,
  Mail,
  MessageCircle,
  BadgeCheck,
  Globe,
  Globe2,
  Landmark,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Breadcrumb from "@modules/common/components/breadcrumb"
import { BreadcrumbJsonLd } from "@modules/common/components/json-ld"
import { toReachableImageUrl } from "@lib/util/image-url"
import { getExpert, listExpertReviews, type Expert, type ExpertReview } from "@lib/data/experts"
import { specializationLabel, providerLabel } from "@lib/expert-config"
import { getBaseURL } from "@lib/util/env"
import { seoAlternates } from "@lib/util/seo"
import VerifiedBadge from "@modules/experts/components/verified-badge"
import ExpertAvatar from "@modules/experts/components/expert-avatar"
import RatingStars from "@modules/experts/components/rating-stars"
import ExpertRequestForm from "@modules/experts/components/request-form"
import ExpertReviewForm from "@modules/experts/components/review-form"
import { retrieveCustomer } from "@lib/data/customer"
import { listMyJobsWithExpert } from "@lib/data/service-requests"
import { getMyExpertReview } from "@lib/data/expert-requests"
import { getMyExpert } from "@lib/data/my-expert"

type Params = Promise<{ countryCode: string; slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const expert = await getExpert(slug)
  if (!expert) {
    return { title: "Profil bulunamadı", robots: { index: false } }
  }
  const loc = [expert.district, expert.city].filter(Boolean).join(", ")
  const role = expert.title || providerLabel(expert.provider_type)
  const photo = toReachableImageUrl(expert.photo_url)
  return {
    title: `${expert.full_name} — ${role}${expert.city ? `, ${expert.city}` : ""}`,
    description: (
      expert.headline ||
      expert.about ||
      `${role}${loc ? `, ${loc}` : ""}. Uzmanlık alanları: ${expert.specializations
        .map(specializationLabel)
        .join(", ")}.`
    ).slice(0, 160),
    alternates: seoAlternates(`/uzmanlar/${expert.slug}`),
    openGraph: {
      type: "profile",
      title: expert.full_name,
      description: expert.headline || role,
      images: photo ? [photo] : undefined,
    },
  }
}

export default async function ExpertProfilePage({
  params,
}: {
  params: Params
}) {
  const { countryCode, slug } = await params
  const [expert, { reviews, count: reviewCount }, customer, jobs, myReview, myCard] = await Promise.all([
    getExpert(slug),
    listExpertReviews(slug),
    retrieveCustomer().catch(() => null),
    listMyJobsWithExpert(slug).catch(() => []),
    getMyExpertReview(slug).catch(() => null),
    getMyExpert().catch(() => null),
  ])
  if (!expert) notFound()
  // Kendi kartına yorum yazılamaz; yorum yazmış olan da ikinciyi yazamaz.
  const isOwnCard = !!myCard && myCard.slug === expert.slug

  const isImplementer = expert.provider_type === "implementer"
  const location = [expert.district, expert.city].filter(Boolean).join(", ")
  // Ana il hizmet illeri arasında da geçebilir; iki kez göstermeyelim.
  const otherProvinces = (expert.service_regions ?? [])
    .map((r) => r.city)
    .filter((c) => c && c !== expert.city)
  const waDigits = expert.whatsapp?.replace(/[^0-9]/g, "")
  const hasContact = !!(expert.phone || waDigits || expert.email)
  const hasRating = expert.rating_count > 0 && expert.rating_avg != null
  const websiteHref = expert.website
    ? /^https?:\/\//i.test(expert.website)
      ? expert.website
      : `https://${expert.website}`
    : ""
  const baseUrl = getBaseURL()
  const pageUrl = `${baseUrl}/${countryCode}/uzmanlar/${expert.slug}`

  return (
    <div className="content-container max-w-5xl py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <ExpertJsonLd expert={expert} url={pageUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", url: `${baseUrl}/${countryCode}` },
          { name: "İnşaat Mühendisi Dizini", url: `${baseUrl}/${countryCode}/uzmanlar` },
          { name: expert.full_name, url: pageUrl },
        ]}
      />
      <Breadcrumb
        items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Uzman Dizini", href: "/uzmanlar" },
          { label: expert.full_name },
        ]}
      />

      {/* Başlık kartı */}
      <div className="mt-6 border border-ui-border-base rounded-2xl bg-ui-bg-base p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <ExpertAvatar name={expert.full_name} photoUrl={expert.photo_url} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ui-fg-base tracking-tight">
                {expert.full_name}
              </h1>
              {expert.verified && <VerifiedBadge size="md" />}
            </div>
            {expert.title && (
              <p className="text-ui-fg-subtle text-sm font-semibold mt-1">{expert.title}</p>
            )}
            {expert.headline && (
              <p className="text-ui-fg-subtle text-sm mt-2 leading-relaxed">{expert.headline}</p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mt-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isImplementer
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {providerLabel(expert.provider_type)}
              </span>
              {expert.imo_member && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-ui-bg-subtle border border-ui-border-base text-ui-fg-subtle">
                  <BadgeCheck className="w-3.5 h-3.5 text-green-600" /> İMO Üyesi
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 flex-wrap mt-3 text-sm text-ui-fg-muted">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {location}
                </span>
              )}
              {expert.experience_years != null && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {expert.experience_years} yıl deneyim
                </span>
              )}
              {hasRating && (
                <a href="#degerlendirmeler" className="inline-flex items-center gap-1.5 hover:text-brand-700">
                  <RatingStars value={expert.rating_avg!} />
                  <span className="font-semibold text-ui-fg-base">
                    {expert.rating_avg!.toFixed(1)}
                  </span>
                  <span>({expert.rating_count} değerlendirme)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        {/* Sol: profil içeriği */}
        <div className="min-w-0 space-y-8">
          {expert.about && (
            <section>
              <h2 className="text-base font-bold text-ui-fg-base mb-2">Hakkında</h2>
              <p className="text-sm text-ui-fg-subtle leading-relaxed whitespace-pre-wrap">
                {expert.about}
              </p>
            </section>
          )}

          {(expert.specializations?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-base font-bold text-ui-fg-base mb-2">
                {isImplementer ? "Uygulama Alanları" : "Uzmanlık Alanları"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {expert.specializations.map((s) => (
                  <LocalizedClientLink
                    key={s}
                    href={`/uzmanlar?specialization=${encodeURIComponent(s)}${
                      expert.city ? `&city=${encodeURIComponent(expert.city)}` : ""
                    }`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:border-brand-400 hover:text-brand-700 transition-colors"
                  >
                    {specializationLabel(s)}
                  </LocalizedClientLink>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-base font-bold text-ui-fg-base mb-2">Hizmet Bölgeleri</h2>
            {expert.nationwide ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-ui-fg-subtle">
                <Globe2 className="w-4 h-4 text-brand-600" /> Tüm Türkiye&apos;ye hizmet veriyor
                {expert.city && <span className="text-ui-fg-muted">(merkez: {expert.city})</span>}
              </p>
            ) : location || otherProvinces.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {location && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-brand-700">
                    <MapPin className="w-3.5 h-3.5" /> {location} (merkez)
                  </span>
                )}
                {otherProvinces.map((c) => (
                  <span
                    key={c}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ui-fg-muted">Hizmet bölgesi belirtilmemiş.</p>
            )}
          </section>

          {(expert.chamber || expert.registry_no) && (
            <section>
              <h2 className="text-base font-bold text-ui-fg-base mb-2">Mesleki Bilgiler</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {expert.chamber && (
                  <div className="rounded-xl border border-ui-border-base p-3">
                    <dt className="text-xs text-ui-fg-muted inline-flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5" /> Bağlı olduğu oda
                    </dt>
                    <dd className="font-semibold text-ui-fg-base mt-0.5">{expert.chamber}</dd>
                  </div>
                )}
                {expert.registry_no && (
                  <div className="rounded-xl border border-ui-border-base p-3">
                    <dt className="text-xs text-ui-fg-muted">Oda sicil no</dt>
                    <dd className="font-semibold text-ui-fg-base mt-0.5">{expert.registry_no}</dd>
                  </div>
                )}
              </dl>
              <p className="text-[0.7rem] text-ui-fg-muted mt-2">
                Oda ve sicil bilgisi uzmanın beyanıdır; ilgili odadan teyit edebilirsiniz.
              </p>
            </section>
          )}

          <Reviews
            reviews={reviews}
            count={reviewCount}
            ratingAvg={expert.rating_avg}
            ratingCount={expert.rating_count}
          >
            {isOwnCard ? (
              <p className="text-sm text-ui-fg-subtle border border-ui-border-base rounded-xl bg-ui-bg-subtle p-4">
                Bu sizin profiliniz. Gelen değerlendirmeleri{" "}
                <LocalizedClientLink
                  href="/account/uzman-profilim"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Uzman Profilim
                </LocalizedClientLink>{" "}
                sayfasından görüp yanıtlayabilirsiniz.
              </p>
            ) : myReview ? (
              <MyReview review={myReview} />
            ) : (
              <ExpertReviewForm
                slug={expert.slug}
                expertName={expert.full_name}
                signedIn={!!customer}
                defaultName={shortName(customer?.first_name, customer?.last_name)}
                jobs={jobs}
              />
            )}
          </Reviews>
        </div>

        {/* Sağ: iletişim (geniş ekranda yapışkan) */}
        <aside className="order-first lg:order-none lg:sticky lg:top-24 space-y-4">
          <section className="border border-ui-border-base rounded-2xl bg-ui-bg-base p-5">
            <h2 className="text-base font-bold text-ui-fg-base mb-3">İletişim</h2>
            {hasContact || websiteHref ? (
              <div className="flex flex-col gap-2">
                {expert.phone && (
                  <a
                    href={`tel:${expert.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" /> {expert.phone}
                  </a>
                )}
                {waDigits && (
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {expert.email && (
                  <a
                    href={`mailto:${expert.email}`}
                    className="inline-flex items-center justify-center gap-2 border border-ui-border-base bg-ui-bg-base hover:border-brand-400 text-ui-fg-base font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
                  >
                    <Mail className="w-4 h-4" /> E-posta
                  </a>
                )}
                {websiteHref && (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center justify-center gap-2 border border-ui-border-base bg-ui-bg-base hover:border-brand-400 text-ui-fg-base font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
                  >
                    <Globe className="w-4 h-4" /> Web sitesi
                  </a>
                )}
                <p className="text-xs text-ui-fg-muted mt-2">
                  Ulaşamadınız mı? Talebinizi bırakın, size dönsün:
                </p>
                <ExpertRequestForm slug={expert.slug} expertName={expert.full_name} />
              </div>
            ) : (
              <>
                <p className="text-sm text-ui-fg-subtle mb-4">
                  Bu uzman, doğrudan iletişim yerine talep almayı tercih ediyor.
                  Bilgilerinizi bırakın; size dönsün.
                </p>
                <ExpertRequestForm
                  slug={expert.slug}
                  expertName={expert.full_name}
                  defaultOpen
                />
              </>
            )}
          </section>

          <TrustNote verified={expert.verified} />
        </aside>
      </div>
    </div>
  )
}

/** Doğrulama durumuna göre dürüst güven notu. */
function TrustNote({ verified }: { verified: boolean }) {
  return verified ? (
    <div className="flex gap-3 text-xs text-ui-fg-muted leading-relaxed border border-green-200 rounded-xl bg-green-50/60 p-4">
      <ShieldCheck className="w-5 h-5 shrink-0 text-green-600" />
      <p>
        Bu profil depremTek Market tarafından belge incelemesiyle{" "}
        <strong className="text-ui-fg-subtle">doğrulanmıştır</strong>. Yine de
        sözleşme öncesi yetki belgelerini ve referansları teyit etmenizi öneririz.
      </p>
    </div>
  ) : (
    <div className="flex gap-3 text-xs text-ui-fg-muted leading-relaxed border border-ui-border-base rounded-xl bg-ui-bg-subtle p-4">
      <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
      <p>
        Bu profil henüz <strong className="text-ui-fg-subtle">doğrulanmadı</strong>;
        bilgiler uzmanın kendi beyanıdır. Çalışmadan önce diploma, oda kaydı ve
        yetki belgelerini mutlaka görün.
      </p>
    </div>
  )
}

/** Hesabın bu uzmana daha önce yazdığı değerlendirme: formun yerinde durur. */
function MyReview({ review }: { review: ExpertReview }) {
  return (
    <div className="border border-brand-200 bg-brand-50/50 rounded-xl p-4 text-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-semibold text-ui-fg-base">Değerlendirmeniz</span>
        <span className="inline-flex items-center gap-2">
          <RatingStars value={review.rating} />
          <span className="text-xs text-ui-fg-muted">{formatDate(review.created_at)}</span>
        </span>
      </div>
      {review.body && <p className="text-ui-fg-subtle mt-2 whitespace-pre-line">{review.body}</p>}
      <p className="text-xs text-ui-fg-muted mt-2">Her hesap bir uzmanı bir kez değerlendirebilir.</p>
    </div>
  )
}

function Reviews({
  reviews,
  count,
  ratingAvg,
  ratingCount,
  children,
}: {
  reviews: ExpertReview[]
  count: number
  ratingAvg: number | null
  ratingCount: number
  /** Değerlendirme yazma formu. */
  children?: React.ReactNode
}) {
  return (
    <section id="degerlendirmeler" className="scroll-mt-24">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-base font-bold text-ui-fg-base">Değerlendirmeler</h2>
        {ratingCount > 0 && ratingAvg != null && (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <RatingStars value={ratingAvg} size="md" />
            <span className="font-bold text-ui-fg-base">{ratingAvg.toFixed(1)}</span>
            <span className="text-ui-fg-muted">/ 5 · {ratingCount}</span>
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-ui-fg-muted border border-dashed border-ui-border-base rounded-xl p-4 text-center">
          {ratingCount > 0
            ? "Yazılı değerlendirme bulunmuyor."
            : "Bu uzman için henüz değerlendirme yok."}
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border border-ui-border-base rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-ui-fg-base truncate">
                    {r.author_name || "Anonim"}
                  </span>
                  {r.verified_job && (
                    <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      <BadgeCheck className="w-3 h-3" /> Doğrulanmış iş
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-ui-fg-muted">
                  <RatingStars value={r.rating} />
                  <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
                </div>
              </div>
              {r.body && (
                <p className="text-sm text-ui-fg-subtle mt-2 leading-relaxed whitespace-pre-wrap">
                  {r.body}
                </p>
              )}
              {r.reply && (
                <div className="mt-3 ml-3 pl-3 border-l-2 border-brand-200">
                  <p className="text-xs font-semibold text-brand-700">Uzmanın yanıtı</p>
                  <p className="text-sm text-ui-fg-subtle mt-0.5 whitespace-pre-wrap">{r.reply}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {count > reviews.length && (
        <p className="text-xs text-ui-fg-muted mt-3">
          En yeni {reviews.length} değerlendirme gösteriliyor (toplam {count}).
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** "Ayşe Kaya" → "Ayşe K.": yorumda tam soyadı varsayılan olarak açılmasın. */
function shortName(first?: string | null, last?: string | null) {
  const f = first?.trim() ?? ""
  const l = last?.trim() ?? ""
  return [f, l ? `${l.charAt(0).toLocaleUpperCase("tr")}.` : ""].filter(Boolean).join(" ")
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
}

/** schema.org Person: arama sonuçlarında ad, unvan, konum ve puan. */
function ExpertJsonLd({ expert, url }: { expert: Expert; url: string }) {
  const photo = toReachableImageUrl(expert.photo_url)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: expert.full_name,
    url,
    jobTitle: expert.title || providerLabel(expert.provider_type),
    ...(expert.headline || expert.about
      ? { description: (expert.headline || expert.about).slice(0, 300) }
      : {}),
    ...(photo ? { image: photo } : {}),
    ...(expert.city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: expert.district || expert.city,
            addressRegion: expert.city,
            addressCountry: "TR",
          },
        }
      : {}),
    knowsAbout: expert.specializations.map(specializationLabel),
    ...(expert.chamber ? { memberOf: { "@type": "Organization", name: expert.chamber } } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  )
}
