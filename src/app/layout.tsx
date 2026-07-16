import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import Script from "next/script"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import AppleSplash from "@modules/layout/components/apple-splash"
import { OrganizationJsonLd } from "@modules/common/components/json-ld"
import "styles/globals.css"

// Google Analytics 4 ölçüm kimliği (depremtek.market). Kök layout'ta tek yerde
// yüklenir → tüm sayfalarda (tüm ülke/dil rotalarında) otomatik aktiftir.
const GA_MEASUREMENT_ID = "G-BY6LLHW7GJ"

// theme-color: tarayıcı/PWA adres çubuğu ve iOS standalone üst bar rengi
// (manifest theme_color ile aynı marka rengi).
export const viewport: Viewport = {
  themeColor: "#F08C1A",
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    metadataBase: new URL(getBaseURL()),
    title: {
      template: t("rootTemplate"),
      default: t("rootDefaultTitle"),
    },
    description: t("rootDescription"),
    openGraph: {
      type: "website",
      locale: t("ogLocale"),
      url: getBaseURL(),
      siteName: t("siteName"),
    },
    // iOS "Ana Ekrana Ekle" → standalone PWA. capable:true ŞART; iOS web push
    // (16.4+) yalnızca bu şekilde kurulu PWA'da çalışır. apple-touch-icon
    // apple-icon.tsx'ten otomatik gelir.
    appleWebApp: {
      capable: true,
      title: "depremTek Market",
      statusBarStyle: "default",
    },
    // Next.js 15 yalnızca `mobile-web-app-capable` veriyor; iOS standalone +
    // web push uyumu için Apple-spesifik tag'i açıkça garantiye al.
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} data-mode="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Google Analytics (gtag.js) — yalnızca production build'de yüklenir;
            lokal/dev trafiği GA property'sine karışmasın diye. afterInteractive:
            sayfa etkileşimli olduktan sonra yüklenir, ilk boyamayı bloklamaz. */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {/* Site geneli Organization schema (marka bilgi paneli / SEO). */}
        <OrganizationJsonLd baseUrl={getBaseURL()} />
        {/* React 19 bu <link rel="apple-touch-startup-image"> etiketlerini head'e taşır. */}
        <AppleSplash />
        <NextIntlClientProvider>
          <main className="relative">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
