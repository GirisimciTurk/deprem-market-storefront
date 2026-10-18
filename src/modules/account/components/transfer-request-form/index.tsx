"use client"
import { CircleCheck, CircleX } from "lucide-react"
import {
  cancelTransferRequest,
  createTransferRequest,
  type TransferRequestState,
} from "@lib/data/orders"
import { Button, Heading, IconButton, Input, Text } from "@modules/common/components/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useActionState, useEffect, useState } from "react"

const initial: TransferRequestState = { success: false, error: null, order: null, transfer: null }

/**
 * Sipariş devri talebi (gobit ADR 0450). Sipariş kodu tek başına bir siparişi
 * açmaz; talep yalnız bu tarayıcının jetonunu sakladığı siparişler (bu
 * tarayıcıdan verilen ya da e-postadaki bağlantıyla açılan) için çalışır.
 *
 * orderId verilirse form tek düğmedir ("Bu siparişi hesabıma ekle"): misafirin
 * e-postadaki bağlantıyla açtığı sipariş sayfası için.
 */
export default function TransferRequestForm({ orderId }: { orderId?: string }) {
  const [state, formAction] = useActionState(createTransferRequest, initial)
  const [dismissed, setDismissed] = useState(false)
  const [canceled, setCanceled] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    // Yeni bir sonuç geldiğinde bildirimi yeniden göster.
    setDismissed(false)
    setCanceled(false)
    setCancelError(null)
  }, [state])

  const cancel = async () => {
    if (!state.transfer) return
    setCanceling(true)
    setCancelError(null)
    const { success, error } = await cancelTransferRequest(state.transfer.id)
    setCanceling(false)
    if (success) setCanceled(true)
    else setCancelError(error)
  }

  const label = state.order?.display_id ? `#${state.order.display_id} numaralı sipariş` : "Sipariş"
  const expires = state.transfer?.expires_at
    ? new Date(state.transfer.expires_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null

  const result = (
    <>
      {!state.success && state.error && (
        <Text className={`text-base-regular text-brand-500 ${orderId ? "" : "text-right"}`}>{state.error}</Text>
      )}
      {state.success && !dismissed && (
        <div className="flex justify-between gap-x-4 p-4 bg-neutral-50 shadow-borders-base w-full self-stretch items-start">
          <div className="flex gap-x-2 items-start">
            <CircleCheck className="w-4 h-4 mt-1 shrink-0 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              {canceled ? (
                <Text className="text-neutral-950">{label} için devir talebi geri çekildi.</Text>
              ) : (
                <>
                  <Text className="text-neutral-950">{label} için devir talebi oluşturuldu.</Text>
                  <Text className="text-base-regular text-neutral-600">
                    Onay e-postası siparişin e-posta adresine gönderildi.
                    {expires ? ` Talep ${expires} tarihine kadar yanıt bekler.` : ""}
                  </Text>
                  {state.transfer && (
                    <Button
                      variant="transparent"
                      size="small"
                      className="w-fit px-0 underline"
                      onClick={cancel}
                      isLoading={canceling}
                      disabled={canceling}
                    >
                      Talebi geri çek
                    </Button>
                  )}
                  {cancelError && <Text className="text-base-regular text-brand-500">{cancelError}</Text>}
                </>
              )}
            </div>
          </div>
          <IconButton className="h-fit" onClick={() => setDismissed(true)} aria-label="Kapat">
            <CircleX className="w-4 h-4 text-neutral-500" />
          </IconButton>
        </div>
      )}
    </>
  )

  if (orderId) {
    return (
      <div className="flex flex-col gap-y-3 w-full" data-testid="claim-order">
        {!state.success && (
          <form action={formAction} className="flex flex-col gap-y-2">
            <input type="hidden" name="order_id" value={orderId} />
            <Text className="text-base-regular text-neutral-600">
              Bu siparişi hesabınızdaki siparişlerin arasına ekleyebilirsiniz. Siparişin e-posta adresine bir onay
              bağlantısı gönderilir; onaylandığında sipariş hesabınıza geçer.
            </Text>
            <SubmitButton variant="secondary" size="small" className="w-fit whitespace-nowrap">
              Bu siparişi hesabıma ekle
            </SubmitButton>
          </form>
        )}
        {result}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <Heading level="h3" className="!text-sm font-semibold text-neutral-950">
            Sipariş Aktarımı
          </Heading>
          <p className="text-small-regular text-neutral-500">
            Aradığınız siparişi bulamıyor musunuz?
            <br /> Bu tarayıcıdan verdiğiniz ya da e-postadaki bağlantıyla açtığınız bir siparişi hesabınıza
            bağlayın. Onay bağlantısı siparişin e-posta adresine gönderilir.
          </p>
        </div>
        <form action={formAction} className="flex flex-col gap-y-1 sm:items-end">
          <div className="flex flex-col gap-y-2 w-full">
            <Input className="w-full" name="order_id" placeholder="Sipariş numarası (ör. #1234)" />
            <SubmitButton variant="secondary" size="small" className="w-fit whitespace-nowrap self-end">
              Siparişi Aktar
            </SubmitButton>
          </div>
        </form>
      </div>
      {result}
    </div>
  )
}
