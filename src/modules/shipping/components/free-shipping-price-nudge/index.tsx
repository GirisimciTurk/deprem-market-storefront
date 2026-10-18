"use client"

import { CircleCheck, X } from "lucide-react"
import { convertToLocale } from "@lib/util/money"
import { StoreCart } from "types/store"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, clx } from "@modules/common/components/ui"
import { useState } from "react"
import {
  pickFreeShippingTarget,
  type FreeShippingTarget,
  type ShippingQuote,
} from "@lib/util/free-shipping"

// Ücretsiz kargo hedefi dtm'nin kargo teklifinden gelir: her satıcının kendi
// eşiği (free_shipping_threshold) o satıcının sepetteki ara toplamına uygulanır.
export default function ShippingPriceNudge({
  variant = "inline",
  cart,
  quote,
}: {
  variant?: "popup" | "inline"
  cart: StoreCart
  quote: ShippingQuote | null
}) {
  const target = pickFreeShippingTarget(quote)
  if (!cart || !quote || !target) {
    return null
  }
  const perSeller = quote.sellers.length > 1

  if (variant === "popup") {
    return <FreeShippingPopup cart={cart} target={target} perSeller={perSeller} />
  }

  return <FreeShippingInline cart={cart} target={target} perSeller={perSeller} />
}

function Remaining({ cart, target }: { cart: StoreCart; target: FreeShippingTarget }) {
  return (
    <>
      {convertToLocale({
        amount: target.target_remaining,
        currency_code: cart.currency_code,
      })}
    </>
  )
}

/** "«Mağaza» için" — hedef bir mağazaya aitse adı (sayfasına bağlantılı). */
function StoreName({ target, className }: { target: FreeShippingTarget; className?: string }) {
  if (!target.seller_name) return null
  return (
    <>
      «
      {target.seller_handle ? (
        <LocalizedClientLink
          href={`/satici/${encodeURIComponent(target.seller_handle)}`}
          className={clx("underline underline-offset-2", className)}
        >
          {target.seller_name}
        </LocalizedClientLink>
      ) : (
        <span className={className}>{target.seller_name}</span>
      )}
      » için{" "}
    </>
  )
}

function FreeShippingInline({
  cart,
  target,
  perSeller,
}: {
  cart: StoreCart
  target: FreeShippingTarget
  perSeller: boolean
}) {
  return (
    <div className="bg-neutral-100 p-2 rounded-lg border">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-600">
          <div>
            {target.target_reached ? (
              <div className="flex items-center gap-1.5">
                <CircleCheck size={16} className="text-green-500 inline-block" />
                Ücretsiz kargo açıldı!
              </div>
            ) : target.seller_name ? (
              <>
                <StoreName target={target} className="text-neutral-950" />
                ücretsiz kargoya
              </>
            ) : (
              "Ücretsiz kargo kazan"
            )}
          </div>

          <div
            className={clx("visible", {
              "opacity-0 invisible": target.target_reached,
            })}
          >
            <span className="text-neutral-950">
              <Remaining cart={cart} target={target} />
            </span>{" "}
            kaldı
          </div>
        </div>
        <div className="flex justify-between gap-1">
          <div
            className={clx(
              "bg-gradient-to-r from-zinc-400 to-zinc-500 h-1 rounded-full max-w-full duration-500 ease-in-out",
              {
                "from-green-400 to-green-500": target.target_reached,
              }
            )}
            style={{ width: `${target.remaining_percentage}%` }}
          ></div>
          <div className="bg-neutral-300 h-1 rounded-full w-fit flex-grow"></div>
        </div>
        {perSeller && (
          <p className="text-[11px] text-neutral-500">
            Ücretsiz kargo eşiği her satıcının kendi ürünlerine ayrı uygulanır.
          </p>
        )}
      </div>
    </div>
  )
}

function FreeShippingPopup({
  cart,
  target,
  perSeller,
}: {
  cart: StoreCart
  target: FreeShippingTarget
  perSeller: boolean
}) {
  const [isClosed, setIsClosed] = useState(false)

  return (
    <div
      className={clx(
        "fixed bottom-5 right-5 flex flex-col items-end gap-2 transition-all duration-500 ease-in-out z-10",
        {
          "opacity-0 invisible delay-1000": target.target_reached,
          "opacity-0 invisible": isClosed,
          "opacity-100 visible": !target.target_reached && !isClosed,
        }
      )}
    >
      <div>
        <Button
          className="rounded-full bg-neutral-900 shadow-none outline-none border-none text-[15px] p-2"
          onClick={() => setIsClosed(true)}
          aria-label="Kapat"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="w-[calc(100vw-2.5rem)] max-w-[400px] bg-black text-white p-6 rounded-lg ">
        <div className="pb-4">
          <div className="space-y-3">
            <div className="flex justify-between text-[15px] text-neutral-400">
              <div>
                {target.target_reached ? (
                  <div className="flex items-center gap-1.5">
                    <CircleCheck size={16} className="text-green-500 inline-block" />{" "}
                    Ücretsiz kargo açıldı!
                  </div>
                ) : (
                  "Ücretsiz kargo kazan"
                )}
              </div>

              <div
                className={clx("visible", {
                  "opacity-0 invisible": target.target_reached,
                })}
              >
                <StoreName target={target} className="text-white" />
                {target.seller_name ? "ücretsiz kargoya" : "Ücretsiz kargoya"}{" "}
                <span className="text-white">
                  <Remaining cart={cart} target={target} />
                </span>{" "}
                kaldı
              </div>
            </div>
            <div className="flex justify-between gap-1">
              <div
                className={clx(
                  "bg-gradient-to-r from-zinc-400 to-zinc-500 h-1.5 rounded-full max-w-full duration-500 ease-in-out",
                  {
                    "from-green-400 to-green-500": target.target_reached,
                  }
                )}
                style={{ width: `${target.remaining_percentage}%` }}
              ></div>
              <div className="bg-zinc-600 h-1.5 rounded-full w-fit flex-grow"></div>
            </div>
            {perSeller && (
              <p className="text-xs text-neutral-400">
                Sepetinizde birden çok satıcı var; ücretsiz kargo eşiği her
                satıcının kendi ürünlerine ayrı uygulanır.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <LocalizedClientLink
            className="rounded-2xl bg-transparent shadow-none outline-none border-[1px] border-white text-[15px] py-2.5 px-4"
            href="/cart"
          >
            Sepete git
          </LocalizedClientLink>

          <LocalizedClientLink
            className="flex-grow rounded-2xl bg-white text-neutral-950 shadow-none outline-none border-[1px] border-white text-[15px] py-2.5 px-4 text-center"
            href="/store"
          >
            Alışverişe devam et
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
