import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import TrackingClient from "@modules/order-tracking/components/tracking-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sipariş Takip & Kargo Sorgulama | EKYP Deprem Market",
  description: "Sipariş kodunuz ve e-posta adresinizle anlık kargo durumunuzu sorgulayın.",
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
