import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import ResellerForm from "./reseller-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("dealershipFormTitle"),
    description: t("dealershipFormDescription"),
  }
}

const STEPS = [
  {
    no: "1",
    title: "Başvurun",
    desc: "Aşağıdaki formu doldurun. Verdiğiniz hizmetleri ve çalışma bölgenizi birkaç dakikada iletin.",
  },
  {
    no: "2",
    title: "Onay & Bayilik",
    desc: "Ekibimiz başvurunuzu inceler; onaylandığında hizmet ortağımız olursunuz.",
  },
  {
    no: "3",
    title: "Talepler Size Gelsin",
    desc: "Uygun müşteri taleplerini biz buluruz ve size yönlendiririz; süreci birlikte yürütürüz.",
  },
  {
    no: "4",
    title: "Hizmeti Verin & Kazanın",
    desc: "Hizmeti siz sunarsınız; tahsilat altyapısı bizde, hak edişiniz düzenli olarak hesabınıza aktarılır.",
  },
]

const BENEFITS = [
  {
    icon: "🤝",
    title: "Müşteriyi Biz Buluruz",
    desc: "Pazarlama ve talep toplama işini biz üstleniriz; siz uzmanlık ve hizmete odaklanırsınız.",
  },
  {
    icon: "📋",
    title: "Ortak Yürütme",
    desc: "Süreci sizinle ortak yürütürüz; keşiften teslime kadar altyapı ve koordinasyon desteği veririz.",
  },
  {
    icon: "📍",
    title: "Bölgesel Talep Akışı",
    desc: "Çalışma bölgenize ve uzmanlığınıza uygun hizmet taleplerini size düzenli olarak yönlendiririz.",
  },
  {
    icon: "🔒",
    title: "Güvenli Ödeme",
    desc: "Tahsilat ve ödeme güvenliği bizde; hizmet hak edişleriniz düzenli olarak hesabınıza aktarılır.",
  },
  {
    icon: "📈",
    title: "Marka Gücü & Güven",
    desc: "depremTek Market markasının güveniyle daha fazla müşteriye ve işe ulaşırsınız.",
  },
  {
    icon: "🛟",
    title: "Bayi Desteği",
    desc: "Başvurudan ilk işinize kadar her adımda ekibimiz yanınızda.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "'Bayimiz Ol' ile 'Firmamız Ol' arasındaki fark nedir?",
    answer:
      "Bayimiz Ol; ürün satmaktan çok HİZMET veren, bunu bizimle ortak yürüten iş ortakları içindir — müşteriyi biz bulur, size yönlendiririz. Firmamız Ol ise kendi mağazasını açıp ÜRÜN satan, hizmeti de kendi yürüten firmalar içindir (biz yalnızca ürün komisyonu alırız). Hizmet veriyorsanız Bayimiz Ol doğru seçenektir.",
  },
  {
    question: "Bayi (hizmet ortağı) olmak için neye ihtiyacım var?",
    answer:
      "Vergi mükellefiyeti (şahıs ya da limited/anonim şirket), geçerli bir vergi numarası, verdiğiniz hizmet alanı ve iletişim bilgileriniz yeterli. Onay sürecinde gerekli evraklar tarafınıza ayrıca iletilir.",
  },
  {
    question: "Müşteriyi gerçekten siz mi buluyorsunuz?",
    answer:
      "Evet. Pazarlama ve talep toplama tarafını biz üstleniriz; uzmanlığınıza ve bölgenize uygun hizmet taleplerini size yönlendiririz. Siz hizmeti vermeye odaklanırsınız.",
  },
  {
    question: "Komisyon/kazanç nasıl işliyor?",
    answer:
      "Yönlendirdiğimiz ve tamamladığınız hizmetlerden, başvurunuz onaylanırken netleştirilen koşullara göre komisyon alınır. Başvuru ve bayilik açılışı için ücret alınmaz.",
  },
  {
    question: "Ödemelerim ne zaman yapılır?",
    answer:
      "Hizmet tamamlanıp müşteri onayı alındıktan sonra, komisyon kesintisi düşülerek hak edişleriniz periyodik olarak banka hesabınıza aktarılır.",
  },
  {
    question: "Başvurum ne kadar sürede sonuçlanır?",
    answer:
      "Başvurular genellikle birkaç iş günü içinde değerlendirilir. Sonuç, başvuruda belirttiğiniz telefon veya e-posta üzerinden iletilir.",
  },
]

export default async function SaticiOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Become Our Service Partner
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Join depremTek Market as a service partner: you provide the service,
            we find you customers and route matching requests to you. To apply,
            please email us at destek@depremtek.market.
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
          depremTek Market Hizmet Ortaklığı (Bayilik) Programı
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          depremTek Market Bayimiz Olun
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Hizmetinizi bizimle ortak sunun. Siz uzmanlığınızı ve hizmetinizi
          sağlayın; uygun müşteri taleplerini biz bulup size yönlendirelim.
          Süreci birlikte yürütür, kazanmaya birlikte başlarız.
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
          Bayimiz Olursanız Ne Kazanırsınız?
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
              Bayilik (Hizmet Ortaklığı) Başvuru Formu
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Bilgilerinizi bırakın, hizmet ortaklığı için ekibimiz en kısa
              sürede dönüş yapsın.
            </p>
          </div>
          <ResellerForm />
        </div>
      </div>

      {/* SSS — sürecin nasıl işlediği */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Hizmet ortaklığı (bayilik) sürecinin nasıl işlediğine dair en çok
          merak edilenler.
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
