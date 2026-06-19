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

// Map Medusa fulfillment and payment status to Turkish user-friendly labels
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
    case "captured":
      return { text: "Ödendi", color: "green" }
    case "refunded":
      return { text: "İade Edildi", color: "grey" }
    case "canceled":
      return { text: "İptal Edildi", color: "red" }
    default:
      return { text: status, color: "grey" }
  }
}

export function getStatusSteps(orderObj: any): {
  currentStep: number
  isCanceled: boolean
  steps: TrackingStep[]
} {
  const isCanceled = orderObj.status === "canceled"
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
