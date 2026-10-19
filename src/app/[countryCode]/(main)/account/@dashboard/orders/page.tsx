import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { listLegacyOrders } from "@lib/data/legacy-orders"
import LegacyOrders from "@modules/account/components/legacy-orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("ordersTitle"),
    description: t("ordersDescription"),
  }
}

export default async function Orders() {
  const [orders, legacy] = await Promise.all([listOrders(), listLegacyOrders()])

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Siparişlerim</h1>
        <p className="text-base-regular">
          Önceki siparişlerinizi ve durumlarını bu ekrandan takip edebilirsiniz.
        </p>
      </div>
      <div>
        {(orders.length > 0 || legacy.length === 0) && <OrderOverview orders={orders} />}
        <LegacyOrders orders={legacy} />
        <Divider className="mb-8 mt-8" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
