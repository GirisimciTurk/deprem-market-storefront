"use client"

import { useState } from "react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      alert("Lütfen zorunlu alanları doldurun.")
      return
    }

    setStatus("loading")
    setTimeout(() => {
      setStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 1200)
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl animate-bounce">
          ✓
        </div>
        <h3 className="text-lg font-bold text-ui-fg-base mb-2">Mesajınız Alındı!</h3>
        <p className="text-sm text-ui-fg-subtle max-w-sm">
          Bizimle iletişime geçtiğiniz için teşekkür ederiz. Destek ekibimiz en kısa sürede size e-posta veya telefon yoluyla dönüş yapacaktır.
        </p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
          Adınız Soyadınız <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={status === "loading"}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Örn: Ahmet Yılmaz"
          className="w-full border border-ui-border-base rounded-lg px-4 py-2.5 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            E-Posta Adresiniz <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            disabled={status === "loading"}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full border border-ui-border-base rounded-lg px-4 py-2.5 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
            Konu
          </label>
          <input
            type="text"
            disabled={status === "loading"}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Mesajınızın konusu"
            className="w-full border border-ui-border-base rounded-lg px-4 py-2.5 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1">
          Mesajınız <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          required
          disabled={status === "loading"}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Talebinizi detaylıca buraya yazın..."
          className="w-full border border-ui-border-base rounded-lg px-4 py-2.5 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Gönderiliyor...
          </>
        ) : (
          "Mesajı Gönder"
        )}
      </button>
    </form>
  )
}
