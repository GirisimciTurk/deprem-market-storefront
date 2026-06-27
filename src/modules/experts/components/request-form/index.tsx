"use client"

import { useState } from "react"
import { Send, MessageSquarePlus } from "lucide-react"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-3.5 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"

/**
 * "Talep Bırak" — ziyaretçi, uzman/uygulayıcı profiline iletişim talebi bırakır.
 * Sağlayıcının telefonu gizli olsa bile çalışır (talep sağlayıcıya e-posta ile gider).
 */
export default function ExpertRequestForm({
  slug,
  expertName,
  defaultOpen = false,
}: {
  slug: string
  expertName: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    city: "",
    topic: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_name || !form.customer_phone) {
      alert("Lütfen ad soyad ve telefon alanlarını doldurun.")
      return
    }
    setStatus("loading")
    setErrorMsg("")
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(
        `${backendUrl}/store/experts/${encodeURIComponent(slug)}/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey,
          },
          body: JSON.stringify({
            customer_name: form.customer_name,
            customer_phone: form.customer_phone,
            customer_email: form.customer_email || undefined,
            city: form.city || undefined,
            topic: form.topic || undefined,
            message: form.message || undefined,
          }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Talep gönderilemedi.")
      }
      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Talep gönderilemedi.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="border border-green-200 bg-green-50 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
          ✓
        </div>
        <h3 className="font-bold text-ui-fg-base mb-1">Talebiniz İletildi</h3>
        <p className="text-sm text-ui-fg-subtle">
          {expertName} ile talebiniz paylaşıldı; en kısa sürede sizinle iletişime
          geçecek. İlginiz için teşekkürler.
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm"
      >
        <MessageSquarePlus className="w-4 h-4" /> Talep Bırak
      </button>
    )
  }

  const loading = status === "loading"

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-5 space-y-3"
    >
      <p className="text-sm text-ui-fg-subtle">
        İletişim bilgilerinizi bırakın; <strong>{expertName}</strong> size dönüş yapsın.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          disabled={loading}
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          placeholder="Ad Soyad *"
          className={inputCls}
        />
        <input
          type="tel"
          required
          disabled={loading}
          value={form.customer_phone}
          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          placeholder="Telefon *"
          className={inputCls}
        />
        <input
          type="email"
          disabled={loading}
          value={form.customer_email}
          onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
          placeholder="E-posta (opsiyonel)"
          className={inputCls}
        />
        <input
          type="text"
          disabled={loading}
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="Şehir / İlçe (opsiyonel)"
          className={inputCls}
        />
      </div>
      <input
        type="text"
        disabled={loading}
        value={form.topic}
        onChange={(e) => setForm({ ...form, topic: e.target.value })}
        placeholder="Konu (örn. Bina risk tespiti)"
        className={inputCls}
      />
      <textarea
        rows={3}
        disabled={loading}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="İhtiyacınızı kısaca anlatın..."
        className={`${inputCls} resize-none`}
        maxLength={2000}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" /> {loading ? "Gönderiliyor..." : "Talebi Gönder"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setOpen(false)}
          className="text-sm text-ui-fg-muted hover:text-ui-fg-base"
        >
          Vazgeç
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-brand-600">{errorMsg || "Talep gönderilemedi."}</p>
      )}
      <p className="text-[0.7rem] text-ui-fg-muted">
        Talebiniz yalnızca bu uzmanla ve Deprem Market ekibiyle paylaşılır.
      </p>
    </form>
  )
}
