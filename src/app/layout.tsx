import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import "styles/globals.css"

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
  }
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
