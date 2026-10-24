"use client"

import { useEffect, useState } from "react"

// Pazarlamacı referans kodu (dtm marketers.go): pazarlamacının paylaştığı başvuru
// bağlantısı (?ref=KOD) kodu 30 gün bu tarayıcıda tutar; satıcı başvurusu kodu
// gönderir, başvuru onaylanınca satıcı o pazarlamacıya bağlanır. Geçersiz ya da
// kullanılmayan kod sunucuda yok sayılır.

const KEY = "dtm_ref_code"
const TTL = 30 * 24 * 60 * 60 * 1000
const PATTERN = /^[A-Z0-9-]{3,20}$/

export const foldRefCode = (s: string) => s.trim().toLocaleUpperCase("en-US")
export const isRefCode = (s: string) => PATTERN.test(foldRefCode(s))

/** Adresteki ?ref= (yoksa saklanmış kod) ile dolan, düzenlenebilir referans kodu. */
export function useRefCode(): [string, (v: string) => void] {
  const [code, setCode] = useState("")
  useEffect(() => {
    try {
      const fromUrl = foldRefCode(new URLSearchParams(window.location.search).get("ref") ?? "")
      if (PATTERN.test(fromUrl)) {
        localStorage.setItem(KEY, JSON.stringify({ code: fromUrl, until: Date.now() + TTL }))
        setCode(fromUrl)
        return
      }
      const kept = JSON.parse(localStorage.getItem(KEY) ?? "null") as { code?: string; until?: number } | null
      if (kept?.code && (kept.until ?? 0) > Date.now()) setCode(kept.code)
      else localStorage.removeItem(KEY)
    } catch {
      /* depolama kapalı: kod elle girilir */
    }
  }, [])
  return [code, setCode]
}
