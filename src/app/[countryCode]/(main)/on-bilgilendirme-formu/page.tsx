import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("preInfoTitle"),
    description: t("preInfoDescription"),
  }
}

export default async function PreliminaryInfoPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Preliminary Information Form
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            This preliminary info form outlines your rights regarding purchases on our storefront.
          </p>
          <p>
            Seller: <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong>.
          </p>
          <p>
            Please switch to Turkish to read the official regulatory terms.
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
      <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-2">
        Ön Bilgilendirme Formu
      </h1>
      <p className="text-ui-fg-muted mb-8 text-sm">Sipariş Öncesi Bilgilendirme Şartları</p>

      <div className="text-ui-fg-subtle space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="bg-ui-bg-subtle p-6 rounded-lg border border-ui-border-base mb-6 space-y-3">
          <h2 className="text-lg font-bold text-ui-fg-base">1. Satıcı Bilgileri</h2>
          <div className="text-sm">
            <p><strong>Unvan:</strong> DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</p>
            <p><strong>Adres:</strong> Karşıyaka Mah. 612 Cad. No:50, Gölbaşı/Ankara</p>
            <p><strong>Telefon:</strong> +90 850 241 70 00</p>
            <p><strong>E-posta:</strong> bilgi@girisimciturk.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">2. Sözleşme Konusu Ürün/Hizmetin Temel Nitelikleri ve Fiyatı</h2>
          <p>
            Sözleşme konusu mal veya hizmetin adı, miktarı, marka/modeli, rengi ve tüm vergiler dahil satış bedeli web sitemizde ve sipariş özeti ekranında belirtildiği gibidir. ALICI, sipariş vererek bu bedeli ödeme yükümlülüğü altına girdiğini kabul eder.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">3. Teslimat ve Kargo Bilgileri</h2>
          <p>
            Sipariş konusu ürünler, sipariş onayından itibaren yasal 30 günlük süreyi aşmamak koşulu ile ALICI'nın bildirdiği adrese gönderilir. Kargo ücreti ve teslimat şartları sipariş esnasında ALICI'ya sunulur ve onayına tabi tutulur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">4. Cayma Hakkı</h2>
          <p>
            ALICI, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma hakkı kullanımı durumunda iade kargo bedeli, SATICI'nın anlaşmalı olduğu kargo firması kullanıldığı takdirde SATICI tarafından karşılanır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">5. Şikayet ve İtirazlar</h2>
          <p>
            Tüketiciler şikayet ve itirazlarını, Gümrük ve Ticaret Bakanlığı tarafından her yıl belirlenen parasal sınırlar dahilinde, tüketicinin mal veya hizmeti satın aldığı veya ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetine veya Tüketici Mahkemesine yapabilirler.
          </p>
        </section>

        <div className="pt-8 border-t">
          <LocalizedClientLink href="/" className="text-rose-600 hover:underline font-semibold">
            &larr; Ana Sayfaya Dön
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
