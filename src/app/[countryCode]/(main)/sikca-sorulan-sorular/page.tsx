import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"

const FAQS: FaqItem[] = [
  {
    question:
      "Deprem çantasının içeriği ne sıklıkla güncellenmeli veya kontrol edilmelidir?",
    answer:
      "Deprem çantası içerisindeki gıda malzemeleri, ilk yardım malzemeleri ve suyun son tüketim tarihleri ile pillerin şarj durumları en geç 6 ayda bir kontrol edilmelidir. Bozulmaya yüz tutmuş veya kullanım ömrünü tamamlamış malzemeler yenilenmelidir.",
  },
  {
    question: "Kargom ne zaman kargolanır ve ne kadar sürede elime ulaşır?",
    answer:
      "Hafta içi saat 15:00'e kadar verilen tüm siparişler aynı gün kargoya verilmektedir. İstanbul ve çevre illere teslimat genellikle 1-2 iş günü sürerken, diğer şehirlere teslimat 2-3 iş günü içerisinde gerçekleşmektedir.",
  },
  {
    question:
      "Toplu sipariş ve kurumlar için özel çanta içeriği hazırlıyor musunuz?",
    answer:
      "Evet! Okullar, şirketler, fabrikalar ve sivil toplum kuruluşları için özel logolu, adetli ve istenilen iç donanıma sahip deprem/ilk yardım çantaları tasarlayıp üretmekteyiz. Toplu/kurumsal sipariş talepleriniz için lütfen İletişim sayfamızdan bizimle iletişime geçin.",
  },
  {
    question:
      "Ürünlerinizin kalitesi ve sertifikaları hakkında bilgi alabilir miyim?",
    answer:
      "EKYP Deprem Market olarak satışa sunduğumuz tüm ilk yardım malzemeleri T.C. Sağlık Bakanlığı onaylıdır. Çantalarımız su geçirmez, yüksek mukavemetli yırtılmaz kumaşlardan üretilmekte olup; fener, düdük, radyo ve benzeri mekanik/teknolojik ürünlerimiz kalite sertifikalarına sahiptir.",
  },
  {
    question: "İptal, iade ve değişim süreçleri nasıl işlemektedir?",
    answer:
      "Tüketici Kanunu gereği satın aldığınız ürünü teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin iade edebilir veya değiştirebilirsiniz. İade edilecek ürünün kullanılmamış, kutusunun ve koruyucu ambalajlarının zarar görmemiş olması gerekmektedir.",
  },
  {
    question: "Hangi ödeme yöntemlerini destekliyorsunuz?",
    answer:
      "E-ticaret platformumuz üzerinden tüm bankaların kredi ve banka kartları ile 3D Secure güvenli ödeme altyapısıyla alışveriş yapabilirsiniz. Ayrıca alışverişlerinizde peşin fiyatına taksit veya havale/EFT seçeneklerimiz de mevcuttur.",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("faqTitle"),
    description: t("faqDescription"),
  }
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
            <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
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
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">Destek Merkezi</span>
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-2">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          EKYP Deprem Market'ten yapacağınız alışverişler ve deprem hazırlık malzemelerimiz ile ilgili en çok merak edilen konular.
        </p>
      </div>

      {/* Accordion Component */}
      <div className="space-y-4">
        <FaqAccordion items={FAQS} />
      </div>

      <div className="mt-12 p-6 bg-ui-bg-subtle border border-ui-border-base rounded-xl text-center">
        <h3 className="font-bold text-ui-fg-base text-base mb-1">Aradığınız cevabı bulamadınız mı?</h3>
        <p className="text-sm text-ui-fg-muted mb-4">
          Destek ekibimiz size yardımcı olmak için her zaman hazır.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <LocalizedClientLink 
            href="/iletisim" 
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
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
        <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
