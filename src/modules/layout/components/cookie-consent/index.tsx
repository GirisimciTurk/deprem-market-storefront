"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CookieConsent({ countryCode }: { countryCode: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const isTr = countryCode === "tr"

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
  }

  const handleDecline = () => {
    localStorage.setItem("_deprem_market_cookie_consent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-ui-border-base shadow-2xl p-6 rounded-xl flex flex-col gap-y-4">
        <div className="flex items-start gap-x-3">
          {/* Cookie Icon */}
          <svg
            className="text-rose-600 w-6 h-6 flex-shrink-0 mt-0.5"
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
              {isTr ? "Çerez Politikası ve KVKK" : "Cookie Settings"}
            </h4>
            <p className="text-xs text-ui-fg-subtle leading-relaxed">
              {isTr ? (
                <>
                  Size daha iyi bir alışveriş deneyimi sunabilmek için çerezler kullanıyoruz. Detaylı bilgi için{" "}
                  <LocalizedClientLink
                    href="/cerez-politikasi"
                    className="text-rose-600 underline font-medium hover:text-rose-700"
                  >
                    Çerez Politikamızı
                  </LocalizedClientLink>{" "}
                  ve{" "}
                  <LocalizedClientLink
                    href="/kvkk"
                    className="text-rose-600 underline font-medium hover:text-rose-700"
                  >
                    KVKK Aydınlatma Metnimizi
                  </LocalizedClientLink>{" "}
                  inceleyebilirsiniz.
                </>
              ) : (
                <>
                  We use cookies to improve your user experience and service quality. For details, view our{" "}
                  <LocalizedClientLink
                    href="/cerez-politikasi"
                    className="text-rose-600 underline font-medium hover:text-rose-700"
                  >
                    Cookie Policy
                  </LocalizedClientLink>{" "}
                  and{" "}
                  <LocalizedClientLink
                    href="/kvkk"
                    className="text-rose-600 underline font-medium hover:text-rose-700"
                  >
                    KVKK Statement
                  </LocalizedClientLink>
                  .
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center justify-end gap-x-3 text-xs font-semibold">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover rounded-md transition-colors"
          >
            {isTr ? "Reddet" : "Decline"}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 rounded-md shadow-sm transition-colors"
          >
            {isTr ? "Kabul Et" : "Accept All"}
          </button>
        </div>
      </div>
    </div>
  )
}
