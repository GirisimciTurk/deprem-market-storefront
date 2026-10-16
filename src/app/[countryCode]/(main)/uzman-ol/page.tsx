import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { retrieveCustomer } from "@lib/data/customer"
import { getMyExpert } from "@lib/data/experts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import ExpertForm from "./expert-form"

export const metadata: Metadata = {
  title: "Uzman Ağına Katıl — Doğrulanmış Mühendis Dizini | depremTek Market",
  description:
    "İnşaat mühendisleri için doğrulanmış uzman dizini: uzman kartınızı açın, doğrulandıktan sonra bina risk tespiti, güçlendirme, statik proje ve daha fazlasında halkla buluşun.",
}

const STEPS = [
  {
    no: "1",
    title: "Giriş Yapın",
    desc: "depremTek Market hesabınızla giriş yapın; hesabınız yoksa birkaç saniyede üye olun.",
  },
  {
    no: "2",
    title: "Kartınızı Açın",
    desc: "Ad, telefon, konum ve uzmanlık alanlarınızı girin; kartınız hemen açılır.",
  },
  {
    no: "3",
    title: "Kartınızı Tamamlayın",
    desc: "Hesabım → Uzman Kartım'dan fotoğraf, hakkında yazısı, hizmet bölgeleri ve belgelerinizi ekleyin.",
  },
  {
    no: "4",
    title: "Doğrulama & Yayın",
    desc: "Ekibimiz belgelerinizi doğrulayınca kartınız 'doğrulanmış uzman' rozetiyle dizinde yayınlanır.",
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
    question: "Uzman kartı açmak ücretli mi?",
    answer:
      "Hayır. Kart açmak ve dizinde yer almak ücretsizdir; üyelik paketi ya da komisyon yoktur. Platform sizinle müşteri arasındaki sözleşmenin içine girmez.",
  },
  {
    question: "Kartım ne zaman yayınlanır?",
    answer:
      "Kartınız formu gönderdiğiniz anda açılır ve hemen düzenleyebilirsiniz; ancak dizinde görünmesi için ekibimizin doğrulaması gerekir. Doğrulama tamamlanınca kartınız yayına alınır, sonraki düzenlemeleriniz doğrudan yayına yansır.",
  },
  {
    question: "Hangi uzmanlık alanları var?",
    answer:
      "Bina Risk & Hasar Tespiti, Güçlendirme (Retrofit), Statik/Betonarme Proje, Zemin Etüdü & Geoteknik, Yapı Denetimi, Kentsel Dönüşüm Danışmanlığı ve Deprem Performans Analizi. Birden fazla alan seçebilirsiniz; her biri ayrı doğrulanır, sonradan eklediğiniz alanlar doğrulanana kadar 'inceleniyor' olarak görünür.",
  },
  {
    question: "Doğrulama nasıl yapılıyor?",
    answer:
      "Kartınıza diploma, oda (İMO) kaydı ve ilgili lisans/sertifikalarınızı yüklersiniz. Belgeler yalnız ekibimizce incelenir, profilinizde paylaşılmaz. Kartınız elle incelenip doğrulanmadan halka görünmez — dizinin güveni buna bağlı.",
  },
  {
    question: "Kaç bölgede hizmet verebilirim?",
    answer:
      "Ana konumunuza ek olarak en fazla 3 il/ilçe ekleyebilirsiniz. Bu sınır her uzman için aynıdır.",
  },
  {
    question: "Müşteriyle iletişim nasıl olacak?",
    answer:
      "Vatandaş sizi il/ilçe ve uzmanlık filtreleriyle bulur ve kartınızda göstermeyi seçtiğiniz kanaldan (telefon, WhatsApp, e-posta) ulaşır. Hangi bilginin görüneceğini kartınızdan siz belirlersiniz.",
  },
]

export default async function UzmanOlPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
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
            more. To create your expert card, please use the Turkish version
            of the site or email us at destek@depremtek.market.
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

  const customer = await retrieveCustomer().catch(() => null)
  if (customer) {
    // Müşteri başına tek kart: kartı olan doğrudan kartına gider.
    const { expert } = await getMyExpert()
    if (expert) redirect(`/${countryCode}/account/uzman-kartim`)
  }

  // Giriş sonrası bu sayfaya dönülür (yol sunucuda safeInternalPath ile doğrulanır).
  const loginHref = `/account?redirect=${encodeURIComponent(
    `/${countryCode}/uzman-ol#kart-ac`
  )}`

  return (
    <div className="content-container max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Doğrulanmış Uzman Dizini
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          İnşaat Mühendisi misiniz? Uzman Ağına Katılın
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Deprem Güvenliği Platformu, halkı doğrulanmış inşaat mühendisleriyle
          buluşturuyor. Doğrulanmış uzman rozetiyle dizinde yer alın, sizi arayan
          vatandaşlara görünün. Kart açmak ücretsiz; kartınız ekibimiz
          doğruladıktan sonra yayınlanır.
        </p>
        <div className="mt-6">
          <a
            href="#kart-ac"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 duration-200"
          >
            Uzman Kartı Aç
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

      {/* Kart açma */}
      <div id="kart-ac" className="scroll-mt-24 mb-16">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-ui-fg-base">
              Uzman Kartı Aç
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Kartınız hemen açılır; ekibimiz doğruladıktan sonra dizinde
              yayınlanır.
            </p>
          </div>
          {customer ? (
            <ExpertForm
              initial={{
                full_name: [customer.first_name, customer.last_name]
                  .filter(Boolean)
                  .join(" "),
                phone: customer.phone ?? "",
              }}
            />
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-ui-fg-subtle leading-relaxed">
                Uzman kartı, depremTek Market hesabınıza bağlanır: kartınızı
                daha sonra Hesabım → Uzman Kartım sayfasından düzenlersiniz.
                Devam etmek için giriş yapın ya da ücretsiz üye olun; ardından
                bu sayfaya geri dönersiniz.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <LocalizedClientLink
                  href={loginHref}
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-8 rounded-xl text-sm transition-colors shadow-sm"
                >
                  Giriş Yap
                </LocalizedClientLink>
                <LocalizedClientLink
                  href={`${loginHref}&view=register`}
                  className="w-full sm:w-auto border border-brand-600 text-brand-700 hover:bg-brand-50 font-bold py-2.5 px-8 rounded-xl text-sm transition-colors"
                >
                  Üye Ol
                </LocalizedClientLink>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SSS */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Uzman dizini ve uzman kartı hakkında en çok merak edilenler.
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
