"use client"

import { useRef, type ReactNode } from "react"
import { Camera, Check, X } from "lucide-react"
import ExpertAvatar from "../expert-avatar"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"

// "Uzman Profilim" düzenleyicisinin yapı taşları (gihak.org /pro'dan uyarlandı).
// Durumu sayfa tutar; bunlar yalnız bir dilimini çizer.

export const inputCls =
  "w-full rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60"

export const CITIES = Object.keys(TR_CITIES_DISTRICTS).sort((a, b) => a.localeCompare(b, "tr"))

/** Numaralı bir düzenleyici bölümü; id'si doluluk listesinin çapası. */
export function Section({
  id,
  n,
  title,
  desc,
  children,
}: {
  id: string
  n: number
  title: string
  desc?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm">
      <header className="flex items-start gap-3 border-b border-ui-border-base px-5 py-4 sm:px-6">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {n}
        </span>
        <div>
          <h2 className="font-bold text-ui-fg-base">{title}</h2>
          {desc && <p className="text-xs leading-relaxed text-ui-fg-muted">{desc}</p>}
        </div>
      </header>
      <div className="space-y-4 px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

/**
 * Etiket + denetim + isteğe bağlı ipucu. `group`, çip/çok denetimli alanlar
 * içindir: <label> metne tıklamayı içerideki ilk düğmeye iletir.
 */
export function Field({
  label,
  hint,
  optional,
  required,
  group,
  children,
}: {
  label: string
  hint?: ReactNode
  optional?: boolean
  required?: boolean
  group?: boolean
  children: ReactNode
}) {
  const Tag = group ? "div" : "label"
  return (
    <Tag className="block" {...(group ? { role: "group", "aria-label": label } : {})}>
      <span className="mb-1 block text-sm font-semibold text-ui-fg-base">
        {label}
        {required && <span className="text-brand-600"> *</span>}
        {optional && <span className="font-normal text-ui-fg-muted"> (isteğe bağlı)</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ui-fg-muted">{hint}</span>}
    </Tag>
  )
}

/** Açılıp kapanan seçim hapı (uzmanlık alanları). */
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition ${
        on
          ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
          : "border-ui-border-base bg-ui-bg-base text-ui-fg-subtle hover:border-brand-300"
      }`}
    >
      {on && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  )
}

/** Yuvarlak fotoğraf: yükle / değiştir / kaldır. */
export function PhotoField({
  name,
  photoUrl,
  busy,
  disabled,
  onPick,
  onRemove,
}: {
  name: string
  photoUrl: string
  busy: boolean
  /** Kart henüz kaydedilmediyse fotoğraf yüklenemez. */
  disabled?: boolean
  onPick: (file: File) => void
  onRemove: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const off = busy || disabled
  return (
    <div className="flex flex-wrap items-center gap-5">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={off}
        className="group relative rounded-2xl disabled:cursor-not-allowed"
        aria-label="Fotoğraf seç"
      >
        <ExpertAvatar name={name || "?"} photoUrl={photoUrl} size="lg" />
        {!off && (
          <span className="absolute inset-0 grid place-items-center rounded-2xl bg-gray-900/55 text-white opacity-0 transition group-hover:opacity-100">
            <Camera className="h-6 w-6" />
          </span>
        )}
      </button>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={off}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            {busy ? "Kontrol ediliyor…" : photoUrl ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={off}
              className="rounded-lg px-3 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle disabled:opacity-50"
            >
              Kaldır
            </button>
          )}
        </div>
        <p className="max-w-xs text-xs text-ui-fg-muted">
          {disabled
            ? "Fotoğraf eklemek için önce profilinizi bir kez kaydedin."
            : "JPG, PNG veya WEBP, en fazla 3 MB. Yüzünüzün net göründüğü bir portre ya da firma logonuz. Yüklenen fotoğraf otomatik olarak kontrol edilir."}
        </p>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
          e.target.value = ""
        }}
      />
    </div>
  )
}

/** Hizmet verilen diğer iller ya da "Tüm Türkiye". */
export function ProvincePicker({
  value,
  onChange,
  nationwide,
  onNationwide,
  exclude,
}: {
  value: string[]
  onChange: (v: string[]) => void
  nationwide: boolean
  onNationwide: (on: boolean) => void
  exclude?: string
}) {
  const options = CITIES.filter((c) => c !== exclude && !value.includes(c))
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ui-fg-base">
        <input
          type="checkbox"
          checked={nationwide}
          onChange={(e) => onNationwide(e.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
        Tüm Türkiye&apos;ye hizmet veriyorum
      </label>
      {!nationwide && (
        <>
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {value.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full border border-ui-border-base bg-ui-bg-subtle py-1 pl-3 pr-1.5 text-xs font-semibold text-ui-fg-subtle"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((x) => x !== c))}
                    className="grid h-5 w-5 place-items-center rounded-full hover:bg-ui-bg-base hover:text-brand-600"
                    aria-label={`${c} ilini kaldır`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <select
            className={`${inputCls} sm:max-w-xs`}
            value=""
            onChange={(e) => e.target.value && onChange([...value, e.target.value])}
            aria-label="İl ekle"
          >
            <option value="">+ İl ekle</option>
            {options.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}

/** Kaydedilmemiş değişiklik varken altta beliren çubuk. */
export function SaveBar({
  dirty,
  busy,
  status,
  onSave,
  onReset,
}: {
  dirty: boolean
  busy: boolean
  status: { kind: "ok" | "err"; text: string } | null
  onSave: () => void
  onReset: () => void
}) {
  if (!dirty && !status) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ui-border-base bg-ui-bg-base/95 shadow-[0_-10px_30px_-15px_rgba(10,23,51,0.35)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p
          role="status"
          className={`text-sm ${
            status?.kind === "err" ? "text-red-700" : status ? "text-green-700" : "text-ui-fg-base"
          }`}
        >
          {status ? status.text : "Kaydedilmemiş değişiklikleriniz var."}
        </p>
        {dirty && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle disabled:opacity-50"
            >
              Geri al
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
