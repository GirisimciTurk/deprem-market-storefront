"use client"

import React, { useState, useEffect, useRef, useCallback, Fragment } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search, X, Loader2 } from "lucide-react"
import Image from "next/image"

type SearchResult = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  price?: string
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("searchModal")

  // Extract countryCode from pathname
  const countryCode = pathname?.split("/")?.[1] || "tr"
  const isTr = countryCode === "tr"

  // Open with keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
      setSelectedIndex(-1)
    }
  }, [isOpen])

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

        const mapped: SearchResult[] = (data.products || []).map(
          (p: any) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            thumbnail: p.thumbnail,
            price: p.variants?.[0]?.calculated_price?.calculated_amount
              ? `${(p.variants[0].calculated_price.calculated_amount / 1).toLocaleString(isTr ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })} ${(p.variants[0].calculated_price.currency_code || "TRY").toUpperCase()}`
              : undefined,
          })
        )
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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault()
        navigateToProduct(results[selectedIndex].handle)
      }
    },
    [results, selectedIndex]
  )

  const navigateToProduct = (handle: string) => {
    setIsOpen(false)
    router.push(`/${countryCode}/products/${handle}`)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-1 hover:text-ui-fg-base transition-colors"
        aria-label={t("triggerAriaLabel")}
        title={t("triggerTitle")}
      >
        <Search className="w-5 h-5 text-slate-700 hover:text-slate-900 transition-colors" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-x-3 px-5 py-4 border-b border-ui-border-base">
              <Search className="w-5 h-5 text-ui-fg-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 text-base text-ui-fg-base placeholder:text-ui-fg-muted outline-none bg-transparent"
                autoComplete="off"
              />
              {isLoading && (
                <Loader2 className="w-5 h-5 text-ui-fg-muted animate-spin flex-shrink-0" />
              )}
              {query && !isLoading && (
                <button
                  onClick={() => {
                    setQuery("")
                    inputRef.current?.focus()
                  }}
                  className="p-0.5 hover:bg-ui-bg-subtle rounded-md transition-colors"
                  aria-label="Aramayı temizle"
                >
                  <X className="w-4 h-4 text-ui-fg-muted" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-ui-border-base bg-ui-bg-subtle px-2 py-0.5 text-[10px] font-mono text-ui-fg-muted">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {query.length >= 2 && results.length > 0 && (
                <ul className="py-2">
                  {results.map((product, idx) => (
                    <li key={product.id}>
                      <button
                        onClick={() => navigateToProduct(product.handle)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-x-4 px-5 py-3 text-left transition-colors ${
                          idx === selectedIndex
                            ? "bg-ui-bg-subtle"
                            : "hover:bg-ui-bg-subtle/50"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-ui-bg-subtle flex-shrink-0 overflow-hidden relative">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ui-fg-muted">
                              <Search className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ui-fg-base truncate">
                            {product.title}
                          </p>
                          {product.price && (
                            <p className="text-xs text-ui-fg-subtle mt-0.5">
                              {product.price}
                            </p>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        {idx === selectedIndex && (
                          <span className="text-ui-fg-muted text-xs">↵</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Empty state */}
              {query.length >= 2 && !isLoading && results.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <Search className="w-10 h-10 text-ui-fg-muted mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-ui-fg-subtle">
                    {t("noResults", { query })}
                  </p>
                  <p className="text-xs text-ui-fg-muted mt-1">
                    {t("tryDifferent")}
                  </p>
                </div>
              )}

              {/* Initial state / prompt */}
              {query.length < 2 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-ui-fg-subtle">
                    {t("typeToSearch")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-ui-border-base bg-ui-bg-subtle text-[11px] text-ui-fg-muted">
              <div className="flex items-center gap-x-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-ui-border-base bg-white text-[10px] font-mono">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border border-ui-border-base bg-white text-[10px] font-mono">↓</kbd>
                  {t("navigate")}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-ui-border-base bg-white text-[10px] font-mono">↵</kbd>
                  {t("select")}
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-ui-border-base bg-white text-[10px] font-mono">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded border border-ui-border-base bg-white text-[10px] font-mono">K</kbd>
                {t("openSearch")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
