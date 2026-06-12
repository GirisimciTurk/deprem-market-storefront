import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion from "./faq-accordion"

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | EKYP Deprem Market",
  description: "Sipariş, kargo, ödeme, teslimat ve deprem çantaları hakkında en çok sorulan sorular ve yanıtları.",
}

export default async function SikcaSorulanSorularPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Frequently Asked Questions
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Please check our FAQ in Turkish for detailed questions or contact us directly at destek@ekyp.com.
          </p>
          <div className="pt-8">
            <LocalizedClientLink href="/" className="text-rose-600 hover:underline font-semibold">
              &larr; Return to Home Page
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-red-650 text-xs font-semibold tracking-wider uppercase bg-red-50 px-3 py-1 rounded-full border border-red-100">Destek Merkezi</span>
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-2">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          EKYP Deprem Market'ten yapacağınız alışverişler ve deprem hazırlık malzemelerimiz ile ilgili en çok merak edilen konular.
        </p>
      </div>

      {/* Accordion Component */}
      <div className="space-y-4">
        <FaqAccordion />
      </div>

      <div className="mt-12 p-6 bg-ui-bg-subtle border border-ui-border-base rounded-xl text-center">
        <h3 className="font-bold text-ui-fg-base text-base mb-1">Aradığınız cevabı bulamadınız mı?</h3>
        <p className="text-sm text-ui-fg-muted mb-4">
          Destek ekibimiz size yardımcı olmak için her zaman hazır.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <LocalizedClientLink 
            href="/iletisim" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            Bize Yazın
          </LocalizedClientLink>
          <a 
            href="https://api.whatsapp.com/send?phone=905395741904"
            target="_blank"
            rel="noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            WhatsApp Destek
          </a>
        </div>
      </div>

      <div className="pt-8 border-t mt-12">
        <LocalizedClientLink href="/" className="text-rose-600 hover:underline font-semibold">
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
