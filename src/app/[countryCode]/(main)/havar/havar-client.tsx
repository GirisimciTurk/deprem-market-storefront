"use client"

import { useState } from "react"

type HavarType = "purchase" | "rental"

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  buyer_type: "individual" as "individual" | "family",
  usage: "both" as "cargo" | "human" | "both",
  quantity: 1,
  want_door_mechanism: false,
  rental_duration: "",
  note: "",
}

export default function HavarClient() {
  const [tab, setTab] = useState<HavarType>("purchase")
  const [form, setForm] = useState({ ...emptyForm })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.phone) {
      alert("Lütfen ad soyad, e-posta ve telefon alanlarını doldurun.")
      return
    }
    setStatus("loading")
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/havar-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-publishable-api-key": pk },
        body: JSON.stringify({ type: tab, ...form }),
      })
      if (!res.ok) throw new Error("Talep gönderilemedi.")
      setStatus("success")
      setForm({ ...emptyForm })
    } catch {
      setStatus("error")
    }
  }

  const inputCls =
    "w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
  const labelCls =
    "block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1"

  return (
    <div className="content-container py-10">
      {/* HERO */}
      <div className="rounded-2xl bg-gradient-to-br from-brandblue-700 to-brandblue-900 text-white px-6 sm:px-10 py-10 mb-10 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 opacity-20">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
            <path d="M3 7h4l2 2M21 7h-4l-2 2M3 17h4l2-2M21 17h-4l-2-2" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
            <circle cx="5" cy="7" r="2" /><circle cx="19" cy="7" r="2" />
            <circle cx="5" cy="17" r="2" /><circle cx="19" cy="17" r="2" />
          </svg>
        </div>
        {/* HavarTek resmi logosu */}
        <div className="mb-4 inline-flex bg-white rounded-2xl px-4 py-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/havartek-logo.webp"
            alt="HavarTek"
            className="h-16 w-auto object-contain"
            draggable={false}
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 max-w-2xl">
          Drone tabanlı kargo ve insan taşıma — eve, aileye, afete hazır
        </h1>
        <p className="text-white/85 max-w-2xl text-sm sm:text-base leading-relaxed">
          HavarTek hava araçları; bireyler ve aileler için <strong>satın alma</strong> ve{" "}
          <strong>kiralama</strong> modeliyle sunulur. Günlük alışveriş ve kargo taşımadan
          afet anında apartmandan tahliyeye kadar geniş bir kullanım sağlar. Aşağıdan ön
          alım veya ön kiralama talebinizi bırakın, ekibimiz sizinle iletişime geçsin.
        </p>
        <a
          href="https://girisimciturk.com/ekyp/drone-teknolojileri/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          HavarTek hakkında detaylı bilgi
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL: form */}
        <div className="lg:col-span-2">
          {/* Sekmeler */}
          <div className="flex gap-2 mb-6">
            {([
              ["purchase", "Satın Alma Talep Formu", "Ön Alım Talebi"],
              ["rental", "Kiralama Talep Formu", "Ön Kiralama Talebi"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setStatus("idle") }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  tab === key
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-ui-border-base text-ui-fg-subtle hover:border-brand-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-ui-border-base rounded-xl">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                ✓
              </div>
              <h3 className="text-lg font-bold mb-2">Talebiniz Alındı!</h3>
              <p className="text-sm text-ui-fg-subtle max-w-sm">
                {tab === "rental" ? "Ön kiralama" : "Ön alım"} talebiniz tarafımıza
                ulaştı. Ekibimiz en kısa sürede sizinle iletişime geçecek.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm"
              >
                Yeni Talep
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 border border-ui-border-base rounded-xl p-5 sm:p-6">
              <h2 className="text-lg font-bold">
                {tab === "rental" ? "Ön Kiralama Talebi" : "Ön Alım Talebi"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ad Soyad <span className="text-brand-500">*</span></label>
                  <input className={inputCls} value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)} placeholder="Örn: Ayşe Yılmaz" />
                </div>
                <div>
                  <label className={labelCls}>Talep Sahibi</label>
                  <select className={inputCls} value={form.buyer_type}
                    onChange={(e) => set("buyer_type", e.target.value)}>
                    <option value="individual">Bireysel</option>
                    <option value="family">Aile</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>E-Posta <span className="text-brand-500">*</span></label>
                  <input type="email" className={inputCls} value={form.email}
                    onChange={(e) => set("email", e.target.value)} placeholder="ornek@eposta.com" />
                </div>
                <div>
                  <label className={labelCls}>Telefon <span className="text-brand-500">*</span></label>
                  <input type="tel" className={inputCls} value={form.phone}
                    onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Şehir</label>
                  <input className={inputCls} value={form.city}
                    onChange={(e) => set("city", e.target.value)} placeholder="İstanbul" />
                </div>
                <div>
                  <label className={labelCls}>Kullanım Amacı</label>
                  <select className={inputCls} value={form.usage}
                    onChange={(e) => set("usage", e.target.value)}>
                    <option value="both">Kargo + İnsan Taşıma</option>
                    <option value="cargo">Kargo Taşıma</option>
                    <option value="human">İnsan Taşıma</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Adet</label>
                  <input type="number" min={1} className={inputCls} value={form.quantity}
                    onChange={(e) => set("quantity", Number(e.target.value) || 1)} />
                </div>
              </div>

              {tab === "rental" && (
                <div>
                  <label className={labelCls}>Tahmini Kiralama Süresi</label>
                  <input className={inputCls} value={form.rental_duration}
                    onChange={(e) => set("rental_duration", e.target.value)}
                    placeholder="Örn: 3 ay / 1 yıl" />
                </div>
              )}

              <label className="flex items-start gap-2 cursor-pointer bg-brand-50 border border-brand-200 rounded-lg p-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600"
                  checked={form.want_door_mechanism}
                  onChange={(e) => set("want_door_mechanism", e.target.checked)} />
                <span className="text-sm text-ui-fg-base">
                  <strong>Apartman kapı/çıkış mekanizması</strong> da istiyorum — drone
                  yaklaşınca otomatik açılan, tahliye ve günlük kargo için özel kapı
                  sistemi (bayi montaj hizmeti).
                </span>
              </label>

              <div>
                <label className={labelCls}>Ek Bilgi / Not</label>
                <textarea rows={3} className={`${inputCls} resize-none`} value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="İhtiyacınız, kullanım senaryonuz veya sorularınız..." />
              </div>

              <button type="submit" disabled={status === "loading"}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors">
                {status === "loading"
                  ? "Gönderiliyor..."
                  : tab === "rental" ? "Ön Kiralama Talebini Gönder" : "Ön Alım Talebini Gönder"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600 text-center">Talep gönderilemedi. Lütfen tekrar deneyin.</p>
              )}
            </form>
          )}
        </div>

        {/* SAĞ: bilgi kartları */}
        <aside className="space-y-4">
          <div className="border border-ui-border-base rounded-xl p-5">
            <h3 className="font-bold text-sm mb-2 text-brandblue-700">Apartman Kapı Mekanizması</h3>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              Apartmanlara monte edilen ek kapı, drone yaklaştığında otomatik açılır ve
              hava aracına güvenli bağlanma sağlar. Afette anında tahliye; günlük
              hayatta alışveriş ve kargo teslimi için kullanılır. Kurulum,{" "}
              <strong>bayilerimiz tarafından ücret karşılığı</strong> yapılır.
            </p>
          </div>
          <div className="border border-ui-border-base rounded-xl p-5">
            <h3 className="font-bold text-sm mb-2 text-brandblue-700">Neden HavarTek?</h3>
            <ul className="text-sm text-ui-fg-subtle space-y-1.5 list-disc pl-4">
              <li>Bireysel ve aile kullanımı için satış + kiralama</li>
              <li><strong>Günlük kullanım:</strong> market ve günlük alışveriş getir-götür</li>
              <li><strong>Paket & kargo taşıma:</strong> kapıdan kapıya hızlı teslimat</li>
              <li>İnsan taşımacılığı</li>
              <li>Afet anında hızlı tahliye</li>
              <li>Şehir içi lojistiği hızlandırır</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
