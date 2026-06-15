"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import {
  listReturnReasons,
  createReturnRequest,
  type StoreReturnReason,
} from "@lib/data/returns"

type Props = {
  order: HttpTypes.StoreOrder
}

// İade yalnızca kargolanmış/teslim edilmiş siparişler için mantıklı.
const RETURNABLE_STATUSES = [
  "shipped",
  "partially_shipped",
  "delivered",
  "partially_delivered",
]

type Selection = Record<string, { checked: boolean; quantity: number }>

const ReturnRequest = ({ order }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reasons, setReasons] = useState<StoreReturnReason[]>([])
  const [reasonId, setReasonId] = useState<string>("")
  const [note, setNote] = useState("")
  const [selection, setSelection] = useState<Selection>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const items = order.items ?? []
  const eligible = RETURNABLE_STATUSES.includes(order.fulfillment_status ?? "")

  useEffect(() => {
    if (open && reasons.length === 0) {
      listReturnReasons().then(setReasons)
    }
  }, [open, reasons.length])

  const toggle = (id: string, max: number) =>
    setSelection((s) => ({
      ...s,
      [id]: { checked: !s[id]?.checked, quantity: s[id]?.quantity || max },
    }))

  const setQty = (id: string, qty: number) =>
    setSelection((s) => ({ ...s, [id]: { checked: true, quantity: qty } }))

  const chosen = items
    .filter((i) => selection[i.id]?.checked)
    .map((i) => ({
      id: i.id,
      quantity: Math.min(selection[i.id]?.quantity || 1, i.quantity),
      reason_id: reasonId || undefined,
    }))

  const submit = async () => {
    if (!chosen.length) {
      setResult({ ok: false, msg: "Lütfen iade etmek istediğiniz en az bir ürün seçin." })
      return
    }
    setSubmitting(true)
    setResult(null)
    const res = await createReturnRequest(order.id, chosen, note || undefined)
    setSubmitting(false)
    if (res.success) {
      setResult({
        ok: true,
        msg: "İade talebiniz alındı! Onay e-postası gönderildi. Ürünleri teslim aldığımızda ücret iadeniz başlatılacaktır.",
      })
      setOpen(false)
      setSelection({})
      setReasonId("")
      setNote("")
      router.refresh()
    } else {
      setResult({ ok: false, msg: res.error || "İade talebi oluşturulamadı." })
    }
  }

  if (!eligible) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4 my-2">
      <Divider />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base-semi">İade Talebi</h2>
          <p className="text-small-regular text-ui-fg-subtle">
            Üründen memnun kalmadıysanız iade talebi oluşturabilirsiniz.
          </p>
        </div>
        {!open && (
          <Button variant="secondary" onClick={() => setOpen(true)} data-testid="open-return-button">
            İade Talebi Oluştur
          </Button>
        )}
      </div>

      {result && (
        <div
          className={`text-small-regular rounded-rounded p-3 ${
            result.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-brand-50 text-brand-700 border border-brand-200"
          }`}
          data-testid="return-result"
        >
          {result.msg}
        </div>
      )}

      {open && (
        <div className="flex flex-col gap-y-4 bg-ui-bg-subtle rounded-rounded p-4">
          <div className="flex flex-col gap-y-2">
            <span className="text-small-semi">İade edilecek ürünler</span>
            {items.map((item) => {
              const sel = selection[item.id]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-x-3 bg-white rounded-rounded p-2 border border-ui-border-base"
                >
                  <input
                    type="checkbox"
                    checked={!!sel?.checked}
                    onChange={() => toggle(item.id, item.quantity)}
                    aria-label={`${item.product_title || item.title} iade et`}
                  />
                  <div className="flex-1">
                    <div className="text-small-regular">{item.product_title || item.title}</div>
                    {item.variant_title && (
                      <div className="text-xsmall-regular text-ui-fg-subtle">
                        {item.variant_title}
                      </div>
                    )}
                  </div>
                  <label className="text-xsmall-regular text-ui-fg-subtle">Adet</label>
                  <select
                    className="border border-ui-border-base rounded-rounded px-2 py-1 text-small-regular"
                    value={sel?.quantity || item.quantity}
                    disabled={!sel?.checked}
                    onChange={(e) => setQty(item.id, Number(e.target.value))}
                  >
                    {Array.from({ length: item.quantity }, (_, n) => n + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-xsmall-regular text-ui-fg-muted">/ {item.quantity}</span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-y-1">
            <label className="text-small-semi" htmlFor="return-reason">
              İade sebebi
            </label>
            <select
              id="return-reason"
              className="border border-ui-border-base rounded-rounded px-3 py-2 text-small-regular bg-white"
              value={reasonId}
              onChange={(e) => setReasonId(e.target.value)}
            >
              <option value="">Sebep seçin (opsiyonel)</option>
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-y-1">
            <label className="text-small-semi" htmlFor="return-note">
              Açıklama (opsiyonel)
            </label>
            <textarea
              id="return-note"
              className="border border-ui-border-base rounded-rounded px-3 py-2 text-small-regular bg-white"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="İade ile ilgili eklemek istedikleriniz..."
            />
          </div>

          <div className="flex items-center gap-x-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false)
                setResult(null)
              }}
              disabled={submitting}
            >
              Vazgeç
            </Button>
            <Button onClick={submit} isLoading={submitting} data-testid="submit-return-button">
              İade Talebini Gönder
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReturnRequest
