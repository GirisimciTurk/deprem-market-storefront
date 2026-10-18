import { isOwnOrder, retrieveOrder } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import React from "react"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("orderConfirmedTitle"),
    description: t("orderConfirmedDescription"),
    robots: { index: false, follow: false },
  }
}

/**
 * Ödeme sonrası ve sipariş e-postasının bağlantısı
 * ({STOREFRONT_URL}/order/{id}/confirmed?token=…). Middleware e-postanın
 * jetonunu sipariş jetonları çerezine yazıp jetonsuz adrese yönlendirir;
 * çerez yazılamadıysa adresteki jeton doğrudan kullanılır.
 */
export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const { token } = await props.searchParams
  const given = (Array.isArray(token) ? token[0] : token)?.trim() || undefined
  const [order, customer] = await Promise.all([
    retrieveOrder(params.id, given).catch(() => null),
    retrieveCustomer().catch(() => null),
  ])

  if (!order) {
    return (
      <div className="flex flex-col gap-y-6 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full text-4xl mb-2">✓</div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Siparişiniz Başarıyla Alındı!
        </h1>
        <p className="max-w-md text-base text-gray-650 leading-relaxed">
          Ödemeniz başarıyla tamamlandı. Sipariş numaranız: <strong className="text-brand-600">{params.id}</strong>.
          Sipariş detayları ve takip bilgileri e-posta adresinize gönderilecektir.
        </p>
        <div className="mt-4">
          <LocalizedClientLink 
            href="/store" 
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all"
          >
            Alışverişe Devam Et
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // Oturum açık ve sipariş bu müşterinin değilse (misafir siparişi ya da
  // başka hesabınki) "Bu siparişi hesabıma ekle" (gobit ADR 0450). gobit'in
  // vitrin siparişi müşteri kimliği taşımaz; sahiplik gobit'e jetonsuz okumayla
  // sorulur. Bilinemediyse (null) düğme gösterilmez.
  const claimable = !!customer && (await isOwnOrder(order.id)) === false

  return <OrderCompletedTemplate order={order} claimable={claimable} />
}
