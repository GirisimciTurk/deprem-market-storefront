import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import ExpertForm from "../uzman-ol/expert-form"

export const metadata: Metadata = {
  title: "Uygulayıcı / Yüklenici Ağına Katıl — Güçlendirme & İnşaat | Deprem Market",
  description:
    "Güçlendirme, inşaat ve deprem güvenliği işlerinin fiziki uygulayıcısı mısınız? Doğrulanmış uygulayıcı dizinine ön kayıt olun, sizi arayan vatandaşlara ulaşın.",
}

const STEPS = [
  {
    no: "1",
    title: "Ön Kayıt",
    desc: "Aşağıdaki formu doldurun; uygulama alanlarınızı ve hizmet bölgenizi belirtin.",
  },
  {
    no: "2",
    title: "Belge & Doğrulama",
    desc: "Yetki belgesi, vergi mükellefiyeti ve geçmiş iş referanslarınızı isteriz; doğrularız.",
  },
  {
    no: "3",
    title: "Onay & Yayın",
    desc: "Profiliniz onaylanınca 'doğrulanmış uygulayıcı' rozetiyle dizinde yayınlanır.",
  },
  {
    no: "4",
    title: "İşle Buluşun",
    desc: "Mühendisin tasarladığı güçlendirme/inşaat işini sahada uygulamak için sizi arayan vatandaşa ve mühendislere görünür olun.",
  },
]

const BENEFITS = [
  {
    icon: "🏗️",
    title: "İş & Proje Akışı",
    desc: "Güçlendirme ve inşaat işi arayan vatandaşlara ve mühendislere doğrudan görünürsünüz.",
  },
  {
    icon: "✅",
    title: "Doğrulanmış Uygulayıcı Rozeti",
    desc: "Belge ve referans doğrulamasıyla ehliyetsiz/merdiven altı firmalardan ayrışın.",
  },
  {
    icon: "🤝",
    title: "Mühendisle İş Birliği",
    desc: "Tespit/proje yapan mühendislerle eşleşin; tasarımı siz sahada hayata geçirin.",
  },
  {
    icon: "📍",
    title: "Bölge & Uzmanlık Eşleşmesi",
    desc: "Hizmet verdiğiniz il/ilçe ve uygulama alanlarınıza göre listelenirsiniz.",
  },
  {
    icon: "🪪",
    title: "Hazır Dijital Vitrin",
    desc: "Geçmiş işlerinizi sergileyebileceğiniz, paylaşılabilir bir firma profili.",
  },
  {
    icon: "📈",
    title: "İtibar & Görünürlük",
    desc: "Deprem Market'in güveniyle güçlendirme/inşaat işlerinde öne çıkın.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "Mühendis ile uygulayıcı arasındaki fark nedir?",
    answer:
      "İnşaat mühendisi 'beyin'dir: binayı değerlendirir, risk tespiti yapar ve güçlendirme/statik projeyi tasarlar. Uygulayıcı/yüklenici ise 'eller'dir: bu projeyi sahada fiziken hayata geçirir (güçlendirme uygulaması, inşaat, çelik/karbon fiber işçiliği vb.). Platform ikisini de ayrı dizinlerde, doğrulanmış olarak buluşturur.",
  },
  {
    question: "Uygulayıcı olarak nasıl katılırım?",
    answer:
      "“Uygulayıcı Ol” formunu doldurmanız yeterli. Uygulama alanlarınızı (güçlendirme, çelik/karbon fiber, temel-perde, inşaat vb.), hizmet bölgenizi ve iletişim bilgilerinizi belirtirsiniz. Ön kayıt ücretsiz ve taahhütsüzdür.",
  },
  {
    question: "Profilim doğrulama olmadan yayınlanır mı?",
    answer:
      "Hayır. Ön Kayıt → Belge (yetki belgesi, vergi mükellefiyeti, iş referansları) → İnceleme → Onay → Yayın. Onaylanmadan profiliniz halka görünmez; tek bir ehliyetsiz/sahte profil tüm dizinin güvenini bozar.",
  },
  {
    question: "Hangi uygulama alanları var?",
    answer:
      "Güçlendirme Uygulaması (Retrofit), Karbon Fiber/FRP, Çelik Güçlendirme, Temel & Perde/Mantolama, İnşaat/Kaba Yapım, Zemin İyileştirme, Yıkım & Hafriyat, Tadilat & Onarım. Birden fazla alan seçebilirsiniz; her biri ayrı doğrulanır.",
  },
  {
    question: "Ürün de satabilir miyim?",
    answer:
      "Bu dizin hizmet/uygulama içindir; ürün satışı platformda Deprem Market mağazası üzerinden yürür. Siz fiziki uygulama (işçilik/proje) tarafında yer alırsınız.",
  },
]

export default async function UygulayiciOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Join Our Verified Contractor Network
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            We are building a directory of verified implementers/contractors for
            retrofitting and construction works. To pre-register, please email us
            at destek@ekyp.com.
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
    <div className="content-container max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Doğrulanmış Uygulayıcı Dizini · Ön Kayıt
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          Güçlendirme & İnşaat Uygulayıcısı mısınız?
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Mühendisin tasarladığı işi sahada hayata geçiren uygulayıcı/yüklenici
          ağına katılın. Doğrulanmış uygulayıcı rozetiyle dizinde yer alın, sizi
          arayan vatandaşlara ve mühendislere görünür olun. Ön kayıt ücretsiz ve
          taahhütsüz.
        </p>
        <div className="mt-6">
          <a
            href="#onkayit"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 duration-200"
          >
            Hemen Ön Kayıt Ol
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
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-ui-fg-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avantajlar */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-8">
          Uygulayıcı Ağında Yer Alırsanız Ne Kazanırsınız?
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
              <p className="text-xs text-ui-fg-muted leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ön kayıt formu */}
      <div id="onkayit" className="scroll-mt-24 mb-16">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-ui-fg-base">
              Uygulayıcı Ön Kayıt Formu
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Bilgilerinizi bırakın, ekibimiz doğrulama ve sonraki adımlar için
              dönüş yapsın.
            </p>
          </div>
          <ExpertForm providerType="implementer" />
        </div>
      </div>

      {/* SSS */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Uygulayıcı dizini ve ön kayıt hakkında en çok merak edilenler.
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
