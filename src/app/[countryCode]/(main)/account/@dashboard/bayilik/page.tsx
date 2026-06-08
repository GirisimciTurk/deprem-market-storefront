import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
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

  return <BayilikStatusClient customerEmail={customer.email} />
}
