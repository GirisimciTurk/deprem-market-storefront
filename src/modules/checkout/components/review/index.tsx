"use client"

import { Heading, clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedKvkk, setAgreedKvkk] = useState(false)

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          İnceleme
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <div className="flex flex-col gap-y-4">
          <div className="flex items-start gap-x-3 w-full p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ui-border-base text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="agree-terms" className="text-small-regular text-ui-fg-subtle cursor-pointer select-none">
              <LocalizedClientLink
                href="/on-bilgilendirme-formu"
                target="_blank"
                className="text-brand-600 hover:underline font-semibold"
              >
                Ön Bilgilendirme Formu
              </LocalizedClientLink>{" "}
              ve{" "}
              <LocalizedClientLink
                href="/mesafeli-satis-sozlesmesi"
                target="_blank"
                className="text-brand-600 hover:underline font-semibold"
              >
                Mesafeli Satış Sözleşmesi
              </LocalizedClientLink>
              'ni okudum, kabul ediyorum.
            </label>
          </div>

          <div className="flex items-start gap-x-3 w-full p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
            <input
              type="checkbox"
              id="agree-kvkk"
              checked={agreedKvkk}
              onChange={(e) => setAgreedKvkk(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ui-border-base text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="agree-kvkk" className="text-small-regular text-ui-fg-subtle cursor-pointer select-none">
              Kişisel verilerimin işlenmesine ilişkin{" "}
              <LocalizedClientLink
                href="/kvkk"
                target="_blank"
                className="text-brand-600 hover:underline font-semibold"
              >
                KVKK Aydınlatma Metni
              </LocalizedClientLink>
              'ni okudum, kabul ediyorum.
            </label>
          </div>

          <PaymentButton
            cart={cart}
            disabled={!agreedTerms || !agreedKvkk}
            data-testid="submit-order-button"
          />
        </div>
      )}
    </div>
  )
}

export default Review
