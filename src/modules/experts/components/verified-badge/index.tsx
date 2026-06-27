import { BadgeCheck } from "lucide-react"

/** "Doğrulanmış" rozeti — belgesi incelenip yayınlanmış profiller için. */
export default function VerifiedBadge({
  size = "sm",
}: {
  size?: "sm" | "md"
}) {
  const isMd = size === "md"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold ${
        isMd ? "text-xs px-2.5 py-1" : "text-[0.66rem] px-2 py-0.5"
      }`}
      title="Belgesi incelenip doğrulanmış profil"
    >
      <BadgeCheck className={isMd ? "w-3.5 h-3.5" : "w-3 h-3"} />
      Doğrulanmış
    </span>
  )
}
