"use client"

import React, { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CookieConsent({ countryCode }: { countryCode: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslations("cookieConsent")

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem("_deprem_market_cookie_consent")
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleOpenSettings = () => {
      setIsVisible(true)
    }

    window.addEventListener("open-cookie-settings", handleOpenSettings)
    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenSettings)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("_deprem_market_cookie_consent", "accepted")
    setIsVisible(false)
    // ContactDock gibi köşeyi paylaşan bileşenlere karar verildiğini bildir.
    window.dispatchEvent(new Event("cookie-consent-resolved"))
  }

  const handleDecline = () => {
    localStorage.setItem("_deprem_market_cookie_consent", "declined")
    setIsVisible(false)
    window.dispatchEvent(new Event("cookie-consent-resolved"))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-ui-border-base shadow-2xl p-6 rounded-xl flex flex-col gap-y-4">
        <div className="flex items-start gap-x-3">
          {/* Cookie Icon */}
          <svg
            className="text-brand-600 w-6 h-6 flex-shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex flex-col gap-y-1">
            <h4 className="font-bold text-ui-fg-base text-sm">
              {t("title")}
            </h4>
            <p className="text-xs text-ui-fg-subtle leading-relaxed">
              {t.rich("description", {
                cookieLink: (chunks) => (
                  <LocalizedClientLink
                    href="/cerez-politikasi"
                    className="text-brand-600 underline font-medium hover:text-brand-700"
                  >
                    {chunks}
                  </LocalizedClientLink>
                ),
                kvkkLink: (chunks) => (
                  <LocalizedClientLink
                    href="/kvkk"
                    className="text-brand-600 underline font-medium hover:text-brand-700"
                  >
                    {chunks}
                  </LocalizedClientLink>
                ),
              })}
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center justify-end gap-x-3 text-xs font-semibold">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover rounded-md transition-colors"
          >
            {t("decline")}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 rounded-md shadow-sm transition-colors"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  )
}
