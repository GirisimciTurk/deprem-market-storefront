import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import AppleSplash from "@modules/layout/components/apple-splash"
import "styles/globals.css"

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
      url: "https://depremmarket.com",
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
        {/* React 19 bu <link rel="apple-touch-startup-image"> etiketlerini head'e taşır. */}
        <AppleSplash />
        <NextIntlClientProvider>
          <main className="relative">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
