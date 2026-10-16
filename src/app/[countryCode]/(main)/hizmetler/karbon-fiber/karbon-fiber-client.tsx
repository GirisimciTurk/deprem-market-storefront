"use client"

import { useState } from "react"
import { normalizeTrPhone, trPhoneProblem } from "@lib/util/tr-phone"
import PhoneInput from "@modules/common/components/phone-input"
import CityDistrictSelect from "@modules/common/components/city-district-select"

/**
 * Karbon Fiber Kolon Güçlendirme — hizmet vitrini + GÖRÜŞME TALEP formu.
 * Normal e-ticaretten farklı: "sepete at" yok; müşteri talep bırakır, ayrı bir
 * keşif adımı yoktur: bina incelemesi işin içindedir, fiyat ve iş yüz yüze
 * görüşmede kararlaştırılır.
 * Akış: talep → yüz yüze görüşme → anlaşma → tedarik ve uygulama → kabul.
 * Form /store/service-requests'e POST eder (service_kind=carbon_fiber).
 */

const STEPS = [
  ["1", "Talep", "Aşağıdaki formu doldurun; bina ve ihtiyaç bilgilerinizi alalım."],
  ["2", "Yüz Yüze Görüşme", "Sizi arayıp buluşuyoruz; binanızı birlikte inceliyoruz."],
  ["3", "Anlaşma", "Malzeme ve uygulama için fiyatı ve takvimi birlikte netleştiriyoruz."],
  ["4", "Tedarik & Uygulama", "Karbon fiber sahaya gelir, ustamız güçlendirmeyi uygular."],
  ["5", "Kabul & Garanti", "İşi onaylarsınız; garanti belgesi ve bakım planı verilir."],
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
  // Bina bilgileri; isteğe bağlı, doldurulanlar talebe eklenir.
  const [kat, setKat] = useState("")
  const [m2, setM2] = useState("")
  const [kolon, setKolon] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.phone) {
      alert("Lütfen ad soyad, e-posta ve telefon alanlarını doldurun.")
      return
    }
    const phoneProblem = trPhoneProblem(form.phone)
    if (phoneProblem) {
      alert(phoneProblem)
      return
    }
    setStatus("loading")
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-publishable-api-key": pk },
        body: JSON.stringify({
          service_kind: "carbon_fiber",
          service_title: "Karbon Fiber Kolon Güçlendirme",
          requires_survey: false,
          full_name: form.full_name,
          email: form.email,
          phone: normalizeTrPhone(form.phone),
          city: form.city,
          district: form.district,
          address: form.address,
          note: form.note,
          details: Object.fromEntries(
            Object.entries({ kat_sayisi: kat, m2, kolon_sayisi: kolon }).filter(([, v]) => v !== "")
          ),
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
          Özel Hizmet · Malzeme + Uygulama
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 max-w-2xl">
          Karbon Fiber Kolon Güçlendirme Sistemleri
        </h1>
        <p className="text-white/85 max-w-2xl text-sm sm:text-base leading-relaxed">
          Binanızın taşıyıcı kolonlarını yüksek mukavemetli karbon fiber ile güçlendiriyoruz.
          Malzemeyi ve uygulamayı birlikte sunuyoruz; ayrı bir keşif ücreti yok, bina
          incelemesi işin içinde. Formu doldurun; sizi arayalım, binanızı yerinde görüp
          işi <strong>yüz yüze görüşerek</strong> netleştirelim.
        </p>
      </div>

      {/* KURULUM AŞAMALARI */}
      <h2 className="text-xl font-bold mb-4">Nasıl İşliyor? — Kurulum Aşamaları</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
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
              <h3 className="text-lg font-bold mb-2">Talebiniz Alındı!</h3>
              <p className="text-sm text-ui-fg-subtle max-w-sm">
                Talebiniz tarafımıza ulaştı. Yüz yüze görüşme için en kısa sürede sizi
                arayacağız.
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
              <h2 className="text-lg font-bold">Görüşme Talep Formu</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ad Soyad <span className="text-brand-500">*</span></label>
                  <input className={inputCls} value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)} placeholder="Örn: Ayşe Yılmaz" />
                </div>
                <div>
                  <label className={labelCls}>Telefon <span className="text-brand-500">*</span></label>
                  <PhoneInput className={inputCls} value={form.phone}
                    onChange={(v) => set("phone", v)} aria-label="Telefon" />
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
                    <CityDistrictSelect
                      city={form.city}
                      district={form.district}
                      onChange={({ city, district }) =>
                        setForm((f) => ({ ...f, city, district }))
                      }
                      districtOptional
                      className={inputCls}
                      cityProps={{ "aria-label": "İl" }}
                      districtProps={{ "aria-label": "İlçe" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Adres</label>
                <input className={inputCls} value={form.address}
                  onChange={(e) => set("address", e.target.value)} placeholder="Bina adresi" />
              </div>

              {/* Bina bilgileri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Kat Sayısı</label>
                  <input type="number" min={1} className={inputCls} value={kat} placeholder="Örn: 5"
                    onChange={(e) => setKat(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Toplam m²</label>
                  <input type="number" min={1} className={inputCls} value={m2} placeholder="Örn: 120"
                    onChange={(e) => setM2(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Güçlendirilecek Kolon</label>
                  <input type="number" min={1} className={inputCls} value={kolon} placeholder="Örn: 8"
                    onChange={(e) => setKolon(e.target.value)} />
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
                {status === "loading" ? "Gönderiliyor..." : "Talebi Gönder"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600 text-center">Talep gönderilemedi. Lütfen tekrar deneyin.</p>
              )}
            </form>
          )}
        </div>

        {/* SAĞ: bilgi */}
        <aside className="space-y-4">
          <div className="border border-ui-border-base rounded-xl p-5">
            <h3 className="font-bold text-sm mb-2 text-brandblue-700">Neden Karbon Fiber?</h3>
            <ul className="text-sm text-ui-fg-subtle space-y-1.5 list-disc pl-4">
              <li>Çeliğe göre çok daha hafif, yüksek mukavemet</li>
              <li>Kolon kesitini büyütmeden güçlendirme</li>
              <li>Hızlı uygulama, az toz/molozsuz işçilik</li>
              <li>Malzeme ve uygulama tek elden, garantili</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
