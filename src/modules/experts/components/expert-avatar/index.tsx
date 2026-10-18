import { toReachableImageUrl } from "@lib/util/image-url"

/** Uzman fotoğrafı; yoksa baş harfler ("Ayşe Nur Yılmaz" → "AY"). */
export default function ExpertAvatar({
  name,
  photoUrl,
  size = "sm",
}: {
  name: string
  photoUrl?: string
  size?: "sm" | "lg"
}) {
  const photo = toReachableImageUrl(photoUrl)
  const box =
    size === "lg" ? "w-24 h-24 rounded-2xl text-3xl" : "w-16 h-16 rounded-xl text-xl"

  return (
    <div
      className={`shrink-0 ${box} bg-brand-50 border border-ui-border-base overflow-hidden flex items-center justify-center`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          loading={size === "lg" ? "eager" : "lazy"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-extrabold text-brand-600" aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </div>
  )
}

// "Dr.", "Prof.", "Doç." gibi unvanlar baş harfe girmez.
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter((w) => w && !w.endsWith("."))
  if (parts.length === 0) return "?"
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
  return (first + last).toLocaleUpperCase("tr")
}
