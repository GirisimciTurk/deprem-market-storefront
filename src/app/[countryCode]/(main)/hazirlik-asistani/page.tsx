import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { getRegion } from "@lib/data/regions"
import PreparednessClient from "./preparedness-client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("preparedness")
  return {
    title: t("title"),
    description: t("subtitle"),
  }
}

export default async function PreparednessPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  return <PreparednessClient region={region ?? null} countryCode={countryCode} />
}
