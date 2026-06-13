import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import TrackingClient from "@modules/order-tracking/components/tracking-client"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("orderTrackingTitle"),
    description: t("orderTrackingDescription"),
  }
}

export default async function OrderTrackingPage() {
  const customer = await retrieveCustomer()
  let orders: any[] = []
  
  if (customer) {
    // Fetch customer's orders
    orders = await listOrders(10, 0).catch(() => []) || []
  }

  return (
    <TrackingClient customer={customer} initialOrders={orders} />
  )
}
