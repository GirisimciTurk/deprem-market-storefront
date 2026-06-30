"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { toReachableImageUrl } from "@lib/util/image-url"

type SearchResult = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  price?: string
}

/**
 * Satır-içi (inline) canlı arama. Çubuğa doğrudan yazılır; sonuçlar çubuğun
 * hemen ALTINDA açılır liste olarak gelir (modal/popup yok). Amazon tarzı:
 * solda metin alanı, sağda turuncu arama düğmesi.
 */
export default function SearchModal() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [open, setOpen] = useState(false) // açılır liste görünür mü
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("searchModal")

  // Extract countryCode from pathname
  const countryCode = pathname?.split("/")?.[1] || "tr"
  const isTr = countryCode === "tr"

  // Ctrl+K / Cmd+K → çubuğa odaklan (artık modal açmaz)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Dışarı tıklayınca açılır listeyi kapat (odak/sonuç durumunu bozma)
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey =
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

        const res = await fetch(
          `${backendUrl}/store/products?q=${encodeURIComponent(query)}&limit=8&fields=id,title,handle,thumbnail,*variants.calculated_price`,
          {
            headers: {
              "x-publishable-api-key": publishableKey,
            },
          }
        )
        const data = await res.json()

        const mapped: SearchResult[] = (data.products || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          thumbnail: p.thumbnail,
          price: p.variants?.[0]?.calculated_price?.calculated_amount
            ? `${(p.variants[0].calculated_price.calculated_amount / 1).toLocaleString(isTr ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })} ${(p.variants[0].calculated_price.currency_code || "TRY").toUpperCase()}`
            : undefined,
        }))
        setResults(mapped)
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, countryCode, isTr])

  const navigateToProduct = (handle: string) => {
    setOpen(false)
    setQuery("")
    setResults([])
    setSelectedIndex(-1)
    inputRef.current?.blur()
    router.push(`/${countryCode}/products/${handle}`)
  }

  // Açılır liste klavye gezinmesi (oklar + Escape). Enter form submit'te işlenir.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    },
    [results]
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Seçili varsa ona, yoksa ilk sonuca git.
    const target = selectedIndex >= 0 ? results[selectedIndex] : results[0]
    if (target) navigateToProduct(target.handle)
  }

  const showDropdown = open && query.length >= 2

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Arama çubuğu (Amazon tarzı): metin alanı + turuncu düğme */}
      <form
        onSubmit={submit}
        className="group flex h-10 small:h-11 w-full items-center overflow-hidden rounded-lg border-2 border-brand-500/40 bg-white transition-colors focus-within:border-brand-600"
        role="search"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(-1)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent px-3 small:px-4 text-sm text-ui-fg-base outline-none placeholder:text-ui-fg-muted"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setResults([])
              setSelectedIndex(-1)
              inputRef.current?.focus()
            }}
            aria-label={t("clear")}
            className="px-1 text-ui-fg-muted transition-colors hover:text-ui-fg-base"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label={t("triggerAriaLabel")}
          className="flex h-full shrink-0 items-center justify-center bg-brand-500 px-3.5 small:px-5 text-white transition-colors hover:bg-brand-600"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </form>

      {/* Sonuç açılır listesi — çubuğun hemen altında */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] overflow-hidden rounded-xl border border-ui-border-base bg-white shadow-2xl">
          <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
            {results.length > 0 && (
              <ul className="py-2">
                {results.map((product, idx) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      // Tıklamadan önce input blur'unu engelleme gerekmez (dışarı-
                      // tıklama kapatıyor, blur değil) — ama güvenli olsun diye.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => navigateToProduct(product.handle)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-x-4 px-4 py-3 text-left transition-colors ${
                        idx === selectedIndex ? "bg-ui-bg-subtle" : "hover:bg-ui-bg-subtle/50"
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ui-bg-subtle">
                        {product.thumbnail ? (
                          <Image
                            src={toReachableImageUrl(product.thumbnail)!}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ui-fg-muted">
                            <Search className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ui-fg-base">
                          {product.title}
                        </p>
                        {product.price && (
                          <p className="mt-0.5 text-xs text-ui-fg-subtle">{product.price}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Boş sonuç */}
            {!isLoading && results.length === 0 && (
              <div className="px-5 py-8 text-center">
                <Search className="mx-auto mb-3 h-9 w-9 text-ui-fg-muted opacity-40" />
                <p className="text-sm text-ui-fg-subtle">{t("noResults", { query })}</p>
                <p className="mt-1 text-xs text-ui-fg-muted">{t("tryDifferent")}</p>
              </div>
            )}

            {/* İlk yükleme (henüz sonuç yok) */}
            {isLoading && results.length === 0 && (
              <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-ui-fg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("placeholder")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
