"use client"

import { useEffect, useState } from "react"

type SellerContract = {
  id: string
  title: string
  version: number
  body: string
  required?: boolean
}

/**
 * Bayilik (hizmet ortaklığı) başvuru formu (/satici-ol). Firma formuyla aynı
 * sade yapı: alanlar alt alta, telefon ülke koduyla gönderilir; adres/hizmet/
 * web sitesi backend şemasında ayrı alan olmadığından message içinde etiketli
 * satırlar olarak iletilir. Bayiliğe özgü sözleşme onayı bölümü korunur.
 */

const DIAL_CODES = [
  { code: "+90", label: "🇹🇷 +90" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+31", label: "🇳🇱 +31" },
  { code: "+994", label: "🇦🇿 +994" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+971", label: "🇦🇪 +971" },
]

export default function ResellerForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    offering: "",
    website: "",
  })
  const [dialCode, setDialCode] = useState("+90")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  // Pazaryeri sözleşmeleri — başvuru öncesi okunup kabul edilmesi gerekir.
  const [contracts, setContracts] = useState<SellerContract[]>([])
  const [accepted, setAccepted] = useState(false)
  const [viewing, setViewing] = useState<SellerContract | null>(null)

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    fetch(`${backendUrl}/store/seller-contracts`, {
      headers: { "x-publishable-api-key": publishableKey },
    })
      .then((r) => (r.ok ? r.json() : { contracts: [] }))
      .then((d) => setContracts(d.contracts || []))
      .catch(() => setContracts([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.companyName ||
      !formData.contactName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.offering
    ) {
      alert("Lütfen zorunlu alanları doldurun.")
      return
    }
    if (contracts.length > 0 && !accepted) {
      alert(
        "Devam etmek için bayilik sözleşmelerini okuyup onaylamanız gerekmektedir."
      )
      return
    }

    setStatus("loading")
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

      const composedMessage = [
        `Adres: ${formData.address.trim()}`,
        `Satış / Hizmet: ${formData.offering.trim()}`,
        formData.website.trim()
          ? `Web sitesi: ${formData.website.trim()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")

      const res = await fetch(`${backendUrl}/store/reseller-applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          company_name: formData.companyName,
          applicant_name: formData.contactName,
          email: formData.email,
          phone: `${dialCode} ${formData.phone.trim()}`,
          message: composedMessage,
          // Başvuru anında sözleşmelerin okunup kabul edildiği beyanı + sürümleri.
          contracts_accepted: contracts.length > 0 ? accepted : undefined,
          contracts_versions: contracts.map((c) => ({
            id: c.id,
            title: c.title,
            version: c.version,
          })),
        }),
      })

      if (!res.ok) {
        throw new Error("Başvuru gönderilemedi.")
      }

      setStatus("success")
      setFormData({
        companyName: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        offering: "",
        website: "",
      })
      setDialCode("+90")
    } catch (err) {
      console.error("Failed to submit seller application", err)
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl animate-bounce">
          ✓
        </div>
        <h3 className="text-lg font-bold text-ui-fg-base mb-2">
          Başvurunuz Alındı!
        </h3>
        <p className="text-sm text-ui-fg-subtle max-w-sm">
          Bayilik başvurunuz başarıyla tarafımıza ulaştı. Ekibimiz başvurunuzu
          değerlendirip en kısa sürede sizinle iletişime geçecek.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          Yeni Bir Başvuru Yap
        </button>
      </div>
    )
  }

  const inputCls =
    "w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
  const labelCls =
    "block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>
          Firma / İşletme Adı <span className="text-brand-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={status === "loading"}
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          placeholder="Örn: Demir Outdoor Ekipmanları"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>
          Firma Sahibi / Yetkili Kişi Adı Soyadı{" "}
          <span className="text-brand-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={status === "loading"}
          value={formData.contactName}
          onChange={(e) =>
            setFormData({ ...formData, contactName: e.target.value })
          }
          placeholder="Örn: Hakan Demir"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>
          Telefon Numarası <span className="text-brand-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            disabled={status === "loading"}
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
            aria-label="Ülke kodu"
            className="border border-ui-border-base rounded-lg px-2 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shrink-0"
          >
            {DIAL_CODES.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            required
            disabled={status === "loading"}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Örn: 532 000 00 00"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          E-Posta Adresi <span className="text-brand-500">*</span>
        </label>
        <input
          type="email"
          required
          disabled={status === "loading"}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="bayi@example.com"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>
          Adres <span className="text-brand-500">*</span>
        </label>
        <textarea
          rows={2}
          required
          disabled={status === "loading"}
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Örn: Cumhuriyet Mah. Deprem Cad. No:1 Kadıköy / İstanbul"
          className={`${inputCls} resize-none`}
        ></textarea>
      </div>

      <div>
        <label className={labelCls}>
          Ne Satıyor / Ne Hizmeti Veriyor{" "}
          <span className="text-brand-500">*</span>
        </label>
        <textarea
          rows={3}
          required
          disabled={status === "loading"}
          value={formData.offering}
          onChange={(e) =>
            setFormData({ ...formData, offering: e.target.value })
          }
          placeholder="Örn: Karbon fiber güçlendirme, kurulum, keşif hizmeti; çalışma bölgeniz"
          className={`${inputCls} resize-none`}
        ></textarea>
      </div>

      <div>
        <label className={labelCls}>Web Sitesi Linki</label>
        <input
          type="text"
          disabled={status === "loading"}
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          placeholder="Örn: www.firma.com (opsiyonel)"
          className={inputCls}
        />
      </div>

      {contracts.length > 0 && (
        <div className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle">
          <p className="text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-2">
            Bayilik Sözleşmeleri <span className="text-brand-500">*</span>
          </p>
          <p className="text-xs text-ui-fg-subtle mb-3">
            Bayi olmak için aşağıdaki sözleşmeleri okuyup onaylamanız
            gerekmektedir. Başvurunuz onaylandıktan sonra bayilik panelinde, kimlik
            ve IP bilgilerinizle birlikte bağlayıcı dijital onayınız ayrıca alınır.
          </p>
          <ul className="space-y-1.5 mb-3">
            {contracts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-ui-fg-base">{c.title}</span>
                <button
                  type="button"
                  onClick={() => setViewing(c)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline shrink-0"
                >
                  Görüntüle
                </button>
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              disabled={status === "loading"}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
            />
            <span className="text-sm text-ui-fg-base">
              Yukarıdaki sözleşmeleri okudum, anladım ve kabul ediyorum.
            </span>
          </label>
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-ui-bg-base rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-3">
              <h4 className="text-sm font-bold text-ui-fg-base pr-4">
                {viewing.title}{" "}
                <span className="text-ui-fg-subtle font-normal">
                  (v{viewing.version})
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label="Kapat"
                className="text-ui-fg-subtle hover:text-ui-fg-base text-xl leading-none shrink-0"
              >
                ×
              </button>
            </div>
            <div
              className="overflow-y-auto px-5 py-4 prose prose-sm max-w-none text-sm leading-relaxed [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-1 [&_h3]:font-semibold [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: viewing.body }}
            />
            <div className="border-t border-ui-border-base px-5 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-5 rounded-lg text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Başvuru Alınıyor...
          </>
        ) : (
          "Gönder"
        )}
      </button>

      {status === "error" && (
        <p className="text-sm text-brand-600 text-center">
          Başvuru gönderilemedi. Lütfen tekrar deneyin veya bizimle iletişime geçin.
        </p>
      )}
    </form>
  )
}
