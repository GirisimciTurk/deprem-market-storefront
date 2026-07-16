"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import StockAlertButton from "../stock-alert-button"
import { useRouter } from "next/navigation"
import { getProductPrice } from "@lib/util/get-product-price"
import { track } from "@lib/util/analytics"
import InstallmentCargoInfo from "../installment-cargo-info"
import ServiceRequestButton from "./service-request-button"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  // "Hizmet verilebilir" ürünlerde talep formunu ön-doldurmak için (giriş yapmış müşteri).
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  defaultName,
  defaultEmail,
  defaultPhone,
}: ProductActionsProps) {
  const router = useRouter()
  const isServiceable = (product.metadata as Record<string, unknown> | null)?.is_serviceable === true
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () => {
      if (product.variants && product.variants.length > 0) {
        return optionsAsKeymap(product.variants[0].options) ?? {}
      }
      return {}
    }
  )
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // Reset options only when switching to a completely different product page
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.id])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // "Son X adet" aciliyeti — yalnız stok yönetilen ve backorder'sız varyantta anlamlı.
  const remainingStock = useMemo(() => {
    if (selectedVariant?.manage_inventory && !selectedVariant?.allow_backorder) {
      return selectedVariant?.inventory_quantity ?? 0
    }
    return null
  }, [selectedVariant])
  const LOW_STOCK_THRESHOLD = 10
  const isLowStock =
    inStock &&
    remainingStock !== null &&
    remainingStock > 0 &&
    remainingStock <= LOW_STOCK_THRESHOLD

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    // Davranış izleme: sepete ekleme (fire-and-forget, hata yutulur)
    track("add_to_cart", {
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: 1,
      value: priceObj?.calculated_price_number
        ? Math.round(priceObj.calculated_price_number * 100)
        : null,
      currency_code: priceObj?.currency_code ?? null,
    })

    setIsAdding(false)
  }

  const activeSku =
    selectedVariant?.sku || product.variants?.[0]?.sku || null
  const activeBarcode =
    selectedVariant?.barcode || product.variants?.[0]?.barcode || null

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })

  const priceObj = selectedVariant ? variantPrice : cheapestPrice
  const priceValue = priceObj?.calculated_price_number || 0

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {/* SKU / Barkod — yalnızca gerçek değer varsa gösterilir */}
        {(activeSku || activeBarcode) && (
          <div className="flex flex-col gap-y-1 text-sm text-gray-500 font-medium border-t border-gray-150 pt-2">
            {activeSku && (
              <div>
                <span className="text-gray-400">Ürün Kodu:</span>{" "}
                <span className="text-gray-700 font-semibold">{activeSku}</span>
              </div>
            )}
            {activeBarcode && (
              <div>
                <span className="text-gray-400">Barkod:</span>{" "}
                <span className="text-gray-700 font-semibold">{activeBarcode}</span>
              </div>
            )}
          </div>
        )}

        <ProductPrice product={product} variant={selectedVariant} />

        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      variants={product.variants}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Aciliyet: stok azaldıysa "son X adet" uyarısı (deprem nişinde dönüşüm). */}
        {isLowStock && (
          <div
            className="flex items-center gap-x-2 text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2"
            role="status"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
            </span>
            Son {remainingStock} adet — stoklar tükenmek üzere!
          </div>
        )}

        {/* Geçerli varyant seçili ve tükendiyse: "Sepete Ekle" yerine doğrudan
            "Stoğa gelince haber ver" butonu göster. */}
        {selectedVariant && isValidVariant && !inStock ? (
          <StockAlertButton
            variantId={selectedVariant.id}
            productId={product.id}
            productHandle={product.handle ?? undefined}
            productTitle={product.title}
          />
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md transition-colors"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Seçenek Belirleyin"
              : !inStock || !isValidVariant
              ? "Tükendi"
              : "Sepete Ekle"}
          </Button>
        )}
        {/* Hizmet verilebilir ürün: "Ürün + Hizmet Al" — ürünü sepete ekler ve hizmet
            talebi açar (havuz). Müşteri hesaptan foto/video yükler ya da keşif ister. */}
        {isServiceable && (
          <ServiceRequestButton
            product={product}
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            defaultPhone={defaultPhone}
            onAddToCart={handleAddToCart}
          />
        )}
        <InstallmentCargoInfo price={priceValue / 100} />
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
