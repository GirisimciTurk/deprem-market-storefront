import { MapPin, Briefcase } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { toReachableImageUrl } from "@lib/util/image-url"
import { specializationLabel, providerLabel } from "@lib/expert-config"
import type { Expert } from "@lib/data/experts"
import VerifiedBadge from "../verified-badge"

export default function ExpertCard({ expert }: { expert: Expert }) {
  const photo = toReachableImageUrl(expert.photo_url)
  const isImplementer = expert.provider_type === "implementer"
  const location = [expert.city, expert.district].filter(Boolean).join(" / ")

  return (
    <LocalizedClientLink
      href={`/uzmanlar/${expert.slug}`}
      className={`group block border rounded-2xl bg-ui-bg-base p-5 hover:shadow-md transition-all ${
        expert.featured
          ? "border-amber-300 ring-1 ring-amber-200 hover:border-amber-400"
          : "border-ui-border-base hover:border-brand-400"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-16 h-16 rounded-xl bg-ui-bg-subtle border border-ui-border-base overflow-hidden flex items-center justify-center">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={expert.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-ui-fg-muted">
              {expert.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-ui-fg-base text-sm truncate group-hover:text-brand-700 transition-colors">
              {expert.full_name}
            </h3>
            {expert.featured && (
              <span className="inline-flex items-center gap-0.5 text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ★ Öne Çıkan
              </span>
            )}
            {expert.verified && <VerifiedBadge />}
          </div>
          {expert.title && (
            <p className="text-xs text-ui-fg-muted mt-0.5 truncate">{expert.title}</p>
          )}
          <span
            className={`inline-block mt-1.5 text-[0.66rem] font-semibold px-2 py-0.5 rounded-full ${
              isImplementer
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {isImplementer ? "🏗️" : "🧠"} {providerLabel(expert.provider_type)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(expert.specializations ?? []).slice(0, 3).map((s) => (
          <span
            key={s}
            className="text-[0.66rem] font-medium px-2 py-0.5 rounded-full border border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle"
          >
            {specializationLabel(s)}
          </span>
        ))}
        {(expert.specializations?.length ?? 0) > 3 && (
          <span className="text-[0.66rem] text-ui-fg-muted px-1 py-0.5">
            +{(expert.specializations?.length ?? 0) - 3}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-ui-border-base flex items-center justify-between text-xs text-ui-fg-muted">
        <span className="inline-flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0" /> {location || "Konum belirtilmemiş"}
        </span>
        {expert.experience_years != null && (
          <span className="inline-flex items-center gap-1 shrink-0">
            <Briefcase className="w-3.5 h-3.5" /> {expert.experience_years} yıl
          </span>
        )}
      </div>
    </LocalizedClientLink>
  )
}
