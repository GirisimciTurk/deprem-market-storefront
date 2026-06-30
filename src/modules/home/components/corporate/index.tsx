import React from "react"
import { useTranslations } from "next-intl"
import { Button } from "@modules/common/components/ui"

export default function CorporateSection({ countryCode }: { countryCode: string }) {
  const t = useTranslations("homeCorporate")

  return (
    <div className="bg-slate-900 text-white py-16 sm:py-24 relative overflow-hidden">
      {/* Background Graphic elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -mr-20 -mt-20 z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20 z-0" />

      <div className="content-container relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center gap-y-6">
        {/* Badge */}
        <span className="text-xs font-bold tracking-wider text-brand-500 uppercase bg-brand-950/40 border border-brand-900/60 px-3.5 py-1.5 rounded-full select-none">
          {t("badge")}
        </span>

        {/* Heading */}
        <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-3xl uppercase">
          {t("heading")}
        </h2>

        {/* Text Details */}
        <p className="text-lg text-slate-300 max-w-3xl leading-relaxed font-medium">
          {t.rich("description", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>

        {/* Metadata stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-4 w-full max-w-3xl text-slate-300 font-bold border-y border-slate-800 py-6">
          <div className="flex flex-col">
            <span className="text-3xl text-brand-500 font-black">1.5M+</span>
            <span className="text-xs text-slate-400 mt-1">
              {t("stat1Label")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl text-brand-500 font-black">24/48s</span>
            <span className="text-xs text-slate-400 mt-1">
              {t("stat2Label")}
            </span>
          </div>
          <div className="flex flex-col col-span-2 md:col-span-1">
            <span className="text-3xl text-brand-500 font-black">depremTek</span>
            <span className="text-xs text-slate-400 mt-1">
              {t("stat3Label")}
            </span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <a
            href="https://girisimciturk.com/ekyp/deprem-teknolojileri/"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full bg-brand-600 border-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg">
              {t("ctaPrimary")}
            </Button>
          </a>
          <a
            href="https://girisimciturk.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="secondary"
              className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-lg"
            >
              {t("ctaSecondary")}
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
