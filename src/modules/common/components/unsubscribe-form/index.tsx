"use client"

import { useState, useTransition } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { unsubscribeMarketing, unsubscribeNewsletter } from "@lib/data/newsletter"

/**
 * E-postalardaki "abonelikten çık" bağlantılarının ortak formu. İki jeton
 * türü var: bülten satırının jetonu (/bulten/ayril, yalnız bülten listesi) ve
 * pazarlama e-postalarının imzalı jetonu (/abonelik-iptal: bülten listesi ve
 * hesabın "İletişim Tercihleri" e-posta izni birlikte kapanır). Ayrılma yalnız
 * düğmeyle yapılır: bağlantıyı önceden açan e-posta tarayıcıları kişiyi
 * listeden düşürmesin.
 */
export type UnsubscribeKind = "newsletter" | "marketing"

const COPY: Record<UnsubscribeKind, { title: string; prompt: string; doneTitle: string; done: string }> = {
  newsletter: {
    title: "Bültenden ayrıl",
    prompt:
      "depremTek Market bülten e-postalarını artık almak istemiyorsanız aşağıdaki düğmeyle aboneliğinizi sonlandırın.",
    doneTitle: "Bültenden ayrıldınız",
    done:
      "Adresinize artık bülten e-postası göndermeyeceğiz. Fikrinizi değiştirirseniz sitenin alt kısmındaki formdan yeniden abone olabilirsiniz.",
  },
  marketing: {
    title: "E-posta aboneliğinden çık",
    prompt:
      "depremTek Market'in kampanya, bülten ve sepet hatırlatma e-postalarını artık almak istemiyorsanız aşağıdaki düğmeyle aboneliğinizi sonlandırın. Sipariş, kargo ve hesabınızla ilgili e-postalar gelmeye devam eder.",
    doneTitle: "Abonelikten çıktınız",
    done:
      "Adresinize artık kampanya, bülten ve sepet hatırlatma e-postası göndermeyeceğiz. Sipariş, kargo ve hesabınızla ilgili e-postalar gelmeye devam eder. Fikrinizi değiştirirseniz Hesabım › Profil sayfasındaki İletişim Tercihleri'nden e-posta iznini yeniden açabilirsiniz.",
  },
}

export default function UnsubscribeForm({ token, kind }: { token: string; kind: UnsubscribeKind }) {
  const copy = COPY[kind]
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(token ? null : "Abonelikten çıkma bağlantısı eksik.")
  const [pending, startTransition] = useTransition()

  const onConfirm = () =>
    startTransition(async () => {
      const r = kind === "marketing" ? await unsubscribeMarketing(token) : await unsubscribeNewsletter(token)
      if (r.success) setDone(true)
      else setError(r.error || "İşlem yapılamadı.")
    })

  const home = (
    <LocalizedClientLink href="/" className="text-brand-600 font-semibold hover:underline">
      Ana sayfaya dön
    </LocalizedClientLink>
  )

  if (done) {
    return (
      <>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{copy.doneTitle}</h1>
        <p className="text-gray-600 mb-6">{copy.done}</p>
        {home}
      </>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{copy.title}</h1>
      {error ? (
        <>
          <p className="text-gray-600 mb-6">{error}</p>
          {home}
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-6">{copy.prompt}</p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {pending ? "İşleniyor..." : "Abonelikten çık"}
          </button>
        </>
      )}
    </>
  )
}
