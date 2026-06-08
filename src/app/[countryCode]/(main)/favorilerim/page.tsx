import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import FavoritesTemplate from "@modules/favorites/templates"
import { notFound } from "next/navigation"
import React from "react"

export const metadata: Metadata = {
  title: "Beğendiklerim | EKYP Deprem Market",
  description: "Favorilerinize eklediğiniz acil durum ve deprem hazırlık ürünleri listesi.",
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
