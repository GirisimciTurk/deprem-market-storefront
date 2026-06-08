import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-mode="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="relative">{children}</main>
      </body>
    </html>
  )
}
