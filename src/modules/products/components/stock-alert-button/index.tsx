"use client"

import { useState } from "react"
import { Button } from "@modules/common/components/ui"
import { requestStockAlert, isPushSupported } from "@lib/util/push"

type Props = {
  variantId: string
  productId?: string
  productHandle?: string
  productTitle?: string
}

/**
 * Tükenen ürün/varyant için "Stoğa gelince haber ver" butonu. Tıklayınca push
 * izni ister, aboneliği oluşturur ve backend'e stok uyarısı kaydeder. Ürün
 * yeniden stoğa girdiğinde kullanıcıya bildirim gönderilir.
 */
const StockAlertButton = ({
  variantId,
  productId,
  productHandle,
  productTitle,
}: Props) => {
  const [state, setState] = useState<
    "idle" | "loading" | "done" | "denied" | "unsupported"
  >("idle")

  const handleClick = async () => {
    if (!isPushSupported()) {
      setState("unsupported")
      return
    }
    setState("loading")
    const ok = await requestStockAlert({
      variant_id: variantId,
      product_id: productId,
      product_handle: productHandle,
      product_title: productTitle,
    })
    setState(ok ? "done" : "denied")
  }

  if (state === "done") {
    return (
      <div className="w-full h-11 flex items-center justify-center gap-x-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-semibold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Stoğa girince haber vereceğiz!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      <Button
        onClick={handleClick}
        variant="secondary"
        className="w-full h-11 font-semibold rounded-lg"
        isLoading={state === "loading"}
        data-testid="stock-alert-button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        Stoğa gelince haber ver
      </Button>
      {state === "denied" && (
        <p className="text-xs text-ui-fg-subtle">
          Bildirim izni verilmedi. Tarayıcı ayarlarından izin verip tekrar
          deneyebilirsiniz.
        </p>
      )}
      {state === "unsupported" && (
        <p className="text-xs text-ui-fg-subtle">
          Tarayıcınız anlık bildirimleri desteklemiyor. (iOS'ta siteyi Ana
          Ekrana ekleyin.)
        </p>
      )}
    </div>
  )
}

export default StockAlertButton
