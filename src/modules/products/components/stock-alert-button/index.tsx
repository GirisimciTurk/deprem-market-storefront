"use client"

import { useState } from "react"
import { Button } from "@modules/common/components/ui"
import { requestStockAlert, isPushSupported } from "@lib/util/push"

type Props = {
  variantId: string
  productId?: string
  productHandle?: string
  productTitle?: string
  /** Ürün kartı gibi dar alanlar için daha küçük buton + kısa metin. */
  compact?: boolean
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
  compact = false,
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

  const iconSize = compact ? 15 : 18

  if (state === "done") {
    return (
      <div
        className={
          compact
            ? "w-full min-h-9 py-1.5 px-2 flex items-center justify-center gap-x-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-semibold leading-tight text-center"
            : "w-full h-11 flex items-center justify-center gap-x-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-semibold"
        }
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {compact ? "Haber vereceğiz!" : "Stoğa girince haber vereceğiz!"}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      <Button
        onClick={handleClick}
        variant="secondary"
        className={
          compact
            ? "w-full min-h-9 py-1.5 px-2 font-semibold rounded-lg text-xs leading-tight"
            : "w-full h-11 font-semibold rounded-lg"
        }
        isLoading={state === "loading"}
        data-testid="stock-alert-button"
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 shrink-0">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {compact ? "Gelince haber ver" : "Stoğa gelince haber ver"}
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
