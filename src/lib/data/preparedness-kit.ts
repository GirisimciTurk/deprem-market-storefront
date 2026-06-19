"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { listProducts } from "./products"

export type KitItem = {
  product: HttpTypes.StoreProduct
  quantity: number
  reason: string
}

export type KitResult = {
  answer: string
  items: KitItem[]
  recommendSurvey: boolean
  surveyReason: string
  disabled?: boolean
  error?: string
}

type RawRec = {
  answer?: string
  items?: { product_id: string; quantity: number; reason: string }[]
  recommend_survey?: boolean
  survey_reason?: string
  disabled?: boolean
  error?: string
}

const empty = (extra: Partial<KitResult> = {}): KitResult => ({
  answer: "",
  items: [],
  recommendSurvey: false,
  surveyReason: "",
  ...extra,
})

/**
 * Deprem Hazırlık & Güvenlik Asistanı: serbest metinden ya ürün seti önerir ya da
 * güvenlik rehberliği verir; yapısal konularda keşfe yönlendirir.
 * (1) backend /store/preparedness-kit yanıtı (answer + ürün id'leri + keşif bayrağı);
 * (2) id'lerle tam ürünler (fiyat/region) çekilir; (3) adet/gerekçe eşlenir.
 */
export async function getPreparednessKit(
  need: string,
  countryCode: string
): Promise<KitResult> {
  let rec: RawRec
  try {
    rec = await sdk.client.fetch<RawRec>("/store/preparedness-kit", {
      method: "POST",
      body: { need },
    })
  } catch (e) {
    return empty({ error: "Asistan şu an yanıt veremedi. Lütfen tekrar deneyin." })
  }

  const base = empty({
    answer: rec.answer ?? "",
    recommendSurvey: !!rec.recommend_survey,
    surveyReason: rec.survey_reason ?? "",
    disabled: rec.disabled,
    error: rec.error,
  })

  const recItems = rec.items ?? []
  if (recItems.length === 0) {
    return base
  }

  const ids = recItems.map((i) => i.product_id)
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { id: ids, limit: ids.length } as HttpTypes.StoreProductListParams,
  })

  const byId = new Map(products.map((p) => [p.id, p]))
  const items: KitItem[] = recItems
    .map((i) => {
      const product = byId.get(i.product_id)
      if (!product) return null
      return { product, quantity: Math.max(1, Number(i.quantity) || 1), reason: i.reason || "" }
    })
    .filter((x): x is KitItem => x !== null)

  return { ...base, items }
}
