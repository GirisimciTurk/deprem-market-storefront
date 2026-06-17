"use client"

import { useMemo, useState } from "react"

/**
 * Karbon Fiber Kolon Güçlendirme — hizmet vitrini + KEŞİF TALEP formu.
 * Normal e-ticaretten farklı: "sepete at" yok; müşteri keşif talebi bırakır.
 * Akış: talep → keşif → teklif → onay → tedarik → montaj → kabul.
 * Form /store/service-requests'e POST eder (service_kind=carbon_fiber).
 */

const STEPS = [
  ["1", "Keşif Talebi", "Aşağıdaki formu doldurun; bina ve ihtiyaç bilgilerinizi alalım."],
  ["2", "Keşif & Ölçüm", "Anlaşmalı bayimiz yerinde inceleme yapar, kolon/statik ölçümü alır."],
  ["3", "Teklif", "Keşfe göre kalemli, net fiyatlı ve geçerlilik süreli teklif sunulur."],
  ["4", "Onay & Kapora", "Teklifi onaylarsınız; malzeme tedariki için kapora alınır."],
  ["5", "Tedarik & Teslim", "Karbon fiber malzeme tedarik edilip sahaya ulaştırılır."],
  ["6", "Usta Montajı", "Bayi ustası randevulu gelir, güçlendirmeyi uygular."],
  ["7", "Kabul & Garanti", "İşi onaylarsınız; garanti belgesi ve bakım planı verilir."],
] as const

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  note: "",
}

export default function KarbonFiberClient() {
  const [form, setForm] = useState({ ...emptyForm })
  // Kaba fiyat hesaplayıcı girdileri (keşifte netleşir).
  const [kat, setKat] = useState<number>(5)
  const [m2, setM2] = useState<number>(120)
  const [kolon, setKolon] = useState<number>(8)
  // Tercih edilen keşif tarihleri.
  const [date1, setDate1] = useState("")
  const [date2, setDate2] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }))

  // Kaba tahmin: kolon başına işçilik+malzeme + m² ek faktör + kat (erişim) çarpanı.
  // SADECE fikir vermek için; kesin fiyat keşiften sonra teklifte belirlenir.
  const estimate = useMemo(() => {
    const perKolon = 9000
    const perM2 = 120
    const access = 1 + Math.max(0, kat - 2) * 0.03 // üst katlarda erişim zorluğu
    const base = (kolon * perKolon + m2 * perM2) * access
    const low = Math.round((base * 0.85) / 100) * 100
    const high = Math.round((base * 1.2) / 100) * 100
    return { low, high }
  }, [kat, m2, kolon])

  const fmt = (n: number) => n.toLocaleString("tr-TR")

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
      const preferred_dates = [date1, date2].filter(Boolean)
      const res = await fetch(`${backendUrl}/store/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-publishable-api-key": pk },
        body: JSON.stringify({
          service_kind: "carbon_fiber",
          service_title: "Karbon Fiber Kolon Güçlendirme",
          requires_survey: true,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          district: form.district,
          address: form.address,
          note: form.note,
          details: {
            kat_sayisi: kat,
            m2,
            kolon_sayisi: kolon,
            tahmini_fiyat_araligi: `${fmt(estimate.low)}–${fmt(estimate.high)} TL`,
          },
          preferred_dates,
        }),
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
      <div className="rounded-2xl bg-gradient-to-br from-brandblue-700 to-brandblue-900 text-white px-6 sm:px-10 py-10 mb-10">
        <span className="inline-block bg-white/15 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
          Özel Hizmet · Keşifli Kurulum
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 max-w-2xl">
          Karbon Fiber Kolon Güçlendirme Sistemleri
        </h1>
        <p className="text-white/85 max-w-2xl text-sm sm:text-base leading-relaxed">
          Binanızın taşıyıcı kolonlarını yüksek mukavemetli karbon fiber ile güçlendiriyoruz.
          Bu bir <strong>keşifli kurulum hizmetidir</strong>: önce ücretsiz/keşifli inceleme,
          sonra net teklif, onayınızla malzeme tedariki ve usta montajı. Aşağıdan keşif
          talebinizi bırakın.
        </p>
      </div>

      {/* KURULUM AŞAMALARI */}
      <h2 className="text-xl font-bold mb-4">Nasıl İşliyor? — Kurulum Aşamaları</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-12">
        {STEPS.map(([no, title, desc]) => (
          <div key={no} className="border border-ui-border-base rounded-xl p-4">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm mb-2">
              {no}
            </div>
            <div className="font-bold text-sm mb-1">{title}</div>
            <p className="text-xs text-ui-fg-subtle leading-snug">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL: form */}
        <div className="lg:col-span-2">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-ui-border-base rounded-xl">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                ✓
              </div>
              <h3 className="text-lg font-bold mb-2">Keşif Talebiniz Alındı!</h3>
              <p className="text-sm text-ui-fg-subtle max-w-sm">
                Talebiniz tarafımıza ulaştı. Anlaşmalı bayimiz keşif için en kısa sürede
                sizinle iletişime geçecek.
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
              <h2 className="text-lg font-bold">Keşif Talep Formu</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ad Soyad <span className="text-brand-500">*</span></label>
                  <input className={inputCls} value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)} placeholder="Örn: Ayşe Yılmaz" />
                </div>
                <div>
                  <label className={labelCls}>Telefon <span className="text-brand-500">*</span></label>
                  <input type="tel" className={inputCls} value={form.phone}
                    onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>E-Posta <span className="text-brand-500">*</span></label>
                  <input type="email" className={inputCls} value={form.email}
                    onChange={(e) => set("email", e.target.value)} placeholder="ornek@eposta.com" />
                </div>
                <div>
                  <label className={labelCls}>Şehir / İlçe</label>
                  <div className="flex gap-2">
                    <input className={inputCls} value={form.city}
                      onChange={(e) => set("city", e.target.value)} placeholder="İl" />
                    <input className={inputCls} value={form.district}
                      onChange={(e) => set("district", e.target.value)} placeholder="İlçe" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Adres</label>
                <input className={inputCls} value={form.address}
                  onChange={(e) => set("address", e.target.value)} placeholder="Bina adresi (keşif için)" />
              </div>

              {/* Bina bilgileri = hesaplayıcı girdileri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Kat Sayısı</label>
                  <input type="number" min={1} className={inputCls} value={kat}
                    onChange={(e) => setKat(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelCls}>Toplam m²</label>
                  <input type="number" min={1} className={inputCls} value={m2}
                    onChange={(e) => setM2(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelCls}>Güçlendirilecek Kolon</label>
                  <input type="number" min={1} className={inputCls} value={kolon}
                    onChange={(e) => setKolon(Number(e.target.value) || 0)} />
                </div>
              </div>

              {/* Tarih seçici */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tercih Edilen Keşif Tarihi 1</label>
                  <input type="date" className={inputCls} value={date1}
                    onChange={(e) => setDate1(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Tercih Edilen Keşif Tarihi 2</label>
                  <input type="date" className={inputCls} value={date2}
                    onChange={(e) => setDate2(e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Ek Bilgi / Not</label>
                <textarea rows={3} className={`${inputCls} resize-none`} value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Bina yaşı, mevcut hasar, özel durumlar..." />
              </div>

              <button type="submit" disabled={status === "loading"}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors">
                {status === "loading" ? "Gönderiliyor..." : "Keşif Talebini Gönder"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600 text-center">Talep gönderilemedi. Lütfen tekrar deneyin.</p>
              )}
            </form>
          )}
        </div>

        {/* SAĞ: kaba fiyat hesaplayıcı + bilgi */}
        <aside className="space-y-4">
          <div className="border-2 border-brand-200 bg-brand-50 rounded-xl p-5">
            <h3 className="font-bold text-sm mb-1 text-brand-700">Kaba Fiyat Tahmini</h3>
            <p className="text-xs text-ui-fg-subtle mb-3">
              Soldaki kat / m² / kolon bilgilerine göre <strong>yaklaşık</strong> aralık.
              Kesin fiyat keşiften sonra teklifte belirlenir.
            </p>
            <div className="text-2xl font-extrabold text-brand-700">
              {fmt(estimate.low)} – {fmt(estimate.high)} ₺
            </div>
            <p className="text-[11px] text-ui-fg-muted mt-2">
              {kolon} kolon · {m2} m² · {kat} kat üzerinden tahmin.
            </p>
          </div>
          <div className="border border-ui-border-base rounded-xl p-5">
            <h3 className="font-bold text-sm mb-2 text-brandblue-700">Neden Karbon Fiber?</h3>
            <ul className="text-sm text-ui-fg-subtle space-y-1.5 list-disc pl-4">
              <li>Çeliğe göre çok daha hafif, yüksek mukavemet</li>
              <li>Kolon kesitini büyütmeden güçlendirme</li>
              <li>Hızlı uygulama, az toz/molozsuz işçilik</li>
              <li>Anlaşmalı bayi + usta montaj garantisi</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
