"use client"

import { useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { followSeller, unfollowSeller } from "@lib/data/sellers"

// Mağaza sayfasındaki takip kalbi (Etsy'de "favorite shop"). Giriş yapmamış
// ziyaretçiyi giriş sayfasına, dönüşte buraya götürür.
export default function FollowButton({
  handle,
  initialFollowing,
  initialCount,
  signedIn,
}: {
  handle: string
  initialFollowing: boolean
  initialCount: number
  signedIn: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [pending, start] = useTransition()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  const toggle = () => {
    if (!signedIn) {
      router.push(`/${countryCode}/account?redirect=${encodeURIComponent(`/${countryCode}/satici/${handle}`)}`)
      return
    }
    start(async () => {
      const next = !following
      const ok = next ? await followSeller(handle) : await unfollowSeller(handle)
      if (ok) {
        setFollowing(next)
        setCount((c) => c + (next ? 1 : -1))
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
      className={`inline-flex items-center gap-x-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
        following ? "border-rose-200 bg-rose-50 text-rose-600" : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
      } ${pending ? "opacity-60" : ""}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill={following ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.2 5 6.7 5c2 0 3.5 1.1 4.3 2.4h2C13.8 6.1 15.3 5 17.3 5c3.5 0 5.5 3.6 4.2 6.8C19.5 16.4 12 21 12 21Z" />
      </svg>
      {following ? "Takip ediliyor" : "Mağazayı takip et"}
      <span className="font-normal text-gray-500">· {count}</span>
    </button>
  )
}
