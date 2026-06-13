import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ResellerForm from "./reseller-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("dealershipFormTitle"),
    description: t("dealershipFormDescription"),
  }
}

export default async function BayilikPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          B2B & Dealership Application
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Please email us at destek@ekyp.com for wholesale and corporate dealership inquiries.
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
    <div className="content-container max-w-5xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Banner / Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-red-650 text-xs font-semibold tracking-wider uppercase bg-red-50 px-3 py-1 rounded-full border border-red-100">B2B Ortaklık</span>
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          Bayilik ve Kurumsal Satış Başvurusu
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Afet ekipmanlarının ve deprem hazırlık kitlerinin dağıtımında, toptan satışında veya kurumsal tedarik süreçlerinde bizimle çalışmak ister misiniz? Başvuru formunu doldurarak ilk adımı atın.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Why partner with us? */}
        <div className="lg:col-span-5 border border-ui-border-base p-6 sm:p-8 rounded-xl bg-ui-bg-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-ui-fg-base mb-6 border-b pb-3">Neden EKYP Bayisi Olmalısınız?</h2>
            
            <ul className="space-y-5">
              <li className="flex gap-x-3">
                <span className="text-xl flex-shrink-0">🚀</span>
                <div>
                  <h4 className="font-bold text-ui-fg-base text-sm">Geniş Ürün Yelpazesi</h4>
                  <p className="text-xs text-ui-fg-muted mt-0.5">Deprem çantalarından profesyonel fenerlere ve ilk yardım kitlerine kadar zengin envanter.</p>
                </div>
              </li>
              <li className="flex gap-x-3">
                <span className="text-xl flex-shrink-0">💰</span>
                <div>
                  <h4 className="font-bold text-ui-fg-base text-sm">Yüksek Kar Marjı</h4>
                  <p className="text-xs text-ui-fg-muted mt-0.5">Toptan alımlarda özel iskonto oranları ve cazip kâr imkanları.</p>
                </div>
              </li>
              <li className="flex gap-x-3">
                <span className="text-xl flex-shrink-0">📦</span>
                <div>
                  <h4 className="font-bold text-ui-fg-base text-sm">Hızlı ve Güvenilir Sevkiyat</h4>
                  <p className="text-xs text-ui-fg-muted mt-0.5">Yüksek adetli siparişlerin bile zamanında teslimat garantisiyle sevk edilmesi.</p>
                </div>
              </li>
              <li className="flex gap-x-3">
                <span className="text-xl flex-shrink-0">🛠️</span>
                <div>
                  <h4 className="font-bold text-ui-fg-base text-sm">B2B Özel Destek Hattı</h4>
                  <p className="text-xs text-ui-fg-muted mt-0.5">Kurumsal temsilcilerimiz ile sipariş ve ürün özelleştirme süreçlerinde kesintisiz destek.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-ui-border-base text-xs text-ui-fg-muted">
            Başvurunuz alındıktan sonra ekibimiz 2 iş günü içerisinde sizinle iletişime geçecektir.
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-7 border border-ui-border-base p-6 sm:p-8 rounded-xl bg-ui-bg-subtle">
          <h2 className="text-lg font-bold text-ui-fg-base mb-6 border-b pb-3">Başvuru Formu</h2>
          <ResellerForm />
        </div>
      </div>

      <div className="pt-12 border-t mt-12">
        <LocalizedClientLink href="/" className="text-rose-600 hover:underline font-semibold">
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
