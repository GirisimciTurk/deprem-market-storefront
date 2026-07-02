import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import CollapsibleSection from "@modules/common/components/collapsible-section"
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
      {/* Hero (sade) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ui-fg-base tracking-tight">
          Türkiye Deprem Sektörü Bayi Ağımıza
          <span className="block mt-2 font-serif italic font-medium text-brand-600 text-3xl sm:text-4xl">
            Hoş Geldiniz
          </span>
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed mt-4">
          Deprem ile ilgili hizmet veren işletmenizi tek tıkla ücretsiz
          kaydedin. Uygun müşteri taleplerini biz bulup size yönlendirelim.
        </p>
      </div>

      {/* Başvuru formu — en üstte */}
      <div id="basvuru" className="scroll-mt-24 mb-10">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <ResellerForm />
        </div>
      </div>

      {/* Bilgi bölümleri — açılır kartlar */}
      <div className="max-w-3xl mx-auto space-y-4 mb-12">
        <CollapsibleSection
          title="Nasıl Çalışır?"
          subtitle="4 adımda hizmet ortağımız olun"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CollapsibleSection>

        <CollapsibleSection
          title="Bayimiz Olursanız Ne Kazanırsınız?"
          subtitle="Avantajlarınız"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CollapsibleSection>

        <CollapsibleSection
          title="Sıkça Sorulan Sorular"
          subtitle="Hizmet ortaklığı (bayilik) süreci hakkında en çok merak edilenler"
        >
          <FaqAccordion items={FAQS} defaultOpen={null} />
        </CollapsibleSection>
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
