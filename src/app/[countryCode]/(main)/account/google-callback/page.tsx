"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { validateGoogleCallback } from "@lib/data/customer"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const query: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      query[key] = value
    })

    const countryCode = (params?.countryCode as string) || "tr"

    validateGoogleCallback(query)
      .then((res) => {
        if (res.success) {
          // Hard navigation so the account page is server-rendered fresh with the
          // newly set auth cookie. router.replace can serve a stale (logged-out)
          // RSC payload, leaving the spinner stuck even though login succeeded.
          window.location.replace(`/${countryCode}/account`)
        } else {
          setError(res.error || "Google ile giriş doğrulanamadı.")
        }
      })
      .catch((err) => setError(String(err)))
  }, [params, router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 text-center">
      {error ? (
        <>
          <p className="text-sm font-semibold text-red-600 max-w-md">{error}</p>
          <button
            onClick={() => router.replace(`/${(params?.countryCode as string) || "tr"}/account`)}
            className="text-sm text-orange-600 font-bold hover:underline"
          >
            Giriş sayfasına dön
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">
            Google ile giriş yapılıyor...
          </p>
        </>
      )}
    </div>
  )
}
