import { Button, Heading } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = async ({ countryCode }: { countryCode: string }) => {
  const t = await getTranslations("hero")

  return (
    <div className="relative h-[85vh] w-full flex items-center justify-start overflow-hidden bg-slate-950">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/deprem_market_hero_banner.png"
          alt="EKYP Deprem Market Acil Durum Hazırlık Seti"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 transform scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-slate-950/20 z-10" />
      </div>

      {/* Hero Content */}
      <div className="content-container relative z-20 w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-left py-20 flex flex-col items-start gap-y-6">
        {/* Affiliate Badge */}
        <div className="inline-flex items-center gap-x-2 bg-rose-600/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full text-rose-400 text-xs font-semibold uppercase tracking-wider select-none animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {t("affiliateBadge")}
        </div>

        {/* Headlines */}
        <div className="max-w-2xl flex flex-col gap-y-3">
          <Heading
            level="h1"
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none uppercase"
          >
            {t("titleLead")}{" "}
            <span className="text-rose-600 block sm:inline">
              {t("titleHighlight")}
            </span>
          </Heading>
          
          <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <LocalizedClientLink href="/store">
            <Button
              size="large"
              className="bg-rose-600 border-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 px-8 py-3 rounded-lg shadow-lg font-bold tracking-wide transition-all duration-200"
            >
              {t("cta")}
            </Button>
          </LocalizedClientLink>
          
          <a
            href="https://girisimciturk.com/ekyp/deprem-teknolojileri/"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="secondary"
              size="large"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white px-6 py-3 rounded-lg backdrop-blur-sm transition-all duration-200 font-semibold"
            >
              {t("ctaSecondary")}
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Hero
