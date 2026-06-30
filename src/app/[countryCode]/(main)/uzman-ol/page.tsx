import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import ExpertForm from "./expert-form"

export const metadata: Metadata = {
  title: "Uzman Ağına Katıl — Doğrulanmış Mühendis Dizini | depremTek Market",
  description:
    "İnşaat mühendisleri için doğrulanmış uzman dizinine ön kayıt. Bina risk tespiti, güçlendirme, statik proje ve daha fazlasında halkla buluşun.",
}

const STEPS = [
  {
    no: "1",
    title: "Ön Kayıt",
    desc: "Aşağıdaki formu doldurun; uzmanlık alanlarınızı ve hizmet bölgenizi belirtin.",
  },
  {
    no: "2",
    title: "Belge & Doğrulama",
    desc: "Diploma, oda kaydı ve lisanslarınızı isteriz; her uzmanlık ayrı doğrulanır.",
  },
  {
    no: "3",
    title: "Onay & Yayın",
    desc: "Profiliniz onaylanınca 'doğrulanmış uzman' rozetiyle dizinde yayınlanır.",
  },
  {
    no: "4",
    title: "Halkla Buluşun",
    desc: "İl/ilçe ve uzmanlık filtreleriyle sizi arayan vatandaşlar size ulaşır.",
  },
]

const BENEFITS = [
  {
    icon: "✅",
    title: "Doğrulanmış Uzman Rozeti",
    desc: "Belge bazlı doğrulama (İMO üyeliği, lisanslar) ile sahte/ehliyetsizden ayrışın; güven kazanın.",
  },
  {
    icon: "🪪",
    title: "Hazır Dijital Vitrin",
    desc: "Paylaşabileceğiniz temiz bir uzman profili — kartvizit yerine tek link.",
  },
  {
    icon: "🎯",
    title: "Doğru Müşteri",
    desc: "Güçlendirme, kentsel dönüşüm, hasar tespiti gibi ciddi işler için sizi arayanlara görünün.",
  },
  {
    icon: "📍",
    title: "Bölge & Uzmanlık Eşleşmesi",
    desc: "Hizmet verdiğiniz il/ilçe ve uzmanlık alanlarınıza göre listelenirsiniz.",
  },
  {
    icon: "🔒",
    title: "İletişim Kontrolü Sizde",
    desc: "Müşteriyle nasıl iletişim kuracağınızı siz belirlersiniz; gizliliğiniz korunur.",
  },
  {
    icon: "📈",
    title: "İtibar & Görünürlük",
    desc: "depremTek Market'in güveni ve içerik motoruyla uzmanlığınızı geniş kitleye duyurun.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "Bu ön kayıt beni neye bağlar?",
    answer:
      "Hiçbir ücret veya taahhüt yok. Bu, doğrulanmış uzman dizinimize ilgi/ön kayıt aşamasıdır. Amacımız mühendislerin beklentilerini öğrenip dizini birlikte şekillendirmek. Onay ve belge doğrulaması ayrı bir adımdır.",
  },
  {
    question: "Hangi uzmanlık alanları var?",
    answer:
      "Bina Risk & Hasar Tespiti, Güçlendirme (Retrofit), Statik/Betonarme Proje, Zemin Etüdü & Geoteknik, Yapı Denetimi, Kentsel Dönüşüm Danışmanlığı ve Deprem Performans Analizi. Birden fazla alan seçebilirsiniz; her biri ayrı doğrulanır.",
  },
  {
    question: "Doğrulama nasıl yapılıyor?",
    answer:
      "Onay sürecinde diploma, oda (İMO) kaydı ve ilgili lisans/sertifikalarınızı isteriz. Profiliniz, belgeleriniz elle incelenip onaylanmadan halka görünmez — dizinin güveni buna bağlı.",
  },
  {
    question: "Üyelik ücreti var mı?",
    answer:
      "Şu an ön kayıt tamamen ücretsizdir. İleride dizinde yer almak ve öne çıkmak için katmanlı bir üyelik planlanıyor; detaylar netleştiğinde sizinle paylaşılacak. İşlem/komisyon altyapısı yoktur, platform sözleşmenin içine girmez.",
  },
  {
    question: "Müşteriyle iletişim nasıl olacak?",
    answer:
      "Başlangıçta dizin 'pasif' çalışır: vatandaş sizi filtreleyip bulur ve belirttiğiniz kanaldan ulaşır. İlerleyen aşamada telefonunuzu gizli tutabileceğiniz 'talep bırak' formu da eklenecek.",
  },
]

export default async function UzmanOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Join Our Verified Engineer Directory
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            We are building a directory of verified civil engineers for
            earthquake risk assessment, retrofitting, structural design and
            more. To pre-register, please email us at destek@depremtek.market.
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
          Doğrulanmış Uzman Dizini · Ön Kayıt
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          İnşaat Mühendisi misiniz? Uzman Ağına Katılın
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Deprem Güvenliği Platformu, halkı doğrulanmış inşaat mühendisleriyle
          buluşturuyor. Doğrulanmış uzman rozetiyle dizinde yer alın, sizi arayan
          vatandaşlara görünün. Ön kayıt ücretsiz ve taahhütsüz — fikirleriniz
          dizini şekillendirecek.
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
          Uzman Ağında Yer Alırsanız Ne Kazanırsınız?
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

      {/* Ön kayıt formu */}
      <div id="onkayit" className="scroll-mt-24 mb-16">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-ui-fg-base">
              Uzman Ön Kayıt Formu
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Bilgilerinizi bırakın, ekibimiz doğrulama ve sonraki adımlar için
              dönüş yapsın.
            </p>
          </div>
          <ExpertForm />
        </div>
      </div>

      {/* SSS */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Uzman dizini ve ön kayıt hakkında en çok merak edilenler.
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
