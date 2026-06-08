"use client"

import React from "react"

export default function CookieConsentTrigger() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Open the cookie settings popup
    window.dispatchEvent(new CustomEvent("open-cookie-settings"))
  }

  return (
    <button
      onClick={handleClick}
      className="text-left hover:text-ui-fg-base transition-colors duration-150"
    >
      Çerez Tercihleri
    </button>
  )
}
