import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"

export const metadata: Metadata = {
  title: "Uzman Ağına Katıl — İnşaat Mühendisi Dizini",
  description:
    "İnşaat mühendisleri için ücretsiz uzman dizini. Profilinizi oluşturun; bina risk tespiti, güçlendirme, statik proje ve daha fazlasında sizi arayanlarla buluşun.",
}

// Profil hesap panelinde (Uzman Profilim) yazılır; oturumu olmayan ziyaretçi
// aynı adreste giriş/üyelik formunu görür ve girince panele düşer.
const PANEL = "/account/uzman-profilim"

const STEPS = [
  {
    no: "1",
    title: "Profilinizi Oluşturun",
    desc: "Üye olun, hesabınızdaki “Uzman Profilim” sayfasında uzmanlık alanlarınızı, hizmet bölgenizi ve iletişim bilgilerinizi girin.",
  },
  {
    no: "2",
    title: "Yayınlayın",
    desc: "Bilgilerinizin doğruluğunu beyan edip yayınlayın. Kartınız otomatik olarak kontrol edilir; uygun bulunursa hemen dizine girer.",
  },
  {
    no: "3",
    title: "Doğrulanmış Rozeti",
    desc: "Diploma ve oda kaydınızı ekibimize iletin; incelendikten sonra profilinize “Doğrulanmış” rozeti eklenir.",
  },
  {
    no: "4",
    title: "Talepleri Karşılayın",
    desc: "Sizi il ve uzmanlığa göre bulan vatandaşlar doğrudan ulaşır ya da talep bırakır; talepler panelinize düşer.",
  },
]

const BENEFITS = [
  {
    icon: "✅",
    title: "Doğrulanmış Uzman Rozeti",
    desc: "Diploma ve oda kaydınız incelenince profilinize rozet eklenir; doğrulanmış profiller dizinde öne çıkar.",
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
    question: "Profilim ne zaman yayına girer?",
    answer:
      "Yayınla dediğiniz anda kartınız otomatik olarak kontrol edilir (reklam, uygunsuz içerik, konu dışı kart gibi). Uygun bulunan kart hemen dizinde görünür. Kontrol emin olamazsa kartınız ekibimizin incelemesine gider; reddedilirse gerekçesini panelinizde görür, düzeltip yeniden yayınlarsınız.",
  },
  {
    question: "Hangi uzmanlık alanları var?",
    answer:
      "Bina Risk & Hasar Tespiti, Güçlendirme (Retrofit), Statik/Betonarme Proje, Zemin Etüdü & Geoteknik, Yapı Denetimi, Kentsel Dönüşüm Danışmanlığı ve Deprem Performans Analizi. Birden fazla alan seçebilirsiniz.",
  },
  {
    question: "“Doğrulanmış” rozeti nasıl alınır?",
    answer:
      "Profilinizdeki bilgiler sizin beyanınızdır. Diploma, oda (İMO) kaydı ve ilgili belgelerinizi ekibimize ilettiğinizde elle incelenir; uygun bulunursa profilinize “Doğrulanmış” rozeti eklenir. Adınızı, odanızı ya da sicil numaranızı değiştirirseniz rozet yeniden inceleme için düşer.",
  },
  {
    question: "Uzman olmak ücretli mi?",
    answer:
      "Hayır. Dizinde yer almak ücretsizdir; üyelik paketi ya da komisyon yoktur. Platform sizinle müşteri arasındaki sözleşmenin içine girmez.",
  },
  {
    question: "Müşteriyle iletişim nasıl olacak?",
    answer:
      "Vatandaş sizi il ve uzmanlığa göre bulur, belirttiğiniz kanaldan (telefon, WhatsApp, e-posta) ulaşır. İsterseniz iletişim bilgilerinizi gizleyip yalnız “Talep Bırak” formuyla talep alabilirsiniz; talepler panelinize ve e-postanıza düşer.",
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
          İnşaat Mühendisi Dizini · Ücretsiz
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          İnşaat Mühendisi misiniz? Uzman Ağına Katılın
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Deprem Güvenliği Platformu, binasını değerlendirmek isteyenleri inşaat
          mühendisleriyle buluşturuyor. Profilinizi oluşturun, sizi arayan
          vatandaşlara görünün. Ücretsiz ve taahhütsüz.
        </p>
        <div className="mt-6">
          <LocalizedClientLink
            href={PANEL}
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 duration-200"
          >
            Profilimi Oluştur
          </LocalizedClientLink>
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

      {/* Panele yönlendirme */}
      <div id="onkayit" className="scroll-mt-24 mb-16">
        <div className="max-w-2xl mx-auto border border-brand-100 rounded-2xl bg-brand-50 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-extrabold text-ui-fg-base">Profilinizi 5 dakikada oluşturun</h2>
          <p className="text-sm text-ui-fg-muted mt-2 mb-5">
            Profiliniz hesabınızdaki “Uzman Profilim” sayfasında hazırlanır; dilediğiniz zaman
            düzenler, yayından alırsınız. Gelen talepleri ve değerlendirmeleri de oradan yönetirsiniz.
          </p>
          <LocalizedClientLink
            href={PANEL}
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors shadow-sm"
          >
            Uzman Profilime Git →
          </LocalizedClientLink>
          <p className="text-xs text-ui-fg-muted mt-3">Hesabınız yoksa aynı sayfadan ücretsiz üye olabilirsiniz.</p>
        </div>
      </div>

      {/* SSS */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Uzman dizini ve profil hakkında en çok merak edilenler.
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
