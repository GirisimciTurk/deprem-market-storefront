"use client"

import { convertToLocale } from "@lib/util/money"
import { sdk } from "@lib/config"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    id?: string | null
    shipping_methods?: { id: string }[] | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    id: cartId,
    shipping_methods,
  } = totals

  // Sepet sayfasında henüz kargo YÖNTEMİ seçilmediği için shipping_subtotal 0'dır.
  // Müşteri kargoyu desiye göre ödediğinden, seçim öncesi DESİ-BAZLI TAHMİNİ
  // gösteririz (otoriter ücret yine checkout'ta seçimle netleşir).
  const methodSelected = (shipping_methods?.length ?? 0) > 0
  const [estimate, setEstimate] = React.useState<{
    amount: number
    free: boolean
  } | null>(null)

  React.useEffect(() => {
    if (methodSelected || !cartId) return
    let active = true
    sdk.client
      .fetch<{ amount: number; free: boolean }>("/store/shipping-quote", {
        method: "GET",
        query: { cart_id: cartId },
      })
      .then((r) => {
        if (active) setEstimate({ amount: r.amount ?? 0, free: !!r.free })
      })
      .catch(() => {
        if (active) setEstimate(null)
      })
    return () => {
      active = false
    }
  }, [cartId, methodSelected, item_subtotal])

  // Kargo satırında gösterilecek değer.
  const renderShipping = () => {
    if (methodSelected) {
      return convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })
    }
    if (estimate) {
      if (estimate.free) {
        return <span className="text-green-600 font-medium">Ücretsiz</span>
      }
      return (
        <span>
          {convertToLocale({ amount: estimate.amount, currency_code })}{" "}
          <span className="text-ui-fg-muted text-xs">(tahmini)</span>
        </span>
      )
    }
    // Tahmin yüklenene kadar mevcut shipping_subtotal (genelde 0).
    return convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })
  }

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Ara Toplam (kargo ve vergi hariç)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Kargo</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {renderShipping()}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>İndirim</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Vergiler</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Toplam</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({
            // Yöntem seçilmeden tahmini kargo gösteriyorsak toplama dahil et.
            amount:
              !methodSelected && estimate && !estimate.free
                ? (total ?? 0) + estimate.amount
                : total ?? 0,
            currency_code,
          })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
