"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { listProducts } from "./products"

export type AssistantTurn = { role: "user" | "assistant"; content: string }

export type AssistantItem = {
  product: HttpTypes.StoreProduct
  quantity: number
  reason: string
}

export type AssistantResult = {
  /** Maskotun konuşma yanıtı (daima dolu). */
  reply: string
  /** Sohbette kart olarak gösterilecek ürünler. */
  items: AssistantItem[]
  /**
   * Yönlendirme hedefi (countryCode'suz). null = yönlendirme yok.
   * "" = ana sayfa, "store" = mağaza, "products/{handle}" = ürün detayı, vb.
   */
  navigateTo: string | null
  /** items bir set ve "Tümünü Sepete Ekle" gösterilsin mi. */
  addAllToCart: boolean
  /** Yapısal güvenlik → uzman keşfi önerisi. */
  recommendSurvey: boolean
  surveyReason: string
  disabled?: boolean
  error?: string
}

type RawAgent = {
  reply?: string
  navigate_path?: string
  open_product_id?: string
  products?: { product_id: string; quantity: number; reason: string }[]
  add_all_to_cart?: boolean
  recommend_survey?: boolean
  survey_reason?: string
  disabled?: boolean
  error?: string
}

/**
 * Maskot "Deprem Savaşçısı" site asistanı. Kullanıcı mesajı + kısa geçmiş + bulunduğu sayfa →
 * (1) backend /store/assistant'tan ham agent yanıtı (reply + ürün id'leri + yönlendirme);
 * (2) id'lerle tam ürünler (fiyat/region/görsel) çekilir; (3) yönlendirme hedefi çözülür.
 *
 * Tüm hatalarda güvenli bir yanıt döner (asla throw etmez) — widget'ı kilitlemesin.
 */
export async function askAssistant(input: {
  message: string
  history?: AssistantTurn[]
  path?: string | null
  countryCode: string
}): Promise<AssistantResult> {
  const base: AssistantResult = {
    reply: "",
    items: [],
    navigateTo: null,
    addAllToCart: false,
    recommendSurvey: false,
    surveyReason: "",
  }

  let raw: RawAgent
  try {
    raw = await sdk.client.fetch<RawAgent>("/store/assistant", {
      method: "POST",
      body: {
        message: input.message,
        history: (input.history ?? []).slice(-12),
        path: input.path ?? "",
      },
    })
  } catch (e) {
    return {
      ...base,
      reply: "Şu an sana ulaşamadım, az sonra tekrar dener misin? Bu sırada mağazaya göz atabilirsin.",
      navigateTo: null,
      error: "request_failed",
    }
  }

  const recItems = raw.products ?? []
  const openId = (raw.open_product_id ?? "").trim()

  // İhtiyaç duyulan tüm ürün id'lerini topla (öneri kartları + açılacak ürün).
  const idSet = new Set<string>()
  for (const it of recItems) if (it?.product_id) idSet.add(it.product_id)
  if (openId) idSet.add(openId)
  const ids = Array.from(idSet)

  let byId = new Map<string, HttpTypes.StoreProduct>()
  if (ids.length > 0) {
    try {
      const {
        response: { products },
      } = await listProducts({
        countryCode: input.countryCode,
        queryParams: { id: ids, limit: ids.length } as HttpTypes.StoreProductListParams,
      })
      byId = new Map(products.map((p) => [p.id as string, p]))
    } catch {
      byId = new Map()
    }
  }

  const items: AssistantItem[] = recItems
    .map((i) => {
      const product = byId.get(i.product_id)
      if (!product) return null
      return { product, quantity: Math.max(1, Number(i.quantity) || 1), reason: i.reason || "" }
    })
    .filter((x): x is AssistantItem => x !== null)

  // Yönlendirme hedefini çöz. Kullanıcı bir ürün AÇMAK istediyse (openId set) bu
  // niyet önceliklidir: çözülürse ürün sayfasına, çözülemezse mağazaya götür —
  // çakışan navigate_path'e DÜŞME (yoksa "X ürününü aç" diyene sessizce başka
  // sayfa açılırdı). Yalnız openId boşken navigate_path'i dikkate al.
  let navigateTo: string | null = null
  const openProduct = openId ? byId.get(openId) : undefined
  if (openId) {
    navigateTo = openProduct?.handle ? `products/${openProduct.handle}` : "store"
  } else {
    const nav = (raw.navigate_path ?? "").trim()
    if (nav) navigateTo = nav === "home" ? "" : nav
  }

  return {
    reply: (raw.reply ?? "").toString().trim(),
    items,
    navigateTo,
    addAllToCart: !!raw.add_all_to_cart && items.length > 0,
    recommendSurvey: !!raw.recommend_survey,
    surveyReason: (raw.survey_reason ?? "").toString().trim(),
    disabled: raw.disabled,
    error: raw.error,
  }
}
