import { retrieveOrder } from "@lib/data/orders"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import React from "react"

type Props = {
  params: Promise<{ id: string }>
}
export const metadata: Metadata = {
  title: "Sipariş Onaylandı",
  description: "Siparişiniz başarıyla alındı. Teşekkür ederiz!",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return (
      <div className="flex flex-col gap-y-6 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full text-4xl mb-2">✓</div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Siparişiniz Başarıyla Alındı!
        </h1>
        <p className="max-w-md text-base text-gray-650 leading-relaxed">
          Ödemeniz başarıyla tamamlandı. Sipariş numaranız: <strong className="text-orange-600">{params.id}</strong>.
          Sipariş detayları ve takip bilgileri e-posta adresinize gönderilecektir.
        </p>
        <div className="mt-4">
          <LocalizedClientLink 
            href="/store" 
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all"
          >
            Alışverişe Devam Et
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return <OrderCompletedTemplate order={order} />
}
