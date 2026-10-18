"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, BadgeCheck, Check, Clock, ExternalLink, ShieldAlert } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ExpertCard from "../expert-card"
import { specializationsFor } from "@lib/expert-config"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"
import type { Expert } from "@lib/data/experts"
import {
  publishMyExpert,
  removeMyExpertPhoto,
  saveMyExpert,
  uploadMyExpertPhoto,
  type MyExpertCard,
  type MyExpertInput,
} from "@lib/data/my-expert"
import { CITIES, Chip, Field, PhotoField, ProvincePicker, SaveBar, Section, inputCls } from "./editor-parts"

// "Uzman Profilim": hesabın kendi uzman kartı (gihak.org /pro'dan uyarlandı).
// Her şey tek PUT ile kaydedilir; yayın ayrıdır ve beyan ister. Yayınlanan kart
// önce otomatik kontrolden (gobit → Gemini) geçer: emin olunan kart hemen
// yayına girer, reddedilen gerekçesiyle döner, kalanı ekip inceler.

type Form = {
  full_name: string
  title: string
  headline: string
  about: string
  city: string
  district: string
  address: string
  service_provinces: string[]
  nationwide: boolean
  specialties: string[]
  experience_years: string
  chamber: string
  registry_no: string
  phone: string
  whatsapp: string
  email: string
  website: string
  contact_hidden: boolean
}

const TITLES = [
  "İnşaat Mühendisi",
  "İnşaat Yüksek Mühendisi",
  "Dr. İnşaat Mühendisi",
  "Doç. Dr. İnşaat Mühendisi",
  "Prof. Dr. İnşaat Mühendisi",
  "Jeoloji Mühendisi",
  "Jeofizik Mühendisi",
]

function toForm(c: MyExpertCard | null, defaults: { name: string; email: string }): Form {
  return {
    full_name: c?.full_name ?? defaults.name,
    title: c?.title ?? "",
    headline: c?.headline ?? "",
    about: c?.about ?? "",
    city: c?.city ?? "",
    district: c?.district ?? "",
    address: c?.address ?? "",
    service_provinces: c?.service_provinces ?? [],
    nationwide: c?.nationwide ?? false,
    specialties: c?.specialties ?? [],
    experience_years: c?.experience_years != null ? String(c.experience_years) : "",
    chamber: c?.chamber ?? "",
    registry_no: c?.registry_no ?? "",
    phone: c?.phone ?? "",
    whatsapp: c?.whatsapp ?? "",
    email: c?.email ?? defaults.email,
    website: c?.website ?? "",
    contact_hidden: c?.contact_hidden ?? false,
  }
}

/** Doluluk listesi; `req` olanlar gobit'in yayın için istedikleri. */
function checklist(f: Form, photo: string) {
  return [
    { id: "kimlik", label: "Fotoğraf", done: !!photo },
    { id: "kimlik", label: "Unvan", done: !!f.title.trim() },
    { id: "kimlik", label: "Tek cümlelik tanıtım", done: !!f.headline.trim() },
    { id: "mesleki", label: "Bağlı olduğu oda", done: !!f.chamber.trim() },
    { id: "mesleki", label: "Deneyim yılı", done: !!f.experience_years },
    { id: "alanlar", label: "Uzmanlık alanı", done: f.specialties.length > 0, req: true },
    {
      id: "iletisim",
      label: "Telefon, WhatsApp, e-posta veya web sitesi",
      done: !!(f.phone.trim() || f.whatsapp.trim() || f.email.trim() || f.website.trim()),
      req: true,
    },
    { id: "konum", label: "İl", done: !!f.city, req: true },
    { id: "hakkinda", label: "Hakkında yazısı", done: f.about.trim().length >= 80 },
  ]
}

export default function MyExpertProfile({
  initial,
  defaults,
  children,
}: {
  initial: MyExpertCard | null
  defaults: { name: string; email: string }
  /** Sol sütunda bölümlerin altına: gelen talepler ve değerlendirmeler. */
  children?: React.ReactNode
}) {
  const router = useRouter()
  const [card, setCard] = useState<MyExpertCard | null>(initial)
  const [saved, setSaved] = useState<Form>(() => toForm(initial, defaults))
  const [f, setF] = useState<Form>(saved)
  const [declared, setDeclared] = useState(false)
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null)
  const [pubMsg, setPubMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  const kind = card?.kind ?? "engineer"
  const specs = specializationsFor(kind)
  const dirty = useMemo(() => JSON.stringify(f) !== JSON.stringify(saved), [f, saved])

  const fill = useCallback((c: MyExpertCard, keepEdits = false) => {
    setCard(c)
    const next = toForm(c, { name: "", email: "" })
    setSaved(next)
    if (!keepEdits) setF(next)
  }, [])

  // Kaydedilmemiş değişiklikle ayrılmak önce sorar.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  // Kaydetme notu kaybolur; hata biraz daha kalır.
  useEffect(() => {
    if (!status) return
    const t = setTimeout(() => setStatus(null), status.kind === "err" ? 9000 : 3500)
    return () => clearTimeout(t)
  }, [status])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }))
  const bind = (k: keyof Form) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      set(k, e.target.value as never),
  })
  const toggleSpec = (key: string) =>
    set("specialties", f.specialties.includes(key) ? f.specialties.filter((x) => x !== key) : [...f.specialties, key])

  // Kimliği değiştiren alanlar (ad, oda, sicil no) doğrulamayı ve yayını düşürür (gobit).
  const identityChanged =
    !!card && (f.full_name !== saved.full_name || f.chamber !== saved.chamber || f.registry_no !== saved.registry_no)

  async function save(): Promise<MyExpertCard | null> {
    setBusy(true)
    setStatus(null)
    setPubMsg(null)
    const years = f.experience_years ? Number(f.experience_years) : null
    const input: MyExpertInput = {
      kind,
      full_name: f.full_name.trim(),
      title: f.title.trim(),
      headline: f.headline.trim(),
      about: f.about.trim(),
      city: f.city,
      district: f.district,
      address: f.address.trim(),
      service_provinces: f.nationwide ? [] : f.service_provinces,
      nationwide: f.nationwide,
      specialties: f.specialties,
      experience_years: years,
      chamber: f.chamber.trim(),
      registry_no: f.registry_no.trim(),
      phone: f.phone.trim(),
      whatsapp: f.whatsapp.trim(),
      email: f.email.trim(),
      website: f.website.trim(),
      contact_hidden: f.contact_hidden,
    }
    const wasListed = !!card?.published
    const res = await saveMyExpert(input)
    setBusy(false)
    if (!res.ok) {
      setStatus({ kind: "err", text: res.error })
      return null
    }
    const out = res.data
    fill(out)
    if (wasListed && !out.published) {
      setStatus({
        kind: "err",
        text:
          out.screening === "rejected"
            ? `Değişiklik kontrolden geçmedi, kartınız yayından alındı: ${out.screening_reason}`
            : out.screening === "pending"
              ? "Değişiklik ekibimizin incelemesine gitti; onaylanana kadar kartınız yayında değil."
              : "Zorunlu bir alan boş kaldığı ya da kimlik bilgileriniz değiştiği için kartınız yayından alındı.",
      })
    } else {
      setStatus({ kind: "ok", text: out.published ? "Kaydedildi; değişiklikler profilinizde." : "Kaydedildi." })
    }
    router.refresh()
    return out
  }

  async function publish(on: boolean) {
    setPubMsg(null)
    if (on && (dirty || !card) && !(await save())) return
    setBusy(true)
    const res = await publishMyExpert(on, on ? declared : false)
    setBusy(false)
    if (!res.ok) {
      setPubMsg({ kind: "err", text: res.error })
      return
    }
    fill(res.data, true)
    const c = res.data
    setPubMsg(
      !on
        ? { kind: "ok", text: "Kartınız yayından alındı." }
        : c.published
          ? { kind: "ok", text: "Kartınız kontrolden geçti ve yayında! Dizinde görünüyorsunuz." }
          : c.screening === "rejected"
            ? { kind: "err", text: "Kartınız kontrolden geçmedi; gerekçeyi okuyup düzeltin." }
            : { kind: "ok", text: "Kartınız ekibimizin incelemesine gönderildi." }
    )
    router.refresh()
  }

  async function onPhoto(file: File) {
    setPhotoBusy(true)
    setStatus(null)
    const form = new FormData()
    form.set("file", file)
    const res = await uploadMyExpertPhoto(form)
    setPhotoBusy(false)
    if (!res.ok) {
      setStatus({ kind: "err", text: res.error })
      return
    }
    fill(res.data, true)
    setStatus({ kind: "ok", text: "Fotoğraf kontrolden geçti ve eklendi." })
  }

  async function removePhoto() {
    setPhotoBusy(true)
    const res = await removeMyExpertPhoto()
    setPhotoBusy(false)
    if (!res.ok) {
      setStatus({ kind: "err", text: res.error })
      return
    }
    fill(res.data, true)
    setStatus({ kind: "ok", text: "Fotoğraf kaldırıldı." })
  }

  // Ziyaretçinin dizinde göreceği kart, kaydedilmemiş değişikliklerle.
  const preview: Expert = {
    slug: card?.slug || "onizleme",
    provider_type: kind,
    full_name: f.full_name || "Adınız Soyadınız",
    title: f.title,
    headline: f.headline,
    city: f.city,
    district: f.district,
    specializations: f.specialties,
    verified_specializations: card?.verified ? f.specialties : [],
    experience_years: f.experience_years ? Number(f.experience_years) : null,
    imo_member: /İMO|IMO/i.test(f.chamber),
    service_areas: f.nationwide ? "Tüm Türkiye" : f.service_provinces.join(", "),
    service_regions: (f.nationwide ? [] : f.service_provinces).map((city) => ({ city })),
    nationwide: f.nationwide,
    about: f.about,
    photo_url: card?.photo_url ?? "",
    verified: !!card?.verified,
    document_count: 0,
    phone: f.phone,
    email: f.email,
    whatsapp: f.whatsapp,
    website: f.website,
    chamber: f.chamber,
    registry_no: f.registry_no,
    rating_avg: card?.rating_avg ?? null,
    rating_count: card?.rating_count ?? 0,
    published_at: null,
  }

  const items = checklist(f, card?.photo_url ?? "")
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100)
  const missingReq = items.filter((i) => i.req && !i.done)
  const listed = !!card?.published && !card.hidden
  const districts = f.city ? TR_CITIES_DISTRICTS[f.city] ?? [] : []

  return (
    <div className="pb-24">
      {card?.hidden && (
        <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p>
            Kartınız depremTek Market tarafından yayından kaldırıldı. Gerekçe:{" "}
            <strong>{card.hidden_reason || "belirtilmedi"}</strong>. İtiraz için{" "}
            <LocalizedClientLink href="/iletisim" className="underline">
              bize ulaşın
            </LocalizedClientLink>
            .
          </p>
        </div>
      )}

      {/* Hesap panelinin içerik alanı dar: durum ve doluluk üstte yan yana,
          bölümler altta tam genişlikte. */}
      <div className="space-y-5">
        <div className="grid items-start gap-4 md:grid-cols-2">
          <PublishCard
            card={card}
            listed={listed}
            dirty={dirty}
            busy={busy}
            declared={declared}
            onDeclared={setDeclared}
            missing={missingReq}
            onPublish={publish}
            msg={pubMsg}
          />

          {/* Doluluk */}
          <section className="rounded-2xl border border-ui-border-base bg-ui-bg-base p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold text-ui-fg-base">Profil doluluğu</h2>
              <span className="text-sm font-bold text-ui-fg-base">%{pct}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-ui-bg-subtle">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-ui-fg-muted">Dolu profiller güven verir ve daha çok talep alır.</p>
            <ul className="mt-3 space-y-1.5">
              {items.map((i) => (
                <li key={i.label}>
                  <a
                    href={`#${i.id}`}
                    className={`flex items-center gap-2 text-sm ${
                      i.done ? "text-ui-fg-muted" : "text-ui-fg-base hover:text-brand-700"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                        i.done ? "bg-green-500 text-white" : "border border-ui-border-base"
                      }`}
                    >
                      {i.done && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className={i.done ? "line-through" : ""}>{i.label}</span>
                    {i.req && !i.done && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-brand-600">
                        zorunlu
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>

        </div>

        <section className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-ui-fg-muted">
            Dizindeki kartınız (kaydedilmemiş değişikliklerle)
          </p>
          <div className="pointer-events-none max-w-sm">
            <ExpertCard expert={preview} />
          </div>
        </section>

        <div className="min-w-0 space-y-5">
          <Section id="kimlik" n={1} title="Kimlik" desc="Ziyaretçinin ilk gördüğü şey: fotoğrafınız, adınız, unvanınız ve kendinizi anlatan tek cümle.">
            <PhotoField
              name={f.full_name}
              photoUrl={card?.photo_url ?? ""}
              busy={photoBusy}
              disabled={!card}
              onPick={onPhoto}
              onRemove={removePhoto}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad soyad" required hint="Profilinizin adresi adınızdan oluşur.">
                <input className={inputCls} {...bind("full_name")} maxLength={120} placeholder="Örn. Ayşe Yılmaz" />
              </Field>
              <Field label="Unvan">
                <input className={inputCls} {...bind("title")} maxLength={60} list="expert-titles" placeholder="Örn. İnşaat Yüksek Mühendisi" />
                <datalist id="expert-titles">
                  {TITLES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </Field>
            </div>
            {identityChanged && (card?.verified || card?.published) && (
              <p className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Ad, oda ya da sicil numarası değişince kartınız yayından alınır
                {card?.verified ? " ve “Doğrulanmış” rozeti düşer" : ""}; kaydettikten sonra yeniden yayınlamanız gerekir.
              </p>
            )}
            <Field label="Tek cümlelik tanıtım" hint={`${f.headline.length}/160 · Kartınızda ve profilinizin başında görünür.`}>
              <input
                className={inputCls}
                {...bind("headline")}
                maxLength={160}
                placeholder="Örn. Bina risk tespiti ve güçlendirme projesinde 15 yıllık deneyim"
              />
            </Field>
          </Section>

          <Section
            id="mesleki"
            n={2}
            title="Mesleki bilgiler"
            desc="Bu bilgiler sizin beyanınızdır. “Doğrulanmış” rozeti, ekibimiz diploma ve oda kaydınızı gördükten sonra verilir."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bağlı olduğunuz oda" optional>
                <input className={inputCls} {...bind("chamber")} maxLength={120} placeholder="Örn. İMO İstanbul Şubesi" />
              </Field>
              <Field label="Oda sicil no" optional>
                <input className={inputCls} {...bind("registry_no")} maxLength={40} placeholder="Örn. 12345" />
              </Field>
            </div>
            <Field label="Deneyim (yıl)" optional>
              <input
                className={`${inputCls} sm:max-w-[160px]`}
                type="number"
                min={0}
                max={70}
                {...bind("experience_years")}
                placeholder="Örn. 12"
              />
            </Field>
          </Section>

          <Section id="alanlar" n={3} title="Uzmanlık alanları *" desc="Dizinde bu alanlara göre aranırsınız. En az birini seçin.">
            <div className="flex flex-wrap gap-2">
              {specs.map((s) => (
                <Chip key={s.key} on={f.specialties.includes(s.key)} onClick={() => toggleSpec(s.key)}>
                  {s.label}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-ui-fg-muted">{f.specialties.length} seçili</p>
          </Section>

          <Section
            id="iletisim"
            n={4}
            title="İletişim *"
            desc="Ziyaretçiler size bu kanallardan ulaşır. En az birini doldurun. İsterseniz kanallarınızı gizleyip yalnız “Talep Bırak” formuyla talep alabilirsiniz."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Telefon">
                <input className={inputCls} {...bind("phone")} maxLength={20} inputMode="tel" placeholder="0532 000 00 00" />
              </Field>
              <Field label="WhatsApp">
                <input className={inputCls} {...bind("whatsapp")} maxLength={20} inputMode="tel" placeholder="0532 000 00 00" />
              </Field>
              <Field label="E-posta">
                <input className={inputCls} type="email" {...bind("email")} maxLength={254} placeholder="ornek@buro.com" />
              </Field>
              <Field label="Web sitesi">
                <input className={inputCls} {...bind("website")} maxLength={240} placeholder="https://" />
              </Field>
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ui-fg-base">
              <input
                type="checkbox"
                checked={f.contact_hidden}
                onChange={(e) => set("contact_hidden", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                İletişim bilgilerim profilimde görünmesin
                <span className="block text-xs text-ui-fg-muted">
                  Ziyaretçiler size yalnız “Talep Bırak” formuyla ulaşır; talepler aşağıdaki kutuya ve e-postanıza düşer.
                </span>
              </span>
            </label>
          </Section>

          <Section id="konum" n={5} title="Konum ve hizmet bölgesi" desc="Büronuzun yeri ve hizmet verdiğiniz iller. Kendi ilinizdekiler listede önce gelir.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="İl" required>
                <select
                  className={inputCls}
                  value={f.city}
                  onChange={(e) => setF((s) => ({ ...s, city: e.target.value, district: "" }))}
                >
                  <option value="">Seçin</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="İlçe" optional>
                <select className={inputCls} {...bind("district")} disabled={!f.city}>
                  <option value="">{f.city ? "Seçin" : "Önce il seçin"}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Açık adres" optional>
              <input className={inputCls} {...bind("address")} maxLength={240} placeholder="Büro adresiniz" />
            </Field>
            <Field group label="Hizmet verdiğiniz diğer iller" optional>
              <ProvincePicker
                value={f.service_provinces}
                onChange={(v) => set("service_provinces", v)}
                nationwide={f.nationwide}
                onNationwide={(on) => set("nationwide", on)}
                exclude={f.city}
              />
            </Field>
          </Section>

          <Section
            id="hakkinda"
            n={6}
            title="Hakkında"
            desc="Deneyiminizi, öne çıkan işlerinizi ve çalışma şeklinizi anlatın. Reklam, başka sitelere yönlendirme ve abartılı vaatler otomatik kontrolden geçmez."
          >
            <textarea
              className={`${inputCls} min-h-[200px] leading-relaxed`}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
              maxLength={4000}
              placeholder="Örn. 2009'dan beri İstanbul'da mevcut binaların deprem performans analizi ve güçlendirme projeleri yapıyorum…"
            />
            <p className="-mt-2 text-right text-xs text-ui-fg-muted">{f.about.length}/4000</p>
          </Section>

          {children}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        busy={busy}
        status={status}
        onSave={() => void save()}
        onReset={() => {
          setF(saved)
          setStatus(null)
        }}
      />
    </div>
  )
}

function PublishCard({
  card,
  listed,
  dirty,
  busy,
  declared,
  onDeclared,
  missing,
  onPublish,
  msg,
}: {
  card: MyExpertCard | null
  listed: boolean
  dirty: boolean
  busy: boolean
  declared: boolean
  onDeclared: (v: boolean) => void
  missing: { id: string; label: string }[]
  onPublish: (on: boolean) => void
  msg: { kind: "ok" | "err"; text: string } | null
}) {
  const screening = card?.screening ?? ""
  const badge = listed
    ? { text: "Yayında", cls: "bg-green-50 text-green-700", dot: "bg-green-500" }
    : screening === "pending"
      ? { text: "İncelemede", cls: "bg-amber-50 text-amber-800", dot: "bg-amber-500" }
      : screening === "rejected"
        ? { text: "Düzeltme gerekli", cls: "bg-red-50 text-red-700", dot: "bg-red-500" }
        : { text: "Taslak", cls: "bg-ui-bg-subtle text-ui-fg-subtle", dot: "bg-ui-fg-muted" }

  return (
    <section className="rounded-2xl border border-ui-border-base bg-ui-bg-base p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-ui-fg-base">Yayın durumu</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {badge.text}
        </span>
      </div>

      {card?.verified ? (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-700">
          <BadgeCheck className="h-3.5 w-3.5" /> Doğrulanmış profil
        </p>
      ) : (
        card && (
          <p className="mt-2 text-xs text-ui-fg-muted">
            “Doğrulanmış” rozeti için diploma ve oda kaydınızı{" "}
            <LocalizedClientLink href="/iletisim" className="underline">
              ekibimize iletin
            </LocalizedClientLink>
            .
          </p>
        )
      )}

      {listed ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-ui-fg-subtle">
            Kartınız dizinde. Kaydettiğiniz değişiklikler yeniden kontrol edilir ve hemen yansır.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {card?.slug && (
              <LocalizedClientLink
                href={`/uzmanlar/${card.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
              >
                Profilimi gör <ExternalLink className="h-3.5 w-3.5" />
              </LocalizedClientLink>
            )}
            <button
              type="button"
              onClick={() => onPublish(false)}
              disabled={busy}
              className="text-sm text-ui-fg-muted underline hover:text-ui-fg-base disabled:opacity-50"
            >
              Yayından al
            </button>
          </div>
        </div>
      ) : screening === "pending" ? (
        <div className="mt-3 space-y-3">
          <p className="flex gap-2 text-sm text-ui-fg-subtle">
            <Clock className="h-4 w-4 shrink-0 text-amber-500" />
            {card?.screening_reason || "Kartınız ekibimizin incelemesinde."} Onaylanınca dizinde görünürsünüz.
          </p>
          <button
            type="button"
            onClick={() => onPublish(false)}
            disabled={busy}
            className="text-sm text-ui-fg-muted underline hover:text-ui-fg-base disabled:opacity-50"
          >
            İncelemeden geri çek
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {screening === "rejected" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              <strong>Kontrolden geçmedi:</strong> {card?.screening_reason || "gerekçe belirtilmedi"}
              <span className="mt-1 block text-xs">Kartınızı düzeltip kaydedin, ardından tekrar yayınlayın.</span>
            </p>
          )}
          {missing.length > 0 ? (
            <p className="text-sm text-ui-fg-subtle">
              Yayınlamak için eksik:{" "}
              {missing.map((i, k) => (
                <span key={i.label}>
                  <a href={`#${i.id}`} className="font-semibold text-brand-700 underline">
                    {i.label}
                  </a>
                  {k < missing.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          ) : (
            screening !== "rejected" && (
              <p className="text-sm text-ui-fg-subtle">
                Kartınız yayına hazır. Yayınladığınızda otomatik olarak kontrol edilir; uygun bulunan kart hemen dizine girer.
              </p>
            )
          )}
          <label className="flex gap-2 text-xs leading-relaxed text-ui-fg-subtle">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => onDeclared(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
            />
            <span>
              Profilimdeki bilgilerin doğru olduğunu ve bu mesleği icra etmeye yetkili olduğumu beyan ederim. Bilgilerin
              doğruluğundan yalnızca ben sorumluyum.
            </span>
          </label>
          <button
            type="button"
            onClick={() => onPublish(true)}
            disabled={busy || !declared || missing.length > 0 || !!card?.hidden}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Kontrol ediliyor…" : dirty || !card ? "Kaydet ve yayınla" : "Yayınla"}
          </button>
        </div>
      )}
      {msg && (
        <p role="status" className={`mt-3 text-sm ${msg.kind === "err" ? "text-red-700" : "text-green-700"}`}>
          {msg.text}
        </p>
      )}
    </section>
  )
}
