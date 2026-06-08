"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  const pathname = usePathname()

  // Don't render if no GA ID is configured
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: '${pathname}',
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
    </>
  )
}
