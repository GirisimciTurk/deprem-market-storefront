import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import FirmaForm from "./firma-form"

export const metadata: Metadata = {
  title: "Firmamız Olun | depremTek Market",
  description:
    "Firmanızla depremTek Market kurumsal iş ortaklığı programına katılın: kurumsal tedarik, toplu alım ve çözüm ortaklığı fırsatları.",
}

const STEPS = [
  {
    no: "1",
    title: "Başvurun",
    desc: "Aşağıdaki formu doldurun. Firma bilgilerinizi ve iş birliği talebinizi birkaç dakikada iletin.",
  },
  {
    no: "2",
    title: "Değerlendirme",
    desc: "Kurumsal ekibimiz başvurunuzu inceler ve size en uygun iş birliği modelini belirler.",
  },
  {
    no: "3",
    title: "Görüşme & Anlaşma",
    desc: "Karşılıklı görüşüp iş birliği kapsamını, koşulları ve ticari şartları netleştiririz.",
  },
  {
    no: "4",
    title: "İş Ortaklığı Başlar",
    desc: "Anlaşma sonrası firma iş ortaklığınız devreye alınır; birlikte çalışmaya başlarız.",
  },
]

const BENEFITS = [
  {
    icon: "🏢",
    title: "Kurumsal İş Ortaklığı",
    desc: "Firmanızı depremTek Market ekosistemine kurumsal iş ortağı olarak dahil edin.",
  },
  {
    icon: "📦",
    title: "Kurumsal Tedarik & Toplu Alım",
    desc: "Kurumsal tedarik, toplu alım ve özel fiyatlandırma modelleriyle ölçekli çalışın.",
  },
  {
    icon: "🤝",
    title: "Çözüm Ortaklığı",
    desc: "Ürün ve mühendislik çözümlerinizi platformun müşteri kitlesiyle buluşturun.",
  },
  {
    icon: "📈",
    title: "Marka Gücü & Erişim",
    desc: "depremTek Market markasının güveni ve erişimiyle kurumsal görünürlüğünüzü artırın.",
  },
  {
    icon: "🔒",
    title: "Güvenli & Şeffaf Süreç",
    desc: "Sözleşme, faturalandırma ve ödeme süreçleri şeffaf ve güvenli şekilde yürütülür.",
  },
  {
    icon: "🎯",
    title: "Kurumsal Destek",
    desc: "Başvurudan iş birliğine kadar her adımda kurumsal ekibimiz yanınızda.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "'Firmamız Ol' ile 'Bayimiz Ol' arasındaki fark nedir?",
    answer:
      "Bayilik programı, ürünlerini platformda satmak isteyen satıcılar içindir. Firma iş ortaklığı ise kurumsal tedarik, toplu alım, çözüm/hizmet ortaklığı gibi daha geniş kurumsal iş birlikleri içindir. Hangisinin size uygun olduğundan emin değilseniz bu formu doldurun; ekibimiz doğru modele yönlendirir.",
  },
  {
    question: "Firma iş ortaklığı için neye ihtiyacım var?",
    answer:
      "Geçerli bir vergi mükellefiyeti (şahıs/limited/anonim şirket), firma iletişim bilgileri ve iş birliği talebinizin kısa bir özeti yeterlidir. Gerekli evraklar değerlendirme sürecinde tarafınıza ayrıca iletilir.",
  },
  {
    question: "Başvuru için ücret alınıyor mu?",
    answer:
      "Hayır. Başvuru ve değerlendirme süreci ücretsizdir. Ticari şartlar, iş birliği kapsamı netleştikten sonra karşılıklı olarak belirlenir.",
  },
  {
    question: "Başvurum ne kadar sürede sonuçlanır?",
    answer:
      "Başvurular genellikle birkaç iş günü içinde değerlendirilir. Sonuç, başvuruda belirttiğiniz telefon veya e-posta üzerinden iletilir.",
  },
]

export default async function FirmaOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Become a Partner Firm
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Partner your company with depremTek Market: corporate supply, bulk
            purchasing and solution partnership opportunities. To apply, please
            email us at destek@depremtek.market.
          </p>
          <div className="pt-8">
            <LocalizedClientLink
              href="/"
              className="text-brand-600 hover:underline font-semibold"
            >
              &larr; Return to Home Page
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          depremTek Market Kurumsal İş Ortaklığı Programı
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          Firmamız Olun
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Firmanızı Türkiye'nin afet ve acil durum hazırlık platformuyla
          buluşturun. Kurumsal tedarik, toplu alım ve çözüm ortaklığı
          modelleriyle depremTek Market ekosistemine katılın.
        </p>
        <div className="mt-6">
          <a
            href="#basvuru"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 duration-200"
          >
            Hemen Başvurun
          </a>
        </div>
      </div>

      {/* Nasıl çalışır? */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-8">
          Nasıl Çalışır?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="relative border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold text-lg mb-4">
                {s.no}
              </span>
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">
                {s.title}
              </h3>
              <p className="text-xs text-ui-fg-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Avantajlar */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-8">
          Firma İş Ortağımız Olursanız Ne Kazanırsınız?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{b.icon}</span>
              <h3 className="font-bold text-ui-fg-base text-sm mt-3 mb-1">
                {b.title}
              </h3>
              <p className="text-xs text-ui-fg-muted leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Başvuru formu */}
      <div id="basvuru" className="scroll-mt-24 mb-16">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-ui-fg-base">
              Firma İş Ortaklığı Başvuru Formu
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Firma bilgilerinizi bırakın, kurumsal ekibimiz en kısa sürede
              dönüş yapsın.
            </p>
          </div>
          <FirmaForm />
        </div>
      </div>

      {/* SSS */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Firma iş ortaklığı süreci hakkında en çok merak edilenler.
        </p>
        <FaqAccordion items={FAQS} defaultOpen={0} />
      </div>

      <div className="pt-8 border-t">
        <LocalizedClientLink
          href="/"
          className="text-brand-600 hover:underline font-semibold"
        >
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
