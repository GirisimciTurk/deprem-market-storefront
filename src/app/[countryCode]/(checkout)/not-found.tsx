"use client"

import React from "react"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function NotFound() {
  const t = useTranslations("notFound")

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <h1 className="text-4xl font-extrabold text-ui-fg-base tracking-tight mb-2">
        {t("checkoutTitle")}
      </h1>
      <p className="max-w-md text-base text-ui-fg-subtle leading-relaxed">
        {t("checkoutDescription")}
      </p>
      <div className="mt-4">
        <LocalizedClientLink
          href="/cart"
          className="text-brand-600 font-bold hover:underline"
        >
          {t("returnToCart")}
        </LocalizedClientLink>
      </div>
    </div>
  )
}
