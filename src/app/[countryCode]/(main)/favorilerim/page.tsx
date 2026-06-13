import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import FavoritesTemplate from "@modules/favorites/templates"
import { notFound } from "next/navigation"
import React from "react"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("favoritesTitle"),
    description: t("favoritesDescription"),
  }
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function FavoritesPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  return (
    <FavoritesTemplate
      region={region}
      countryCode={params.countryCode}
    />
  )
}
