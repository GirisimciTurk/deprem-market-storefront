import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    template: "%s | EKYP Deprem Market",
    default: "EKYP Deprem Market | Acil Durum & Afet Hazırlık Mağazası",
  },
  description: "Türkiye'nin öncü afet ve acil durum hazırlık marketi. Profesyonel deprem çantaları, ilk yardım setleri ve hayati acil durum ekipmanları.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://depremmarket.com",
    siteName: "EKYP Deprem Market",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} data-mode="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <main className="relative">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
