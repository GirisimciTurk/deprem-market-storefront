import { Metadata } from "next"

import { getMyExpert } from "@lib/data/experts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ExpertCardEditor from "./expert-card-editor"

export const metadata: Metadata = {
  title: "Uzman Kartım",
  description:
    "Uzman kartınızı düzenleyin; kartınız ekibimiz doğruladıktan sonra uzman dizininde yayınlanır.",
}

export default async function UzmanKartimPage() {
  const { expert, error } = await getMyExpert()

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          🪪 Uzman Kartım
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Doğrulanmış uzman dizinindeki kartınız: bilgilerinizi, iletişim
          tercihlerinizi, hizmet bölgelerinizi ve doğrulama belgelerinizi buradan
          yönetin.
        </p>
      </div>

      {expert ? (
        <ExpertCardEditor expert={expert} />
      ) : error ? (
        <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-6 text-sm text-ui-fg-subtle">
          Uzman kartınız şu an yüklenemedi. Lütfen sayfayı yenileyin; sorun
          sürerse bizimle iletişime geçin.
        </div>
      ) : (
        <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-8 text-center space-y-3">
          <p className="text-3xl">🪪</p>
          <h2 className="text-lg font-extrabold text-ui-fg-base">
            Henüz bir uzman kartınız yok
          </h2>
          <p className="text-sm text-ui-fg-muted max-w-md mx-auto">
            İnşaat mühendisiyseniz birkaç bilgiyle kartınızı hemen açın. Kartınız
            ekibimiz doğruladıktan sonra uzman dizininde yayınlanır.
          </p>
          <LocalizedClientLink
            href="/uzman-ol"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            Uzman Kartı Aç →
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
