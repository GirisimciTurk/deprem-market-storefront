import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { getMyResellerApplication } from "@lib/data/reseller"
import SaticiStatusClient from "./satici-status-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("dealershipStatusTitle"),
    description: t("dealershipStatusDescription"),
  }
}

export default async function SaticiPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  // Gerçek backend verisi (localStorage yerine).
  const application = await getMyResellerApplication()

  return <SaticiStatusClient application={application} />
}
