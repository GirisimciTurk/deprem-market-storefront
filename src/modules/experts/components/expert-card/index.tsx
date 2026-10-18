import { MapPin, Briefcase, Globe2, BadgeCheck, Star } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { specializationLabel } from "@lib/expert-config"
import type { Expert } from "@lib/data/experts"
import VerifiedBadge from "../verified-badge"
import ExpertAvatar from "../expert-avatar"

const MAX_SPECS = 3

// Dizin yalnız inşaat mühendislerini listelediği için kartta sağlayıcı tipi
// rozeti yok; tip profil sayfasında görünür.
export default function ExpertCard({ expert }: { expert: Expert }) {
  const location = [expert.district, expert.city].filter(Boolean).join(", ")
  const specs = expert.specializations ?? []
  const extraRegions = expert.nationwide ? 0 : expert.service_regions?.length ?? 0

  return (
    <LocalizedClientLink
      href={`/uzmanlar/${expert.slug}`}
      className="group flex flex-col h-full border rounded-2xl bg-ui-bg-base p-5 hover:shadow-md transition-all border-ui-border-base hover:border-brand-400"
    >
      <div className="flex items-start gap-4">
        <ExpertAvatar name={expert.full_name} photoUrl={expert.photo_url} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ui-fg-base text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {expert.full_name}
          </h3>
          {expert.title && (
            <p className="text-xs text-ui-fg-muted mt-0.5 truncate">{expert.title}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            {expert.verified && <VerifiedBadge />}
            {expert.imo_member && (
              <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold px-2 py-0.5 rounded-full bg-ui-bg-subtle border border-ui-border-base text-ui-fg-subtle">
                <BadgeCheck className="w-3 h-3 text-green-600" /> İMO
              </span>
            )}
          </div>
        </div>
      </div>

      {expert.headline && (
        <p className="mt-3 text-xs text-ui-fg-subtle leading-relaxed line-clamp-2">
          {expert.headline}
        </p>
      )}

      {specs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specs.slice(0, MAX_SPECS).map((s) => (
            <span
              key={s}
              className="text-[0.66rem] font-medium px-2 py-0.5 rounded-full border border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle"
            >
              {specializationLabel(s)}
            </span>
          ))}
          {specs.length > MAX_SPECS && (
            <span className="text-[0.66rem] text-ui-fg-muted px-1 py-0.5">
              +{specs.length - MAX_SPECS}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3">
        <div className="pt-3 border-t border-ui-border-base flex items-center justify-between gap-3 text-xs text-ui-fg-muted">
          <span className="inline-flex items-center gap-1 min-w-0">
            {expert.nationwide ? (
              <>
                <Globe2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {expert.city ? `${expert.city} · ` : ""}Tüm Türkiye
                </span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {location || "Konum belirtilmemiş"}
                  {extraRegions > 0 && ` +${extraRegions} il`}
                </span>
              </>
            )}
          </span>
          {expert.rating_count > 0 && expert.rating_avg != null ? (
            <span className="inline-flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-ui-fg-subtle">
                {expert.rating_avg.toFixed(1)}
              </span>
              <span>({expert.rating_count})</span>
            </span>
          ) : (
            expert.experience_years != null && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <Briefcase className="w-3.5 h-3.5" /> {expert.experience_years} yıl
              </span>
            )
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

