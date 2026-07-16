"use client"

import { useState } from "react"
import { Mail, Check, Loader2 } from "lucide-react"
import { subscribeNewsletter } from "@lib/data/newsletter"

/** Footer bülten kayıt formu. Anonim e-posta → /store/newsletter. */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state === "loading") return
    const value = email.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setState("error")
      setError("Geçerli bir e-posta adresi giriniz.")
      return
    }
    setState("loading")
    setError(null)
    const res = await subscribeNewsletter(value)
    if (res.success) {
      setState("done")
      setEmail("")
    } else {
      setState("error")
      setError(res.error)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-ui-border-base bg-slate-50 px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Mail className="h-5 w-5 text-brand-600" />
            Deprem hazırlık bültenine katılın
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Afet hazırlık rehberleri, yeni ürünler ve kampanyalardan ilk siz haberdar olun.
            Dilediğiniz zaman çıkabilirsiniz.
          </p>
        </div>

        {state === "done" ? (
          <div
            className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-700"
            role="status"
          >
            <Check className="h-4 w-4" />
            Kaydınız alındı. Teşekkürler!
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full lg:w-auto" noValidate>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (state === "error") setState("idle")
                }}
                placeholder="E-posta adresiniz"
                aria-label="E-posta adresiniz"
                aria-invalid={state === "error"}
                className="w-full sm:w-72 rounded-lg border border-ui-border-base bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                    Kaydediliyor
                  </>
                ) : (
                  "Abone Ol"
                )}
              </button>
            </div>
            {state === "error" && error && (
              <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
