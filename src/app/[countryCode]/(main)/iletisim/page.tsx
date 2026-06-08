import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ContactForm from "./contact-form"

export const metadata: Metadata = {
  title: "İletişim | EKYP Deprem Market",
  description: "EKYP Deprem Market müşteri hizmetleri, telefon, adres ve iletişim bilgileri.",
}

export default async function IletisimPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = countryCode === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Contact Us
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Please contact us via phone at +90 (539) 574 19 04 or email at destek@ekyp.com.
          </p>
          <p>
            Managed by <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong>.
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
    <div className="content-container max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-3">
          Bizimle İletişime Geçin
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Sorularınız, önerileriniz veya kurumsal talepleriniz için aşağıdaki iletişim yollarından bize ulaşabilir ya da iletişim formunu doldurabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-ui-border-base p-6 rounded-xl bg-ui-bg-subtle shadow-sm">
            <div className="flex items-center gap-x-4 mb-4">
              <span className="text-2xl p-2 bg-red-50 text-red-650 rounded-lg">📞</span>
              <div>
                <h3 className="font-bold text-ui-fg-base text-sm">Müşteri Hizmetleri</h3>
                <p className="text-xs text-ui-fg-muted">Hafta içi 09:00 - 18:00</p>
              </div>
            </div>
            <a href="tel:+905395741904" className="text-ui-fg-base hover:text-red-600 font-semibold block text-base">
              +90 (539) 574 19 04
            </a>
          </div>

          <div className="border border-ui-border-base p-6 rounded-xl bg-ui-bg-subtle shadow-sm">
            <div className="flex items-center gap-x-4 mb-4">
              <span className="text-2xl p-2 bg-green-50 text-green-600 rounded-lg">💬</span>
              <div>
                <h3 className="font-bold text-ui-fg-base text-sm">Hızlı WhatsApp Destek</h3>
                <p className="text-xs text-ui-fg-muted">7/24 Mesaj Gönderebilirsiniz</p>
              </div>
            </div>
            <a 
              href="https://api.whatsapp.com/send?phone=905395741904" 
              target="_blank" 
              rel="noreferrer"
              className="text-ui-fg-base hover:text-green-600 font-semibold block text-base"
            >
              WhatsApp ile Bağlan &rarr;
            </a>
          </div>

          <div className="border border-ui-border-base p-6 rounded-xl bg-ui-bg-subtle shadow-sm">
            <div className="flex items-center gap-x-4 mb-4">
              <span className="text-2xl p-2 bg-blue-50 text-blue-600 rounded-lg">✉️</span>
              <div>
                <h3 className="font-bold text-ui-fg-base text-sm">E-Posta</h3>
                <p className="text-xs text-ui-fg-muted">En geç 24 saat içinde dönüş sağlanır</p>
              </div>
            </div>
            <a href="mailto:destek@ekyp.com" className="text-ui-fg-base hover:text-blue-600 font-semibold block text-base">
              destek@ekyp.com
            </a>
          </div>

          <div className="border border-ui-border-base p-6 rounded-xl bg-ui-bg-subtle shadow-sm">
            <div className="flex items-center gap-x-4 mb-3">
              <span className="text-2xl p-2 bg-amber-50 text-amber-600 rounded-lg">🏢</span>
              <div>
                <h3 className="font-bold text-ui-fg-base text-sm">Kurumsal Bilgiler</h3>
                <p className="text-xs text-ui-fg-muted">Resmi Ünvan</p>
              </div>
            </div>
            <p className="text-xs text-ui-fg-subtle leading-relaxed">
              <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong><br />
              İstanbul, Türkiye
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="lg:col-span-7 border border-ui-border-base p-6 sm:p-8 rounded-xl bg-ui-bg-subtle shadow-sm">
          <h2 className="text-xl font-bold text-ui-fg-base mb-6 border-b pb-3">İletişim Formu</h2>
          <ContactForm />
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
