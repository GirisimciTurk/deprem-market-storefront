"use client"

import { useState } from "react"

export default function ResellerForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    taxOfficeNumber: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  })
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      try {
        const existing = JSON.parse(
          localStorage.getItem("reseller-applications") || "[]"
        )
        const newApp = {
          id: "reseller-" + Date.now(),
          ...formData,
          date: new Date().toLocaleString("tr-TR"),
          status: "pending",
        }
        localStorage.setItem(
          "reseller-applications",
          JSON.stringify([newApp, ...existing])
        )
      } catch (err) {
        console.error("Failed to save reseller application", err)
      }

      setStatus("success")
      setFormData({
        companyName: "",
        taxOfficeNumber: "",
        contactName: "",
        email: "",
        phone: "",
        city: "",
        message: "",
      })
    }, 1500)
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
          Bayilik ön başvurunuz başarıyla tarafımıza iletilmiştir. Kurumsal
          müşteri temsilcimiz sizinle en kısa sürede iletişime geçecektir.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          Yeni Bir Başvuru Yap
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            Firma Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={status === "loading"}
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            placeholder="Örn: EKYP Ticaret Ltd."
            className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            Vergi Dairesi / No
          </label>
          <input
            type="text"
            disabled={status === "loading"}
            value={formData.taxOfficeNumber}
            onChange={(e) =>
              setFormData({ ...formData, taxOfficeNumber: e.target.value })
            }
            placeholder="Örn: Kadıköy V.D / 1234567890"
            className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            Yetkili Adı Soyadı <span className="text-red-500">*</span>
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
            className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            Şehir <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={status === "loading"}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Örn: İstanbul"
            className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            E-Posta Adresi <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            disabled={status === "loading"}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="corporate@example.com"
            className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            Telefon Numarası <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            disabled={status === "loading"}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Örn: 0532 000 0000"
            className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
          Mesajınız / Ek Bilgiler
        </label>
        <textarea
          rows={4}
          disabled={status === "loading"}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Faaliyet alanınız, hedeflediğiniz ürün grupları veya adetler hakkında bilgi yazabilirsiniz..."
          className="w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
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
          "Bayilik Başvurusunu Gönder"
        )}
      </button>
    </form>
  )
}
