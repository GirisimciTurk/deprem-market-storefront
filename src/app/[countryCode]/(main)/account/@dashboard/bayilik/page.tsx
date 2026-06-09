import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { getMyResellerApplication } from "@lib/data/reseller"
import BayilikStatusClient from "./bayilik-status-client"

export const metadata: Metadata = {
  title: "Bayilik Durumu",
  description: "Bayilik başvuru durumunuzu kontrol edin.",
}

export default async function BayilikPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  // Gerçek backend verisi (localStorage yerine).
  const application = await getMyResellerApplication()

  return <BayilikStatusClient application={application} />
}
