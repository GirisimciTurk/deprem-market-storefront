import React from "react"
import { useTranslations } from "next-intl"

export default function HomeFeatures({ countryCode }: { countryCode: string }) {
  const t = useTranslations("homeFeatures")

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t("card1Title"),
      description: t("card1Desc"),
    },
    {
      icon: (
        <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("card2Title"),
      description: t("card2Desc"),
    },
    {
      icon: (
        <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: t("card3Title"),
      description: t("card3Desc"),
    },
    {
      icon: (
        <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v-4l-4 4H9l-3-3v3H2V4h15v4z" />
        </svg>
      ),
      title: t("card4Title"),
      description: t("card4Desc"),
    },
  ]

  return (
    <div className="bg-white border-y border-ui-border-base py-16 sm:py-24">
      <div className="content-container px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-xs font-extrabold text-rose-600 tracking-wider uppercase mb-2">
            {t("eyebrow")}
          </h2>
          <p className="text-3xl font-extrabold text-ui-fg-base sm:text-4xl tracking-tight">
            {t("heading")}
          </p>
          <p className="mt-4 text-lg text-ui-fg-subtle">
            {t("subheading")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative bg-ui-bg-subtle border border-ui-border-base p-6 rounded-xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md"
            >
              <div className="bg-white p-3 rounded-lg border border-ui-border-base inline-block mb-4 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-ui-fg-base mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-ui-fg-subtle leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
