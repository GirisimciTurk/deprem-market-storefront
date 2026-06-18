import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-percentage-diff"
import { convertToLocale } from "./money"

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number
    original_amount: number
    currency_code: string
    calculated_price: {
      price_list_type: string
    }
  }
}

export const getPricesForVariant = (
  variant: VariantWithPrice,
  /** Ürün seviyesi manuel İndirimsiz Fiyat (TL major) — varyant metadata'sı yoksa fallback. */
  productCompareAt?: number | null
) => {
  if (!variant?.calculated_price?.calculated_amount) {
    return null
  }

  const calculated = variant.calculated_price.calculated_amount
  const nativeOriginal = variant.calculated_price.original_amount
  const currency = variant.calculated_price.currency_code

  // Manuel "İndirimsiz Fiyat" (compare_at_price): varyant metadata'sı öncelikli,
  // yoksa ürün seviyesi. MAJOR (TL) saklanır → calculated_amount minor (kuruş)
  // olduğu için ×100 ile aynı birime çevrilir.
  const compareAtRaw =
    (variant.metadata as Record<string, unknown> | null | undefined)?.compare_at_price ??
    productCompareAt ??
    null
  const compareAtMinor =
    compareAtRaw != null && !Number.isNaN(Number(compareAtRaw))
      ? Number(compareAtRaw) * 100
      : 0

  // Etkin orijinal fiyat: native "sale" (kampanya) ile manuel compare'in büyüğü.
  // Yalnız satış fiyatından büyükse üstü çizili gösterilir.
  const effectiveOriginal = Math.max(nativeOriginal, compareAtMinor)
  const originalAmount = effectiveOriginal > calculated ? effectiveOriginal : nativeOriginal

  return {
    calculated_price_number: calculated,
    calculated_price: convertToLocale({ amount: calculated, currency_code: currency }),
    original_price_number: originalAmount,
    original_price: convertToLocale({ amount: originalAmount, currency_code: currency }),
    currency_code: currency,
    price_type: variant.calculated_price.calculated_price.price_list_type,
    percentage_diff: getPercentageDiff(originalAmount, calculated),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  // Ürün seviyesi manuel İndirimsiz Fiyat (varyant metadata'sı yoksa fallback).
  const productCompareAt = (product.metadata as Record<string, unknown> | null | undefined)
    ?.compare_at_price as number | undefined

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant = (product.variants as VariantWithPrice[])
      .filter((v) => !!v.calculated_price)
      .sort((a, b) => {
        return (
          (a.calculated_price?.calculated_amount ?? 0) -
          (b.calculated_price?.calculated_amount ?? 0)
        )
      })[0]

    return getPricesForVariant(cheapestVariant, productCompareAt)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    ) as VariantWithPrice | undefined

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant, productCompareAt)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
