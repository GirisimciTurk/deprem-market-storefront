import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getOrderStages, type StoreOrderStage } from "@lib/data/seller-shipments"
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
  let orderStages: Record<string, StoreOrderStage> = {}

  if (customer) {
    // Fetch customer's orders
    orders = await listOrders(10, 0).catch(() => []) || []
    // Listedeki rozetler çekirdek order.fulfillment_status'u gösteriyordu; o alan
    // bu sistemde hiç ilerlemediği için hepsi "Hazırlanıyor" görünüyordu. Gerçek
    // aşamayı tek istekte alıp sunucuda hazırlıyoruz (istemcide flaş olmasın).
    orderStages = await getOrderStages(orders.map((o) => o.id))
  }

  return (
    <TrackingClient
      customer={customer}
      initialOrders={orders}
      orderStages={orderStages}
    />
  )
}
