"use client"

import { useState } from "react"

/**
 * Firma (satıcı) başvuru formu (/firma-ol) — "Firmamız Ol": kendi mağazasında
 * ÜRÜN satan, hizmeti kendi yürüten firma. Başvuru /store/reseller-applications
 * ucuna application_type:"firma" ile gönderilir; onaylanınca satıcıya dönüşür.
 * Bayilik formundan (reseller-form) türetilmiştir; sözleşme adımı yoktur.
 */
export default function FirmaForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    taxOfficeNumber: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    sector: "",
    message: "",
  })
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.companyName ||
      !formData.contactName ||
      !formData.email ||
      !formData.phone
    ) {
      alert("Lütfen zorunlu alanları doldurun.")
      return
    }

    setStatus("loading")
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

      // Başvuru türü artık `application_type: "firma"` alanıyla ayrışıyor; mesaja
      // faaliyet alanı + serbest metin ekliyoruz.
      const composedMessage = [
        formData.sector ? `Ürün grupları / faaliyet alanı: ${formData.sector}` : null,
        formData.message || null,
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
          phone: formData.phone,
          city: formData.city,
          tax_number: formData.taxOfficeNumber,
          message: composedMessage,
          application_type: "firma",
        }),
      })

      if (!res.ok) {
        throw new Error("Başvuru gönderilemedi.")
      }

      setStatus("success")
      setFormData({
        companyName: "",
        taxOfficeNumber: "",
        contactName: "",
        email: "",
        phone: "",
        city: "",
        sector: "",
        message: "",
      })
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
          Firma başvurunuz tarafımıza ulaştı. Ekibimiz değerlendirip mağaza
          açılışı için en kısa sürede sizinle iletişime geçecek.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Firma Ünvanı <span className="text-brand-500">*</span>
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
          <label className={labelCls}>Vergi Dairesi / No</label>
          <input
            type="text"
            disabled={status === "loading"}
            value={formData.taxOfficeNumber}
            onChange={(e) =>
              setFormData({ ...formData, taxOfficeNumber: e.target.value })
            }
            placeholder="Örn: Kadıköy V.D / 1234567890"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Yetkili Adı Soyadı <span className="text-brand-500">*</span>
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
            Şehir <span className="text-brand-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={status === "loading"}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Örn: İstanbul"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            Telefon Numarası <span className="text-brand-500">*</span>
          </label>
          <input
            type="tel"
            required
            disabled={status === "loading"}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Örn: 0212 000 0000"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Ürün Grupları / Faaliyet Alanı</label>
        <input
          type="text"
          disabled={status === "loading"}
          value={formData.sector}
          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
          placeholder="Örn: Afet çantası / İlk yardım / Aydınlatma"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Ürünleriniz / Ek Bilgiler</label>
        <textarea
          rows={4}
          disabled={status === "loading"}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Satmak istediğiniz ürün grupları, markanız ve aylık tahmini satış hacminiz; varsa ürüne bağlı sunduğunuz hizmet hakkında kısaca bilgi verin."
          className={`${inputCls} resize-none`}
        ></textarea>
      </div>

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
          "Firma Başvurusunu Gönder"
        )}
      </button>

      {status === "error" && (
        <p className="text-sm text-brand-600 text-center">
          Başvuru gönderilemedi. Lütfen tekrar deneyin veya bizimle iletişime
          geçin.
        </p>
      )}
    </form>
  )
}
