"use client"

import { createServiceRequest } from "@lib/data/service-requests"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { Wrench } from "@medusajs/icons"
import { useState } from "react"

type Props = {
  product: HttpTypes.StoreProduct
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
  /** Ürünü de sepete ekler ("Ürün + Hizmet" akışı). Dönüş tipi serbest. */
  onAddToCart?: () => unknown
}

/**
 * "Hizmet verilebilir" (metadata.is_serviceable) ürünlerde gösterilen "Ürün + Hizmet Al" butonu.
 * Ürünü sepete ekler VE bir hizmet talebi açar (havuza düşer; otomatik atama yok). Müşteri ardından
 * hesabından fotoğraf/video yükler ya da keşif ister; bayiler buna göre fiyat verir.
 */
export default function ServiceRequestButton({
  product,
  defaultName,
  defaultEmail,
  defaultPhone,
  onAddToCart,
}: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: defaultName ?? "",
    email: defaultEmail ?? "",
    phone: defaultPhone ?? "",
    city: "",
    district: "",
    address: "",
    note: "",
  })

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const serviceKind = typeof meta.service_kind === "string" ? meta.service_kind : "other"
  const serviceDesc =
    typeof meta.service_description === "string" ? meta.service_description : ""

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrorMsg("Lütfen ad soyad, e-posta ve telefon alanlarını doldurun.")
      setStatus("error")
      return
    }
    setStatus("loading")
    setErrorMsg(null)
    const res = await createServiceRequest({
      product_id: product.id,
      service_title: product.title,
      service_kind: serviceKind,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
    })
    if (res.success) {
      // Ürünü de sepete ekle (Ürün + Hizmet). Sepet hatası talebi bozmasın.
      try {
        await onAddToCart?.()
      } catch {
        /* sessiz geç */
      }
      setStatus("success")
    } else {
      setStatus("error")
      setErrorMsg(res.error || "Talep gönderilemedi. Lütfen tekrar deneyin.")
    }
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
  const labelCls = "block text-xs font-bold text-gray-700 mb-1"

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setOpen(true)
          setStatus("idle")
          setErrorMsg(null)
        }}
        variant="secondary"
        className="w-full h-11 border-2 border-orange-600 text-orange-700 hover:bg-orange-50 font-bold rounded-lg transition-colors"
      >
        <Wrench className="w-4 h-4" /> Ürün + Hizmet Al
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-150">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Hizmet / Montaj Talebi</h3>
                <p className="text-sm text-gray-500 mt-0.5">{product.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            {status === "success" ? (
              <div className="px-5 py-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Hizmet talebiniz alındı!</h4>
                <p className="text-sm text-gray-600 mb-5">
                  Ürün sepetinize eklendi. Şimdi <strong>Hesabım → Hizmet Taleplerim</strong> bölümünden{" "}
                  <strong>fotoğraf/video yükleyin</strong> ya da <strong>keşif isteyin</strong>; bayilerimiz
                  buna göre fiyat versin.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Kapat
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-5 py-4 flex flex-col gap-3">
                {serviceDesc && (
                  <p className="text-sm text-gray-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                    {serviceDesc}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Ürünü hizmetle birlikte alın. Ürün sepete eklenir ve bir hizmet talebi açılır; ardından
                  hesabınızdan <strong>fotoğraf/video yükler</strong> ya da <strong>keşif istersiniz</strong>.
                  Bayiler buna göre fiyat verir, en uygun teklifi size iletiriz.
                </p>

                <div>
                  <label className={labelCls}>Ad Soyad *</label>
                  <input
                    className={inputCls}
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>E-posta *</label>
                    <input
                      className={inputCls}
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="ornek@eposta.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Telefon *</label>
                    <input
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>İl</label>
                    <input
                      className={inputCls}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>İlçe</label>
                    <input
                      className={inputCls}
                      value={form.district}
                      onChange={(e) => set("district", e.target.value)}
                      placeholder="Kadıköy"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Adres</label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Montaj/uygulama adresi"
                  />
                </div>
                <div>
                  <label className={labelCls}>Not / İstekler</label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                    placeholder="Eklemek istedikleriniz"
                  />
                </div>

                {status === "error" && errorMsg && (
                  <p className="text-sm text-red-600">{errorMsg}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={status === "loading"}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg mt-1"
                >
                  {status === "loading" ? "Gönderiliyor…" : "Talebi Gönder"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
