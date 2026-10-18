import { Star } from "lucide-react"

/** 5 üzerinden puan: dolu/yarım/boş yıldızlar; puan yoksa hiçbir şey çizmez. */
export default function RatingStars({
  value,
  size = "sm",
}: {
  value: number
  size?: "sm" | "md"
}) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5"
  const rounded = Math.round(value * 2) / 2

  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`5 üzerinden ${value.toFixed(1)} puan`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0
        return (
          <span key={i} className={`relative ${cls}`}>
            <Star className={`absolute inset-0 ${cls} text-ui-border-base`} />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: fill === 1 ? "100%" : "50%" }}
              >
                <Star className={`${cls} fill-amber-400 text-amber-400`} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
