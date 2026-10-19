"use client"

import { useActionState, useState, useTransition } from "react"
import { useParams } from "next/navigation"
import { changeExpertPassword, expertSignOut } from "@lib/data/expert-auth"
import { EXPERT_PASSWORD_MIN } from "@lib/expert-config"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

/** Uzman panelinin üst şeridi: hangi uzman hesabıyla girildiği, çıkış ve şifre değiştirme. */
export default function ExpertAccountBar({ email }: { email: string }) {
  const { countryCode } = useParams() as { countryCode: string }
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(changeExpertPassword, { success: false, error: null })

  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ui-fg-subtle">
          Uzman hesabı: <strong className="text-ui-fg-base">{email}</strong>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-semibold text-ui-fg-subtle hover:text-brand-600"
          >
            Şifre Değiştir
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => expertSignOut(countryCode))}
            className="text-xs font-semibold text-brand-600 hover:underline disabled:opacity-60"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
      {open && (
        <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input label="Mevcut Şifre" name="current_password" type="password" autoComplete="current-password" required />
          <Input
            label={`Yeni Şifre (en az ${EXPERT_PASSWORD_MIN})`}
            name="new_password"
            type="password"
            autoComplete="new-password"
            minLength={EXPERT_PASSWORD_MIN}
            required
          />
          <Input label="Yeni Şifre (Tekrar)" name="new_password_repeat" type="password" autoComplete="new-password" required />
          <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
            <SubmitButton className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-5 rounded-lg text-sm border-0">
              Şifreyi Güncelle
            </SubmitButton>
            {state.error && <span className="text-xs font-semibold text-brand-700">{state.error}</span>}
            {state.success && (
              <span className="text-xs font-semibold text-green-700">
                Şifreniz güncellendi; diğer cihazlardaki uzman oturumlarınız kapatıldı.
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
