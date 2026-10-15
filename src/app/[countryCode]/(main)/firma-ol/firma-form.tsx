"use client"

import { useEffect, useState } from "react"
import { listSellerContracts, submitApplication } from "@lib/data/reseller"
import SellerContracts, { SellerContract } from "@modules/common/components/seller-contracts"

/**
 * Firma (satıcı) başvuru formu (/firma-ol) — "Firmamız Ol": kendi mağazasında
 * ÜRÜN satan, hizmeti kendi yürüten firma. Başvuru /store/reseller-applications
 * ucuna application_type:"firma" ile gönderilir; onaylanınca satıcıya dönüşür.
 * Sade hızlı-kayıt formu: alanlar alt alta; e-posta backend'de zorunlu olduğu
 * için formda tutulur. Telefon, seçilen ülke koduyla birlikte gönderilir.
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

export default function FirmaForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    offering: "",
    website: "",
    taxId: "",
    taxOffice: "",
  })
  const [dialCode, setDialCode] = useState("+90")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const [contracts, setContracts] = useState<SellerContract[]>([])
  const [accepted, setAccepted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    listSellerContracts()
      .then(setContracts)
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
      !formData.offering ||
      !formData.taxId
    ) {
      alert("Lütfen zorunlu alanları doldurun.")
      return
    }
    if (!accepted) {
      alert("Devam etmek için firma sözleşmelerini okuyup onaylamanız gerekmektedir.")
      return
    }

    setStatus("loading")
    try {
      const res = await submitApplication({
        kind: "company",
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: `${dialCode} ${formData.phone.trim()}`,
        taxId: formData.taxId,
        taxOffice: formData.taxOffice,
        city: formData.address,
        note: [
          `Adres: ${formData.address.trim()}`,
          `Satış / Hizmet: ${formData.offering.trim()}`,
          formData.website.trim() ? `Web sitesi: ${formData.website.trim()}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        contracts,
      })
      if (!res.success) {
        setErrorMessage(res.error)
        throw new Error(res.error || "Başvuru gönderilemedi.")
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
        taxId: "",
        taxOffice: "",
      })
      setDialCode("+90")
    } catch (err) {
      console.error("Failed to submit firma application", err)
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
          Firma başvurunuz tarafımıza ulaştı. Size en iyi hizmeti sunabilmek
          için başvurunuzu olabildiğince dikkatli değerlendirecek, mağaza
          açılışı için en kısa sürede sizinle iletişime geçeceğiz.
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
          Firma Adı <span className="text-brand-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={status === "loading"}
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
          placeholder="Örn: Demir Yapı Mühendislik A.Ş."
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
          placeholder="info@firma.com"
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
          placeholder="Örn: Afet çantası ve ilk yardım seti satışı; bina güçlendirme keşif hizmeti"
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

      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1.5">
            Vergi No / TC Kimlik No <span className="text-brand-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            value={formData.taxId}
            disabled={status === "loading"}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            placeholder="10 haneli VKN ya da 11 haneli TCKN"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1.5">
            Vergi Dairesi
          </label>
          <input
            type="text"
            value={formData.taxOffice}
            disabled={status === "loading"}
            onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <SellerContracts
        contracts={contracts}
        accepted={accepted}
        setAccepted={setAccepted}
        disabled={status === "loading"}
        title="Firma Sözleşmeleri"
      />

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
          {errorMessage || "Başvuru gönderilemedi. Lütfen tekrar deneyin veya bizimle iletişime geçin."}
        </p>
      )}
    </form>
  )
}
