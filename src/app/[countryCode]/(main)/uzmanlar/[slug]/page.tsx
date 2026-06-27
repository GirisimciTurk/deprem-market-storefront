import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  MapPin,
  Briefcase,
  Phone,
  Mail,
  MessageCircle,
  BadgeCheck,
  ArrowLeft,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { toReachableImageUrl } from "@lib/util/image-url"
import { getExpert } from "@lib/data/experts"
import { specializationLabel, providerLabel } from "@lib/expert-config"
import VerifiedBadge from "@modules/experts/components/verified-badge"

type Params = Promise<{ countryCode: string; slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const expert = await getExpert(slug)
  if (!expert) {
    return { title: "Profil bulunamadı | Deprem Market" }
  }
  const loc = [expert.city, expert.district].filter(Boolean).join(", ")
  return {
    title: `${expert.full_name}${expert.title ? ` — ${expert.title}` : ""} | Deprem Market`,
    description:
      expert.about?.slice(0, 155) ||
      `${providerLabel(expert.provider_type)}${loc ? `, ${loc}` : ""}. Doğrulanmış profil.`,
  }
}

export default async function ExpertProfilePage({
  params,
}: {
  params: Params
}) {
  const { slug } = await params
  const expert = await getExpert(slug)
  if (!expert) notFound()

  const photo = toReachableImageUrl(expert.photo_url)
  const isImplementer = expert.provider_type === "implementer"
  const location = [expert.city, expert.district].filter(Boolean).join(" / ")
  const waDigits = expert.whatsapp?.replace(/[^0-9]/g, "")
  const hasContact = !!(expert.phone || waDigits || expert.email)

  return (
    <div className="content-container max-w-3xl py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <LocalizedClientLink
        href="/uzmanlar"
        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline font-semibold mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Dizine Dön
      </LocalizedClientLink>

      {/* Başlık kartı */}
      <div className="border border-ui-border-base rounded-2xl bg-ui-bg-base p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="shrink-0 w-24 h-24 rounded-2xl bg-ui-bg-subtle border border-ui-border-base overflow-hidden flex items-center justify-center">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={expert.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-extrabold text-ui-fg-muted">
                {expert.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-ui-fg-base tracking-tight">
                {expert.full_name}
              </h1>
              {expert.verified && <VerifiedBadge size="md" />}
            </div>
            {expert.title && (
              <p className="text-ui-fg-subtle text-sm mt-1">{expert.title}</p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mt-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isImplementer
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {isImplementer ? "🏗️" : "🧠"} {providerLabel(expert.provider_type)}
              </span>
              {expert.imo_member && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-ui-bg-subtle border border-ui-border-base text-ui-fg-subtle">
                  <BadgeCheck className="w-3.5 h-3.5 text-green-600" /> İMO Üyesi
                </span>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap mt-3 text-sm text-ui-fg-muted">
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
            </div>
          </div>
        </div>
      </div>

      {/* Hakkında */}
      {expert.about && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-ui-fg-base mb-2">Hakkında</h2>
          <p className="text-sm text-ui-fg-subtle leading-relaxed whitespace-pre-wrap">
            {expert.about}
          </p>
        </section>
      )}

      {/* Uzmanlık alanları */}
      {(expert.specializations?.length ?? 0) > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-ui-fg-base mb-2">
            {isImplementer ? "Uygulama Alanları" : "Uzmanlık Alanları"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {expert.specializations.map((s) => (
              <span
                key={s}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle"
              >
                {specializationLabel(s)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Hizmet bölgeleri */}
      {expert.service_areas && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-ui-fg-base mb-2">Hizmet Bölgeleri</h2>
          <p className="text-sm text-ui-fg-subtle">{expert.service_areas}</p>
        </section>
      )}

      {/* İletişim */}
      <section className="mt-8 border-t border-ui-border-base pt-6">
        <h2 className="text-base font-bold text-ui-fg-base mb-3">İletişim</h2>
        {hasContact ? (
          <div className="flex flex-wrap gap-3">
            {expert.phone && (
              <a
                href={`tel:${expert.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" /> {expert.phone}
              </a>
            )}
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {expert.email && (
              <a
                href={`mailto:${expert.email}`}
                className="inline-flex items-center gap-2 border border-ui-border-base bg-ui-bg-base hover:border-brand-400 text-ui-fg-base font-bold py-2.5 px-5 rounded-xl text-sm transition-colors"
              >
                <Mail className="w-4 h-4" /> E-posta
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-ui-fg-muted">
            Bu profil iletişim bilgilerini gizli tutuyor. Talep bırakma özelliği yakında
            eklenecek.
          </p>
        )}
      </section>

      {/* Güven notu */}
      <p className="mt-8 text-xs text-ui-fg-muted leading-relaxed border border-ui-border-base rounded-xl bg-ui-bg-subtle p-4">
        Bu profil Deprem Market tarafından belge incelemesiyle{" "}
        <strong className="text-ui-fg-subtle">doğrulanmıştır</strong>. Yine de
        sözleşme öncesi yetki belgelerini ve referansları teyit etmenizi öneririz.
      </p>
    </div>
  )
}
