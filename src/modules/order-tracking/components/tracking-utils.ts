/** Sipariş takip ekranı için saf yardımcılar (React'sız): durum etiketleri +
 *  adım/zaman çizelgesi hesabı. UI tracking-client.tsx'te. */

export type StatusColor = "orange" | "blue" | "green" | "red" | "grey"

export type TrackingStep = {
  title: string
  desc: string
  date: string | null
  completed: boolean
  active: boolean
  isError?: boolean
}

// Siparişin gönderim ve ödeme durumunu müşteriye gösterilen Türkçe etikete çevirir
export function getFulfillmentLabel(status: string): { text: string; color: StatusColor } {
  switch (status) {
    case "not_fulfilled":
      return { text: "Hazırlanıyor", color: "orange" }
    case "partially_fulfilled":
      return { text: "Kısmen Hazırlandı", color: "blue" }
    case "fulfilled":
      return { text: "Hazırlandı", color: "blue" }
    case "partially_shipped":
      return { text: "Kısmen Kargolandı", color: "blue" }
    case "shipped":
      return { text: "Kargoya Verildi", color: "green" }
    case "delivered":
      return { text: "Teslim Edildi", color: "green" }
    case "canceled":
      return { text: "İptal Edildi", color: "red" }
    default:
      return { text: "Hazırlanıyor", color: "orange" }
  }
}

export function getPaymentLabel(status: string): { text: string; color: StatusColor } {
  switch (status) {
    case "not_paid":
      return { text: "Ödeme Bekleniyor", color: "orange" }
    case "awaiting":
      return { text: "Onay Bekleniyor", color: "orange" }
    case "partially_captured":
      return { text: "Kısmen Ödendi", color: "orange" }
    case "captured":
      return { text: "Ödendi", color: "green" }
    case "partially_refunded":
      return { text: "Kısmen İade Edildi", color: "grey" }
    case "refunded":
      return { text: "İade Edildi", color: "grey" }
    case "canceled":
      return { text: "İptal Edildi", color: "red" }
    default:
      return { text: status, color: "grey" }
  }
}

/** gobit'in (dtm stage.go) ürettiği satıcı-bazlı aşama. */
export type OrderStage = "received" | "preparing" | "shipped" | "delivered" | "canceled"

export type SellerShipment = {
  seller_order_id: string
  seller_name?: string
  seller_handle?: string
  stage: OrderStage
  stage_label?: string
  fulfillment_status?: string
  preparing_at?: string | null
  fulfilled_at?: string | null
  carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
}

/** Aşamanın çizelgedeki adım indeksi. */
const STAGE_STEP: Record<Exclude<OrderStage, "canceled">, number> = {
  received: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
}

export function getStageLabel(stage: OrderStage): { text: string; color: StatusColor } {
  switch (stage) {
    case "received":
      return { text: "Sipariş Alındı", color: "grey" }
    case "preparing":
      return { text: "Hazırlanıyor", color: "orange" }
    case "shipped":
      return { text: "Kargoya Verildi", color: "green" }
    case "delivered":
      return { text: "Teslim Edildi", color: "green" }
    case "canceled":
      return { text: "İptal Edildi", color: "red" }
    default:
      return { text: "Hazırlanıyor", color: "orange" }
  }
}

/** Aktif (iptal olmayan) paketler arasında en GEÇ damgayı bul — o aşamanın tamamlanma anı. */
function latestDate(shipments: SellerShipment[], field: "preparing_at" | "fulfilled_at") {
  const times = shipments
    .filter((s) => s.stage !== "canceled")
    .map((s) => s[field])
    .filter((v): v is string => !!v)
    .map((v) => new Date(v).getTime())
    .filter((t) => Number.isFinite(t))
  if (!times.length) return null
  return new Date(Math.max(...times)).toLocaleDateString("tr-TR")
}

export function getStatusSteps(orderObj: any): {
  currentStep: number
  isCanceled: boolean
  steps: TrackingStep[]
} {
  const isCanceled = orderObj.status === "canceled" || orderObj.stage === "canceled"
  const fStatus = orderObj.fulfillment_status

  const steps: TrackingStep[] = [
    {
      title: "Sipariş Alındı",
      desc: "Siparişiniz başarıyla alındı ve onaylandı.",
      date: new Date(orderObj.created_at).toLocaleDateString("tr-TR"),
      completed: true,
      active: false,
    },
    {
      title: "Hazırlanıyor",
      desc: "Siparişiniz paketleniyor ve faturası düzenleniyor.",
      date: null as string | null,
      completed: false,
      active: false,
    },
    {
      title: "Kargoya Verildi",
      desc: "Siparişiniz kargo firmasına teslim edilmiştir.",
      date: null as string | null,
      completed: false,
      active: false,
    },
    {
      title: "Teslim Edildi",
      desc: "Siparişiniz başarıyla teslim edilmiştir.",
      date: null as string | null,
      completed: false,
      active: false,
    },
  ]

  if (isCanceled) {
    return {
      currentStep: -1,
      isCanceled: true,
      steps: [
        {
          title: "Sipariş Alındı",
          desc: "Siparişiniz alındı.",
          date: new Date(orderObj.created_at).toLocaleDateString("tr-TR"),
          completed: true,
          active: false,
        },
        {
          title: "İptal Edildi",
          desc: "Bu sipariş iptal edilmiştir.",
          date: null,
          completed: true,
          active: true,
          isError: true,
        },
      ] as TrackingStep[],
    }
  }

  // ── BİRİNCİL KAYNAK: satıcı alt-siparişlerinden türetilen aşama ───────────
  // Neden: siparişin kendi fulfillment_status'u ilerlemiyor, o yüzden aşağıdaki
  // eski mantık her siparişi sonsuza kadar "Hazırlanıyor"da tutardı. Gerçek aşama
  // satıcı alt-siparişinde.
  // gobit `stage` alanını sipariş takibi yanıtında (/store/v1/dtm/order-tracking) gönderir.
  const shipments: SellerShipment[] = Array.isArray(orderObj.seller_shipments)
    ? orderObj.seller_shipments
    : []
  const stage: OrderStage | null = orderObj.stage ?? null

  if (stage && stage !== "canceled") {
    const current = STAGE_STEP[stage]
    for (let i = 1; i <= current; i++) steps[i].completed = true
    steps[current].completed = true
    steps[current].active = true

    // Tarihler: her aşamanın en GEÇ damgası (tüm paketler o aşamayı geçtiği an).
    steps[1].date = latestDate(shipments, "preparing_at")
    steps[2].date = latestDate(shipments, "fulfilled_at")
    // "Sipariş Alındı" her zaman tamamlanmış ve tarihi sipariş tarihidir (yukarıda set edildi).

    return { currentStep: current, isCanceled: false, steps }
  }

  // ── YEDEK: eski çekirdek-durum mantığı ────────────────────────────────────
  // Alt-sipariş yoksa (stage null) buraya düşer: pazaryeri bölünmesi yapılmamış
  // eski siparişler ve sipariş takibi dışından beslenen ekranlar.

  // Mark Preparing
  if (fStatus === "not_fulfilled") {
    steps[1].completed = true
    steps[1].active = true
    return { currentStep: 1, isCanceled: false, steps }
  }

  // Mark Shipped
  if (["fulfilled", "partially_shipped", "shipped"].includes(fStatus)) {
    steps[1].completed = true
    steps[2].completed = true
    steps[2].active = true
    if (orderObj.fulfillments && orderObj.fulfillments.length > 0) {
      const lastF = orderObj.fulfillments[orderObj.fulfillments.length - 1]
      if (lastF.shipped_at) {
        steps[2].date = new Date(lastF.shipped_at).toLocaleDateString("tr-TR")
      }
    }
  }

  // Mark Delivered
  if (fStatus === "delivered" || orderObj.status === "completed") {
    steps[1].completed = true
    steps[2].completed = true
    steps[3].completed = true
    steps[3].active = true
    if (orderObj.fulfillments && orderObj.fulfillments.length > 0) {
      const lastF = orderObj.fulfillments[orderObj.fulfillments.length - 1]
      if (lastF.delivered_at) {
        steps[3].date = new Date(lastF.delivered_at).toLocaleDateString("tr-TR")
      }
    }
    return { currentStep: 3, isCanceled: false, steps }
  }

  return { currentStep: 2, isCanceled: false, steps }
}

/** dtm'nin misafir sipariş takibi yanıtı (POST /store/v1/dtm/order-tracking). */
export type TrackedOrder = {
  display_id: number
  status: string
  placed_at: string
  /** Küçük harf (try). */
  currency_code: string
  total: number
  shipping_total: number
  items: { product_title: string; title: string; quantity: number; total: number }[]
  stage: OrderStage
  stage_label: string
  seller_shipments: {
    seller_name: string
    seller_handle: string
    stage: OrderStage
    stage_label: string
    carrier: string
    tracking_number: string
    tracking_url: string
    item_count: number
  }[]
}

/** Takip ekranının okuduğu sipariş görünümü (adres, kimlik ve ödeme durumu yok). */
export type TrackingView = {
  display_id: number
  status: string
  created_at: string
  currency_code: string
  total: number
  shipping_total: number
  stage: OrderStage
  stage_label: string
  items: { id: string; title: string; variant_title: string; quantity: number; total: number }[]
  seller_shipments: (SellerShipment & { item_count: number })[]
}

export function toTrackingView(t: TrackedOrder): TrackingView {
  return {
    display_id: t.display_id,
    status: t.status,
    created_at: t.placed_at,
    currency_code: (t.currency_code || "try").toLowerCase(),
    total: t.total,
    shipping_total: t.shipping_total,
    stage: t.stage,
    stage_label: t.stage_label,
    items: (t.items ?? []).map((l, i) => ({
      id: `${t.display_id}-${i}`,
      title: l.product_title || l.title,
      variant_title: l.product_title && l.title !== l.product_title ? l.title : "",
      quantity: l.quantity,
      total: l.total,
    })),
    seller_shipments: (t.seller_shipments ?? []).map((s, i) => ({
      seller_order_id: `${t.display_id}-${i}`,
      seller_name: s.seller_name,
      seller_handle: s.seller_handle,
      stage: s.stage,
      stage_label: s.stage_label,
      carrier: s.carrier || null,
      tracking_number: s.tracking_number || null,
      tracking_url: s.tracking_url || null,
      item_count: s.item_count,
    })),
  }
}
