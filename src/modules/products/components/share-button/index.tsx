"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

/**
 * Ürün paylaş butonu. Web Share API destekleniyorsa (mobil) native paylaşım
 * sayfasını açar (WhatsApp/SMS/...); yoksa (masaüstü) bağlantıyı panoya kopyalar.
 */
const ShareButton = ({ title }: { title: string }) => {
  const t = useTranslations("pwa")
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url })
      } catch {
        /* kullanıcı iptal etti / engellendi → sessiz geç */
      }
      return
    }
    // Web Share yok → panoya kopyala
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard izni yok → sessiz */
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label={t("share")}
      title={copied ? t("linkCopied") : t("share")}
      className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-orange-600 hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
    >
      {copied ? (
        <svg
          className="w-5 h-5 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
          />
        </svg>
      )}
    </button>
  )
}

export default ShareButton
